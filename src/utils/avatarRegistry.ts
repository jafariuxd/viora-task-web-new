import assetAvatarMehran from '../assets/images/img_avatar_mehran.jpg';
import assetAvatarSara from '../assets/images/img_avatar_sara_1783672418392.jpg';
import assetAvatarMohammad from '../assets/images/img_profile_mohammad_1783672402325.jpg';

// Bundled preset assets guaranteed to exist in production builds
export const BUNDLED_AVATARS = {
  mehran: assetAvatarMehran,
  sara: assetAvatarSara,
  mohammad: assetAvatarMohammad,
  mamad: assetAvatarMohammad,
};

// Global in-memory avatar registry populated dynamically from backend and default presets
export const avatarRegistry: Record<string, string> = {
  mehran: assetAvatarMehran,
  sara: assetAvatarSara,
  mohammad: assetAvatarMohammad,
  mamad: assetAvatarMohammad,
};

/**
 * Returns an ordered array of candidate URLs to attempt loading an avatar image.
 * This guarantees resilience across:
 * - Local AI Studio simulator (with Vite dev server proxy)
 * - Self-hosted production server on HTTP (direct backend calls)
 * - Self-hosted production server on HTTPS (with reverse proxy or direct fallback)
 * - Subdirectory deployments & static builds
 */
export function getAvatarCandidates(
  url?: string | null,
  userIdOrUsername?: string | null
): string[] {
  const candidates: string[] = [];

  const addCandidate = (c?: string | null) => {
    if (c && typeof c === 'string') {
      const trimmed = c.trim();
      if (trimmed && !candidates.includes(trimmed)) {
        candidates.push(trimmed);
      }
    }
  };

  const isBrowser = typeof window !== 'undefined';
  const isHttps = isBrowser && window.location.protocol === 'https:';
  const isSimulator =
    isBrowser &&
    (window.location.hostname.includes('.run.app') ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1'));

  const raw = url ? url.trim() : '';

  // 1. Data URLs (Base64) - immediate single candidate (preserve casing!)
  if (raw.startsWith('data:')) {
    return [raw];
  }

  // 2. Local bundled images (Mehran, Sara, Mohammad)
  if (
    raw.includes('img_avatar_mehran') ||
    raw.endsWith('img_avatar_mehran.jpg')
  ) {
    addCandidate(assetAvatarMehran);
    addCandidate('/images/img_avatar_mehran.jpg');
    addCandidate('./images/img_avatar_mehran.jpg');
    addCandidate('images/img_avatar_mehran.jpg');
    return candidates;
  }

  if (
    raw.includes('img_avatar_sara') ||
    raw.endsWith('img_avatar_sara_1783672418392.jpg')
  ) {
    addCandidate(assetAvatarSara);
    addCandidate('/images/img_avatar_sara_1783672418392.jpg');
    addCandidate('./images/img_avatar_sara_1783672418392.jpg');
    addCandidate('images/img_avatar_sara_1783672418392.jpg');
    return candidates;
  }

  if (
    raw.includes('img_profile_mohammad') ||
    raw.endsWith('img_profile_mohammad_1783672402325.jpg')
  ) {
    addCandidate(assetAvatarMohammad);
    addCandidate('/images/img_profile_mohammad_1783672402325.jpg');
    addCandidate('./images/img_profile_mohammad_1783672402325.jpg');
    addCandidate('images/img_profile_mohammad_1783672402325.jpg');
    return candidates;
  }

  // 3. Backend Uploads or Backend IP References
  const isBackendUrl =
    raw.includes('45.195.250.77') ||
    raw.includes('localhost') ||
    raw.includes('127.0.0.1') ||
    raw.startsWith('/uploads/') ||
    raw.startsWith('uploads/') ||
    raw.startsWith('/backend-api/') ||
    raw.startsWith('/api/uploads/') ||
    raw.startsWith('api/uploads/');

  if (isBackendUrl) {
    let cleanUploadPath = raw;
    // Strip host/protocol prefixes
    cleanUploadPath = cleanUploadPath
      .replace(/^https?:\/\/45\.195\.250\.77(?::\d+)?\/?/, '/')
      .replace(/^https?:\/\/localhost(?::\d+)?\/?/, '/')
      .replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?\/?/, '/')
      .replace(/^\/backend-api\//, '/');

    if (!cleanUploadPath.startsWith('/')) {
      cleanUploadPath = `/${cleanUploadPath}`;
    }

    const directBackendUrl = `http://45.195.250.77:3000${cleanUploadPath}`;
    const proxyUrl = `/backend-api${cleanUploadPath}`;
    const originUrl = isBrowser && window.location.origin ? `${window.location.origin}${cleanUploadPath}` : '';

    if (isSimulator) {
      // In AI Studio simulator, Vite dev proxy avoids mixed content
      addCandidate(proxyUrl);
      addCandidate(directBackendUrl);
      if (originUrl) addCandidate(originUrl);
      addCandidate(cleanUploadPath);
    } else if (!isHttps) {
      // On user's self-hosted server via HTTP: direct backend URL and origin URL work natively
      addCandidate(directBackendUrl);
      if (originUrl) addCandidate(originUrl);
      addCandidate(cleanUploadPath);
      addCandidate(proxyUrl);
    } else {
      // On user's self-hosted server via HTTPS: origin / relative path first, proxy, then direct
      if (originUrl) addCandidate(originUrl);
      addCandidate(cleanUploadPath);
      addCandidate(proxyUrl);
      addCandidate(directBackendUrl);
    }
  } else if (raw) {
    addCandidate(raw);
    if (raw.startsWith('http://')) {
      addCandidate(raw.replace(/^http:\/\//, 'https://'));
    }
  }

  // 4. Default user fallback ONLY if no candidate was matched yet
  if (candidates.length === 0 && userIdOrUsername) {
    const cleanId = String(userIdOrUsername).toLowerCase().trim();
    if (
      cleanId === 'mehran' ||
      cleanId.includes('mehran') ||
      cleanId.includes('mehranamarbini') ||
      cleanId === 'self' ||
      cleanId === 'me'
    ) {
      addCandidate(assetAvatarMehran);
      addCandidate('/images/img_avatar_mehran.jpg');
    } else if (cleanId === 'sara' || cleanId.includes('sara')) {
      addCandidate(assetAvatarSara);
      addCandidate('/images/img_avatar_sara_1783672418392.jpg');
    } else if (cleanId === 'mohammad' || cleanId === 'mamad' || cleanId.includes('mohammad')) {
      addCandidate(assetAvatarMohammad);
      addCandidate('/images/img_profile_mohammad_1783672402325.jpg');
    }
  }

  return candidates;
}

/**
 * Formats a raw avatar URL into the best single primary URL candidate.
 */
export function formatAvatarUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  const candidates = getAvatarCandidates(trimmed);
  return candidates.length > 0 ? candidates[0] : trimmed;
}

export function registerServerAvatar(userIdOrUsername: string, avatarUrl: string) {
  if (!userIdOrUsername || !avatarUrl) return;
  const key = String(userIdOrUsername).toLowerCase().trim();
  const formatted = formatAvatarUrl(avatarUrl);
  if (formatted) {
    avatarRegistry[key] = formatted;
  }
}

export function registerServerUsers(
  usersList?: Array<{ id?: string; username?: string; email?: string; avatar?: string }>
) {
  if (!Array.isArray(usersList)) return;
  usersList.forEach((u) => {
    if (u?.avatar) {
      if (u.id) registerServerAvatar(u.id, u.avatar);
      if (u.username) registerServerAvatar(u.username, u.avatar);
      if (u.email) registerServerAvatar(u.email, u.avatar);
    }
  });
}
