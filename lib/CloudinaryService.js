import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUD_SECRETE
});

/**
 * Single source of truth for every Cloudinary upload/replace/delete used
 * across the app (Events, Sliders, Pastor, About Us / Church Logo, ...).
 *
 * Every method that talks to Cloudinary for a *delete* never throws — a
 * failed cleanup should never block or crash a create/edit/delete request.
 * Upload failures DO throw, since a request that was supposed to attach an
 * image but silently didn't is a bug users won't notice until much later.
 */
class CloudinaryService {
  /**
   * Uploads a single File/Blob (as pulled off multipart FormData) to
   * Cloudinary and returns { secure_url, public_id }.
   *
   * Returns null (does nothing) when no file is given, so callers can do
   * `const uploaded = await CloudinaryService.uploadImage(file, opts);`
   * and treat "no file selected" and "upload skipped" identically.
   */
  static async uploadImage(file, { folder, resourceType = 'auto' } = {}) {
    if (!file) return null;

    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: resourceType,
      invalidate: true
    });

    return { secure_url: result.secure_url, public_id: result.public_id };
  }

  /**
   * Deletes an image from Cloudinary by public_id. Swallows and logs any
   * failure instead of throwing, so a Cloudinary outage or an
   * already-deleted asset never blocks the caller's edit/delete flow.
   */
  static async deleteImage(publicId) {
    if (!publicId) {
      return { success: true, skipped: true };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      // Cloudinary reports 'ok' on success and 'not found' when the asset is
      // already gone - both mean "there is nothing left to orphan", so both
      // count as success for our purposes.
      const success = result?.result === 'ok' || result?.result === 'not found';

      if (!success) {
        logger.error({ publicId, result }, 'Cloudinary image deletion did not confirm success');
      }

      return { success, result: result?.result };
    } catch (error) {
      logger.error(error, `Failed to delete Cloudinary image ${publicId}`);
      return { success: false, error };
    }
  }

  /**
   * The EDIT lifecycle in one call:
   *  - no file selected -> returns null; caller keeps the existing
   *    secure_url/public_id untouched (CASE 1).
   *  - a file was selected -> deletes oldPublicId (if any, best-effort),
   *    uploads the new file, and returns its { secure_url, public_id }
   *    for the caller to persist (CASE 2). There is never a point where
   *    both the old and new image exist in Cloudinary at once.
   */
  static async replaceImage(file, oldPublicId, options) {
    if (!file) return null;

    if (oldPublicId) {
      await CloudinaryService.deleteImage(oldPublicId);
    }

    return CloudinaryService.uploadImage(file, options);
  }
}

export default CloudinaryService;
