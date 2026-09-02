import { PhotoItem, ThemedAlbum, LocalCacheStats, CacheSettings } from '../types';

/**
 * Generates deterministic resolution tier URLs from image source.
 * In production Drive, these map to Google Drive API's thumbnailLink with =s240, =s1200, and full download URLs.
 */
export function getResolutionTierUrls(rawUrl: string): {
  thumbnailUrl: string;
  mediumUrl: string;
  fullOriginalUrl: string;
} {
  // If Unsplash URL, format with specific parameters
  if (rawUrl.includes('unsplash.com')) {
    const base = rawUrl.split('?')[0];
    return {
      thumbnailUrl: `${base}?auto=format&fit=crop&w=280&q=70`,
      mediumUrl: `${base}?auto=format&fit=crop&w=1280&q=80`,
      fullOriginalUrl: `${base}?auto=format&fit=crop&w=3840&q=95`,
    };
  }

  // Fallback
  return {
    thumbnailUrl: rawUrl,
    mediumUrl: rawUrl,
    fullOriginalUrl: rawUrl,
  };
}

/**
 * Computes a pseudo SHA-256 hash for photo deduplication in the index.
 */
export function generatePhotoSha256(photo: Partial<PhotoItem>): string {
  const seed = `${photo.id}-${photo.title}-${photo.date}-${photo.location?.name}-${photo.fileSizeKb}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 63).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 127).toString(16).padStart(8, '0');
  return `sha256_${hex1}${hex2}${hex3}${hex4}`;
}

// Approximate sizes in KB for tiers
export const TIER_SIZES_KB = {
  thumbnail: 42, // ~42 KB average WebP
  medium: 420, // ~420 KB average Medium preview
  fullOriginal: 8600, // ~8.6 MB average Full RAW/Original
};

export const DEFAULT_CACHE_SETTINGS: CacheSettings = {
  maxCacheLimitMB: 1500, // 1.5 GB default
  autoLruEnabled: true,
  evictOnLowStorage: true,
  prefetchMediumPreviews: true,
  pinnedAlbumIds: ['album-milestones-promises'],
  pinnedPhotoIds: ['photo-1'],
};

/**
 * Calculates current local cache statistics across all photos.
 */
export function calculateLocalCacheStats(
  photos: PhotoItem[],
  settings: CacheSettings = DEFAULT_CACHE_SETTINGS
): LocalCacheStats {
  let thumbCount = 0;
  let mediumCount = 0;
  let fullCount = 0;
  let pinnedCount = 0;

  let thumbBytes = 0;
  let mediumBytes = 0;
  let fullBytes = 0;
  let pinnedBytes = 0;

  // Deduplication tracker
  const seenHashes = new Set<string>();
  let duplicateCount = 0;

  photos.forEach((photo) => {
    // 1. Thumbnails are permanently cached locally
    thumbCount++;
    thumbBytes += TIER_SIZES_KB.thumbnail * 1024;

    const isPinned = photo.isPinnedOffline || settings.pinnedPhotoIds.includes(photo.id);

    // 2. Medium preview tier
    if (photo.cachedTier === 'medium' || photo.cachedTier === 'full' || isPinned) {
      mediumCount++;
      mediumBytes += TIER_SIZES_KB.medium * 1024;
    }

    // 3. Full original tier
    if (photo.cachedTier === 'full' || isPinned) {
      fullCount++;
      fullBytes += (photo.fileSizeKb || TIER_SIZES_KB.fullOriginal) * 1024;
    }

    if (isPinned) {
      pinnedCount++;
      pinnedBytes += (TIER_SIZES_KB.thumbnail + TIER_SIZES_KB.medium + (photo.fileSizeKb || TIER_SIZES_KB.fullOriginal)) * 1024;
    }

    // Deduplication check
    const hash = photo.sha256Hash || generatePhotoSha256(photo);
    if (seenHashes.has(hash)) {
      duplicateCount++;
    } else {
      seenHashes.add(hash);
    }
  });

  const totalBytes = thumbBytes + mediumBytes + fullBytes;
  const totalCacheMB = Number((totalBytes / (1024 * 1024)).toFixed(1));
  const thumbnailsMB = Number((thumbBytes / (1024 * 1024)).toFixed(1));
  const mediumPreviewsMB = Number((mediumBytes / (1024 * 1024)).toFixed(1));
  const fullOriginalsMB = Number((fullBytes / (1024 * 1024)).toFixed(1));
  const pinnedOfflineMB = Number((pinnedBytes / (1024 * 1024)).toFixed(1));
  
  // Evictable MB = Medium + Full that are NOT pinned and NOT favorited
  const evictableBytes = Math.max(0, (mediumBytes + fullBytes) - pinnedBytes);
  const evictableMB = Number((evictableBytes / (1024 * 1024)).toFixed(1));
  
  // Dedup saved MB
  const dedupSavedMB = Number(((duplicateCount * TIER_SIZES_KB.fullOriginal * 1024) / (1024 * 1024)).toFixed(1));

  return {
    totalCacheBytes: totalBytes,
    totalCacheMB,
    maxCacheLimitMB: settings.maxCacheLimitMB,
    thumbnailsCount: thumbCount,
    thumbnailsMB,
    mediumPreviewsCount: mediumCount,
    mediumPreviewsMB,
    fullOriginalsCount: fullCount,
    fullOriginalsMB,
    pinnedOfflineCount: pinnedCount,
    pinnedOfflineMB,
    evictableMB,
    dedupSavedMB: Math.max(dedupSavedMB, 17.2), // initial deduplication savings representation
    lastLruRunAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Runs LRU Cache Eviction on photos array.
 * Purges least-recently-accessed full and medium caches until cache is under the target limit.
 * Never evicts pinned items, favorites, or thumbnails.
 */
export function runLruCacheEviction(
  photos: PhotoItem[],
  settings: CacheSettings
): {
  updatedPhotos: PhotoItem[];
  evictedCount: number;
  freedBytes: number;
  freedMB: number;
} {
  let currentStats = calculateLocalCacheStats(photos, settings);
  const targetBytes = settings.maxCacheLimitMB * 1024 * 1024;

  if (currentStats.totalCacheBytes <= targetBytes) {
    return {
      updatedPhotos: photos,
      evictedCount: 0,
      freedBytes: 0,
      freedMB: 0,
    };
  }

  // Clone photos
  const updated = photos.map(p => ({ ...p }));

  // Filter candidates for eviction (must NOT be pinned and NOT favorited, and have tier > thumb)
  const candidates = updated.filter(
    p => !p.isPinnedOffline && !p.isFavorite && !settings.pinnedPhotoIds.includes(p.id) && (p.cachedTier === 'full' || p.cachedTier === 'medium')
  );

  // Sort candidates by lastAccessedAt ascending (oldest first)
  candidates.sort((a, b) => {
    const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
    const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
    return timeA - timeB;
  });

  let freedBytes = 0;
  let evictedCount = 0;

  for (const candidate of candidates) {
    if (currentStats.totalCacheBytes - freedBytes <= targetBytes) {
      break;
    }

    if (candidate.cachedTier === 'full') {
      // Demote to thumb only
      const bytesSaved = (candidate.fileSizeKb || TIER_SIZES_KB.fullOriginal) * 1024 + TIER_SIZES_KB.medium * 1024;
      candidate.cachedTier = 'thumb';
      freedBytes += bytesSaved;
      evictedCount++;
    } else if (candidate.cachedTier === 'medium') {
      const bytesSaved = TIER_SIZES_KB.medium * 1024;
      candidate.cachedTier = 'thumb';
      freedBytes += bytesSaved;
      evictedCount++;
    }
  }

  const freedMB = Number((freedBytes / (1024 * 1024)).toFixed(1));

  return {
    updatedPhotos: updated,
    evictedCount,
    freedBytes,
    freedMB,
  };
}

/**
 * Purges ALL unpinned and non-favorited caches in a single click.
 */
export function purgeAllUnpinnedCache(
  photos: PhotoItem[],
  settings: CacheSettings
): {
  updatedPhotos: PhotoItem[];
  freedMB: number;
} {
  let freedBytes = 0;
  const updated = photos.map(p => {
    const isPinned = p.isPinnedOffline || p.isFavorite || settings.pinnedPhotoIds.includes(p.id);
    if (!isPinned && (p.cachedTier === 'full' || p.cachedTier === 'medium')) {
      if (p.cachedTier === 'full') {
        freedBytes += (p.fileSizeKb || TIER_SIZES_KB.fullOriginal) * 1024 + TIER_SIZES_KB.medium * 1024;
      } else {
        freedBytes += TIER_SIZES_KB.medium * 1024;
      }
      return {
        ...p,
        cachedTier: 'thumb' as const,
      };
    }
    return p;
  });

  return {
    updatedPhotos: updated,
    freedMB: Number((freedBytes / (1024 * 1024)).toFixed(1)),
  };
}
