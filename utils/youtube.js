/**
 * Reusable YouTube helpers - extracting a video id from whatever URL shape
 * an admin pastes into the Sermon form's YouTube URL field, and deriving
 * a thumbnail image URL from it. Used by services/sermonService.js so a
 * sermon's thumbnail is always DERIVED, never a field the admin has to
 * fill in themselves (see app/protected/church/sermons/renderOffcanvas.jsx,
 * which no longer has a Thumbnail URL input at all).
 *
 * Supports (at minimum):
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 * plus the same on m.youtube.com, with or without extra query params
 * (?t=30s, ?si=..., etc.).
 */

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const isValidYouTubeId = (id) => typeof id === 'string' && YOUTUBE_ID_PATTERN.test(id);

/**
 * Extracts the 11-character YouTube video id from a URL, or null if it
 * isn't a recognizable YouTube URL.
 */
export const extractYouTubeVideoId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    // Accept URLs without a protocol (e.g. "youtu.be/xyz") by trying again
    // with one prepended if the first parse fails.
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (host === 'youtu.be') {
      return isValidYouTubeId(pathParts[0]) ? pathParts[0] : null;
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return isValidYouTubeId(id) ? id : null;
      }

      if (['shorts', 'embed', 'live'].includes(pathParts[0])) {
        return isValidYouTubeId(pathParts[1]) ? pathParts[1] : null;
      }
    }
  } catch {
    // Fall through to the regex below for anything URL parsing rejects.
  }

  // Last-resort regex - catches loosely-formed input the URL parser above
  // didn't, as long as the id itself is still clearly delimited.
  const match = trimmed.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
};

/**
 * Builds both candidate thumbnail URLs for a video id. `maxres` is the
 * preferred (highest quality) one; it doesn't exist for every video
 * (mainly older/lower-resolution uploads), so callers should fall back to
 * `hq` - which YouTube always generates - when it fails to load.
 */
export const getYouTubeThumbnailUrls = (videoId) => {
  if (!isValidYouTubeId(videoId)) return null;
  return {
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
};

/**
 * Convenience one-shot: URL in, preferred (maxresdefault) thumbnail URL
 * out - '' if the URL isn't a recognizable YouTube URL. This is what
 * gets stored as Church's Sermon.media.thumbnail; the hqdefault fallback
 * is a client-side concern (an <Image onError> swap), not something this
 * derivation needs to guess about server-side.
 */
export const getYouTubeThumbnail = (url) => {
  const videoId = extractYouTubeVideoId(url);
  const urls = getYouTubeThumbnailUrls(videoId);
  return urls?.maxres || '';
};
