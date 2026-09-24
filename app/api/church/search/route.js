import { searchChurches, searchChurchesWithinRadius } from '../../../services/churchService';
import { logger } from '../../../../utils/logger';
import { encrypt } from '../../../../utils/helpers';
import { NextResponse } from 'next/server';

const parseCoordinate = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMediaUrl = (value) => (typeof value === 'string' ? value.trim() : '');

// Public search returns church identity only. Notification artwork and the
// pastor portrait are deliberately read just long enough to detect legacy
// records where an older save flow copied one into the root banner field;
// neither nested object is ever included in the response.
const withExternalId = (churches) =>
  churches.map((church) => {
    const churchObj = typeof church.toObject === 'function' ? church.toObject() : church;
    const bannerUrl = normalizeMediaUrl(churchObj.secure_url);
    const notificationUrl = normalizeMediaUrl(churchObj.notification?.secure_url);
    const pastorUrl = normalizeMediaUrl(churchObj.pastor_section?.secure_url);
    const bannerIsLegacyNestedImage = Boolean(bannerUrl && (bannerUrl === notificationUrl || bannerUrl === pastorUrl));

    return {
      _id: churchObj._id,
      externalId: encrypt(churchObj._id?.toString()),
      name: churchObj.name,
      email: churchObj.email,
      mobile: churchObj.mobile,
      description: churchObj.description,
      short_message: churchObj.short_message,
      secure_url: bannerIsLegacyNestedImage ? '' : bannerUrl,
      public_id: bannerIsLegacyNestedImage ? '' : churchObj.public_id,
      logo_url: normalizeMediaUrl(churchObj.logo_url),
      logo_id: churchObj.logo_id,
      denomination: churchObj.denomination,
      theme_id: churchObj.theme_id,
      facebook_url: churchObj.facebook_url,
      instagram_url: churchObj.instagram_url,
      youtube_url: churchObj.youtube_url,
      address: churchObj.address
    };
  });

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'search') {
      const searchQuery = url.searchParams.get('searchQuery');

      if (!searchQuery?.trim()) {
        return NextResponse.json({ success: false, error: 'searchQuery is required' }, { status: 400 });
      }

      const data = await searchChurches(searchQuery);
      return NextResponse.json({ data: withExternalId(data), success: true });
    }

    if (action === 'radius') {
      const latitude = parseCoordinate(url.searchParams.get('latitude'));
      const longitude = parseCoordinate(url.searchParams.get('longitude'));
      const radius = parseCoordinate(url.searchParams.get('radius'));

      if (latitude === null || longitude === null || radius === null || radius <= 0) {
        return NextResponse.json(
          { success: false, error: 'latitude, longitude, and radius must be valid numbers' },
          { status: 400 }
        );
      }

      const data = await searchChurchesWithinRadius(latitude, longitude, radius);
      return NextResponse.json({ data: withExternalId(data), success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
