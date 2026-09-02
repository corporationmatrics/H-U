export type CoupleContextCategory =
  | 'Cozy Date'
  | 'Road Trip'
  | 'Anniversary Dinner'
  | 'Golden Hour'
  | 'Beach Getaway'
  | 'Proposal & Ring'
  | 'Home Cooking'
  | 'Mountain Hike'
  | 'City Stroll'
  | 'Celebration & Party'
  | 'Casual Daily'
  | 'Clutter / Receipt';

export interface FaceBoundingBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
  label: 'Partner 1 (Alex)' | 'Partner 2 (Taylor)' | 'Friend / Other' | 'Unknown';
  confidence: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  date: string; // ISO format or YYYY-MM-DD
  year: number;
  month: string;
  location: {
    name: string;
    city: string;
    country: string;
  };
  facesCount: number;
  isUsCouple: boolean; // true if both primary faces detected
  detectedFaces: {
    partner1Detected: boolean;
    partner2Detected: boolean;
    otherCount: number;
    boxes: FaceBoundingBox[];
  };
  context: CoupleContextCategory;
  visualTriggers: {
    hasCake: boolean;
    hasRing: boolean;
    hasPets: boolean;
    hasSunset: boolean;
    hasFoodOrWine: boolean;
    isClutterOrReceipt: boolean;
  };
  semanticTags: string[];
  aestheticScore: number; // 1-100
  nostalgicSummary: string;
  vectorEmbedding: number[]; // 16-dim normalized vector
  isFavorite?: boolean;
  driveSyncState: 'synced' | 'pending' | 'uploading' | 'error';
  driveFileId?: string;
  driveSyncedAt?: string;
  fileSizeKb: number;
  // Tiered Storage & Caching fields
  mediumUrl?: string; // ~350-500KB medium preview for phone viewing / modals
  fullOriginalUrl?: string; // 5-15MB original RAW/JPEG stored in Drive
  sha256Hash?: string; // Content hash for upload deduplication
  isPinnedOffline?: boolean; // If true, protected from LRU cache eviction
  cachedTier?: 'thumb' | 'medium' | 'full'; // Current local cache level
  lastAccessedAt?: string; // ISO date for LRU eviction calculation
}

export interface CoupleProfile {
  partner1Name: string;
  partner2Name: string;
  partner1Avatar: string;
  partner2Avatar: string;
  partner1Pin?: string; // 4-digit secret PIN
  partner2Pin?: string; // 4-digit secret PIN
  anniversaryDate: string; // YYYY-MM-DD
  relationshipTitle: string;
  daysTogether: number;
  partner1FavoriteIds?: string[];
  partner2FavoriteIds?: string[];
  googleDriveSettings?: {
    autoUploadOnImport: boolean;
    folderName: string;
    folderId?: string;
    isLinked: boolean;
    customAccessToken?: string;
  };
}

export type ActivePartnerView = 'partner1' | 'partner2' | 'together';


export interface DriveSyncStatus {
  isConnected: boolean;
  userEmail: string;
  syncFolder: string; // 'appDataFolder'
  lastSyncedAt: string;
  pendingCount: number;
  rateLimitQuota: {
    usedRequestsThisMin: number;
    maxRequestsPerMin: number;
    backoffDelayMs: number;
    status: 'nominal' | 'throttled' | 'syncing';
  };
  indexFileSizeKb: number;
  rawStorageMb: number;
  isSyncingNow: boolean;
  syncLog: Array<{
    id: string;
    timestamp: string;
    action: string;
    status: 'success' | 'warning' | 'info';
    details: string;
  }>;
}

export type TierLevel = 'free' | 'pro';

export type AppThemeId = 
  | 'midnight-rose' 
  | 'warm-linen' 
  | 'nordic-twilight' 
  | 'emerald-botanical' 
  | 'sunset-amber';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  palette: {
    bg: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    accentMuted: string;
    glow: string;
    ringColor: string;
    swatches: string[];
  };
  fontPairing: {
    title: string;
    body: string;
    mood: string;
  };
}

export interface BatchAnalysisJob {
  batchId: string;
  photoIds: string[];
  tiles: Array<{
    photoId: string;
    gridIndex: number;
    thumbnailUrl: string;
    title: string;
  }>;
  status: 'idle' | 'assembling_grid' | 'calling_gemini' | 'completed' | 'error';
  promptTokens: number;
  tokensSavedPercent: number;
  responseRawJson?: string;
  results?: Array<{
    photoId: string;
    context: CoupleContextCategory;
    isUsCouple: boolean;
    triggers: {
      hasCake: boolean;
      hasRing: boolean;
      hasPets: boolean;
      hasSunset: boolean;
      hasFoodOrWine: boolean;
      isClutterOrReceipt: boolean;
    };
    semanticTags: string[];
    nostalgicSummary: string;
  }>;
}

export interface OnThisDayMemory {
  id: string;
  yearsAgo: number;
  dateFormatted: string;
  title: string;
  location: string;
  photos: PhotoItem[];
  aiNostalgicCaption: string;
  contextTag: string;
}

export interface RecapSlide {
  photoId: string;
  photo: PhotoItem;
  chapterTitle: string;
  narration: string;
  durationSeconds: number;
  cameraEffect: 'pan-left' | 'zoom-in' | 'tilt-up' | 'glow-focus';
}

export interface AnniversaryRecapStory {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  moodVibe: 'Romantic & Cozy' | 'Lively & Adventurous' | 'Cinematic & Nostalgic';
  musicTrackTitle: string;
  totalDurationSeconds: number;
  slides: RecapSlide[];
}

export type AlbumThemeCategory =
  | 'all'
  | 'summer'
  | 'getaways'
  | 'romance'
  | 'adventures'
  | 'cozy'
  | 'milestones'
  | 'custom';

export interface ThemedAlbum {
  id: string;
  title: string;
  subtitle: string;
  category: AlbumThemeCategory;
  badge: string;
  coverPhotoId: string;
  photoIds: string[];
  dateRange: string;
  startDate: string;
  endDate: string;
  primaryTags: string[];
  matchedReasons: string[];
  nostalgicStory: string;
  locations: string[];
  averageAestheticScore: number;
  songSuggestion?: {
    title: string;
    artist: string;
    vibe: string;
  };
  isUserCustom?: boolean;
  isPinnedOffline?: boolean;
}

export interface LocalCacheStats {
  totalCacheBytes: number;
  totalCacheMB: number;
  maxCacheLimitMB: number;
  thumbnailsCount: number;
  thumbnailsMB: number;
  mediumPreviewsCount: number;
  mediumPreviewsMB: number;
  fullOriginalsCount: number;
  fullOriginalsMB: number;
  pinnedOfflineCount: number;
  pinnedOfflineMB: number;
  evictableMB: number;
  dedupSavedMB: number;
  lastLruRunAt: string;
}

export interface CacheSettings {
  maxCacheLimitMB: number;
  autoLruEnabled: boolean;
  evictOnLowStorage: boolean;
  prefetchMediumPreviews: boolean;
  pinnedAlbumIds: string[];
  pinnedPhotoIds: string[];
}

// ==========================================
// 1. Time Capsule Types
// ==========================================
export type TimeCapsuleUnlockType = 'date' | 'days_together' | 'anniversary';

export interface TimeCapsule {
  id: string;
  title: string;
  sealedBy: 'Partner 1 (Alex)' | 'Partner 2 (Taylor)';
  sealedFor: 'Partner 1 (Alex)' | 'Partner 2 (Taylor)' | 'Both of Us';
  sealedAtDate: string; // ISO date
  unlockType: TimeCapsuleUnlockType;
  unlockTargetDate?: string; // ISO date if unlockType === 'date' or 'anniversary'
  unlockTargetDaysTogether?: number; // e.g., 2000 days
  anniversaryYear?: number; // e.g., 5th Anniversary
  secretMessage: string;
  voiceMemoNote?: string;
  audioMemoDurationSeconds?: number;
  photoIds: string[];
  waxSealColor: 'rose' | 'amber' | 'emerald' | 'purple' | 'gold';
  isUnlocked: boolean;
  hintClue: string;
}

// ==========================================
// 2. AI Hardcover Storybook Types
// ==========================================
export interface StorybookPage {
  pageNumber: number;
  type: 'cover' | 'intro' | 'photo_single' | 'photo_dual' | 'chapter_divider' | 'colophon';
  title?: string;
  subtitle?: string;
  photoIds: string[];
  partner1Perspective?: string;
  partner2Perspective?: string;
  aiNarrative?: string;
  chapterBadge?: string;
  dateLocationStamp?: string;
  layoutVariant: 'centered' | 'full_bleed' | 'polaroid_duo' | 'editorial_split';
}

export interface StorybookSpread {
  spreadIndex: number;
  leftPage: StorybookPage;
  rightPage: StorybookPage;
}

export interface StorybookProject {
  id: string;
  title: string;
  subtitle: string;
  coverStyle: 'linen_cream' | 'midnight_leather' | 'terracotta_rose' | 'emerald_gold';
  foilStampText: string;
  authorNames: string;
  minimumAestheticScore: number;
  selectedChapterIds: string[];
  customDedication: string;
  totalPages: number;
  spreads: StorybookSpread[];
  createdAt: string;
}

// ==========================================
// 3. Acoustic Memory Soundscapes Types
// ==========================================
export type SoundscapePresetId =
  | 'amalfi_waves'
  | 'paris_cafe'
  | 'alpine_breeze'
  | 'rainy_evening'
  | 'campfire_dusk'
  | 'summer_park';

export interface SoundscapePreset {
  id: SoundscapePresetId;
  name: string;
  icon: string;
  description: string;
  associatedKeywords: string[];
  accentColor: string;
  noiseType: 'pink' | 'brown' | 'white';
  baseFrequency: number;
  lfoSpeedHz: number;
  crackleIntensity: number;
  rainTapDensity: number;
  droneHarmonicHz?: number;
}

