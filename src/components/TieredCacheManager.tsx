import React, { useState } from 'react';
import { 
  HardDrive, 
  Trash2, 
  Pin, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Cloud, 
  RefreshCw, 
  AlertTriangle, 
  Zap, 
  Database,
  Eye,
  CheckCircle2,
  FolderHeart,
  Lock
} from 'lucide-react';
import { 
  PhotoItem, 
  ThemedAlbum, 
  LocalCacheStats, 
  CacheSettings, 
  TierLevel 
} from '../types';
import { 
  calculateLocalCacheStats, 
  runLruCacheEviction, 
  purgeAllUnpinnedCache 
} from '../utils/cacheManager';

interface TieredCacheManagerProps {
  photos: PhotoItem[];
  albums: ThemedAlbum[];
  cacheSettings: CacheSettings;
  tier: TierLevel;
  onUpdateCacheSettings: (newSettings: CacheSettings) => void;
  onPhotosUpdated: (updatedPhotos: PhotoItem[]) => void;
  onTogglePinAlbum: (albumId: string) => void;
  onTogglePinPhoto: (photoId: string) => void;
  onShowToast: (msg: string) => void;
}

export const TieredCacheManager: React.FC<TieredCacheManagerProps> = ({
  photos,
  albums,
  cacheSettings,
  tier,
  onUpdateCacheSettings,
  onPhotosUpdated,
  onTogglePinAlbum,
  onTogglePinPhoto,
  onShowToast,
}) => {
  const [isEvicting, setIsEvicting] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [isSimulatingLowStorage, setIsSimulatingLowStorage] = useState<boolean>(false);

  const stats: LocalCacheStats = calculateLocalCacheStats(photos, cacheSettings);

  const usagePercent = Math.min(100, Math.round((stats.totalCacheMB / stats.maxCacheLimitMB) * 100));

  // Handle manual LRU Eviction
  const handleRunLruEviction = () => {
    setIsEvicting(true);
    setTimeout(() => {
      const result = runLruCacheEviction(photos, cacheSettings);
      onPhotosUpdated(result.updatedPhotos);
      setIsEvicting(false);
      if (result.evictedCount > 0) {
        onShowToast(`🧹 LRU Evicted ${result.evictedCount} cached previews, freeing ${result.freedMB} MB!`);
      } else {
        onShowToast(`✨ Cache is already optimal (${stats.totalCacheMB} MB used of ${stats.maxCacheLimitMB} MB cap).`);
      }
    }, 600);
  };

  // Handle Purge All Unpinned
  const handlePurgeAllUnpinned = () => {
    setIsPurging(true);
    setTimeout(() => {
      const result = purgeAllUnpinnedCache(photos, cacheSettings);
      onPhotosUpdated(result.updatedPhotos);
      setIsPurging(false);
      onShowToast(`🗑️ Cleared ${result.freedMB} MB of unpinned local cache. Cloud originals in Drive remain 100% intact!`);
    }, 500);
  };

  // Simulate OS Low Storage Signal
  const handleSimulateOsLowStorage = () => {
    setIsSimulatingLowStorage(true);
    setTimeout(() => {
      const result = purgeAllUnpinnedCache(photos, cacheSettings);
      onPhotosUpdated(result.updatedPhotos);
      setIsSimulatingLowStorage(false);
      onShowToast(`📱 OS Low-Storage Signal received: Auto-freed ${result.freedMB} MB while protecting pinned albums!`);
    }, 800);
  };

  // Adjust cache cap limit
  const handleCacheLimitChange = (newLimitMB: number) => {
    const updated = {
      ...cacheSettings,
      maxCacheLimitMB: newLimitMB,
    };
    onUpdateCacheSettings(updated);
    if (stats.totalCacheMB > newLimitMB) {
      const result = runLruCacheEviction(photos, updated);
      onPhotosUpdated(result.updatedPhotos);
      onShowToast(`Adjusted cache cap to ${newLimitMB} MB (auto-trimmed ${result.freedMB} MB)`);
    } else {
      onShowToast(`Cache limit set to ${newLimitMB} MB`);
    }
  };

  return (
    <div id="tiered-cache-manager" className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Mental Model Explanation */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/40 via-stone-900 to-emerald-950/40 border border-teal-800/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Core Principle: Local Storage is an Evictable Cache, not a Copy</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-100">
              Tiered Resolution Pipeline &amp; LRU Cache Manager
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-sans max-w-3xl leading-relaxed">
              Google Drive is the single permanent source of truth. Your phone only downloads what is actively being viewed. Clearing local storage never loses a single memory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="purge-all-unpinned-btn"
              onClick={handlePurgeAllUnpinned}
              disabled={isPurging || stats.evictableMB === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 hover:text-rose-200 border border-stone-700 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>{isPurging ? 'Purging Cache...' : `Purge Unpinned Cache (${stats.evictableMB} MB)`}</span>
            </button>
          </div>
        </div>

        {/* Live Cache Meter Bar */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-stone-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-teal-400" />
              <span>Local Storage In Use: <strong>{stats.totalCacheMB} MB</strong></span>
              <span className="text-stone-500">/ {stats.maxCacheLimitMB} MB Cap ({usagePercent}%)</span>
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {stats.dedupSavedMB} MB saved via SHA-256 deduplication
            </span>
          </div>

          {/* Multi-Segment Usage Bar */}
          <div className="w-full h-3.5 rounded-full bg-stone-950 border border-stone-800 overflow-hidden flex">
            {/* Thumbnails */}
            <div 
              style={{ width: `${Math.max(2, (stats.thumbnailsMB / stats.maxCacheLimitMB) * 100)}%` }} 
              className="bg-teal-500 h-full transition-all" 
              title={`Thumbnails: ${stats.thumbnailsMB} MB`}
            />
            {/* Medium Previews */}
            <div 
              style={{ width: `${(stats.mediumPreviewsMB / stats.maxCacheLimitMB) * 100}%` }} 
              className="bg-sky-500 h-full transition-all" 
              title={`Medium Previews: ${stats.mediumPreviewsMB} MB`}
            />
            {/* Full Originals */}
            <div 
              style={{ width: `${(stats.fullOriginalsMB / stats.maxCacheLimitMB) * 100}%` }} 
              className="bg-amber-500 h-full transition-all" 
              title={`Full Originals: ${stats.fullOriginalsMB} MB`}
            />
            {/* Pinned Offline */}
            <div 
              style={{ width: `${(stats.pinnedOfflineMB / stats.maxCacheLimitMB) * 100}%` }} 
              className="bg-rose-500 h-full transition-all" 
              title={`Pinned Offline: ${stats.pinnedOfflineMB} MB`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Permanent Thumbnails ({stats.thumbnailsMB} MB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Medium Previews ({stats.mediumPreviewsMB} MB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Full Originals ({stats.fullOriginalsMB} MB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Pinned Offline ({stats.pinnedOfflineMB} MB)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3-Tier Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier 1: Thumbnails */}
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Tier 1: Permanent
              </span>
              <span className="text-xs font-mono text-stone-400">~42 KB each</span>
            </div>
            <h3 className="font-serif-title font-bold text-base text-stone-100">
              WebP Grid Thumbnails
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Cached locally forever in IndexedDB. 20,000 photos takes under 1 GB total, making grid browsing instant on zero-latency offline cache.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Current Cached:</span>
            <span className="text-teal-300 font-bold">{stats.thumbnailsCount} items ({stats.thumbnailsMB} MB)</span>
          </div>
        </div>

        {/* Tier 2: Medium Previews */}
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Tier 2: On-Demand LRU
              </span>
              <span className="text-xs font-mono text-stone-400">~420 KB each</span>
            </div>
            <h3 className="font-serif-title font-bold text-base text-stone-100">
              Medium Previews (1280px)
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Downloaded when you tap a memory to view fullscreen on mobile/desktop. Automatically evicted when your cache cap is reached.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Active Previews:</span>
            <span className="text-sky-300 font-bold">{stats.mediumPreviewsCount} cached ({stats.mediumPreviewsMB} MB)</span>
          </div>
        </div>

        {/* Tier 3: Full Original in Drive */}
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tier 3: Cloud Vault
              </span>
              <span className="text-xs font-mono text-stone-400">5–15 MB each</span>
            </div>
            <h3 className="font-serif-title font-bold text-base text-stone-100">
              Full RAW / 4K Original
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Stays safely in your Google Drive <code className="bg-stone-800 px-1 py-0.5 rounded text-amber-300">appDataFolder</code>. Only pulled down when you zoom beyond 100%, export, or pin offline.
            </p>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Drive Cloud Store:</span>
            <span className="text-amber-300 font-bold">{photos.length} originals in Drive</span>
          </div>
        </div>

      </div>

      {/* Cache Ceiling & Automation Controls */}
      <div className="p-6 bg-stone-900/80 rounded-3xl border border-stone-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif-title font-bold text-lg text-stone-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Offline Cache Budget &amp; Automatic LRU Settings</span>
            </h3>
            <p className="text-xs text-stone-400">
              Configure how much disk space TogetherLens may use before purging oldest unpinned previews.
            </p>
          </div>

          <button
            id="run-lru-now-btn"
            onClick={handleRunLruEviction}
            disabled={isEvicting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isEvicting ? 'animate-spin' : ''}`} />
            <span>{isEvicting ? 'Trimming Cache...' : 'Run LRU Cleanup Now'}</span>
          </button>
        </div>

        {/* Cache Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-300">Maximum Local Cache Limit:</span>
            <span className="text-teal-300 font-bold text-sm">{cacheSettings.maxCacheLimitMB} MB</span>
          </div>
          <input
            id="cache-limit-slider"
            type="range"
            min="300"
            max="4000"
            step="100"
            value={cacheSettings.maxCacheLimitMB}
            onChange={(e) => handleCacheLimitChange(Number(e.target.value))}
            className="w-full accent-teal-500 bg-stone-950 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-stone-400">
            <span>300 MB (Lightweight)</span>
            <span>1,500 MB (Recommended)</span>
            <span>4,000 MB (Heavy Offline Cache)</span>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-semibold text-stone-200 block">Automatic LRU Eviction</span>
              <p className="text-[11px] text-stone-400">Auto-purge oldest previews when nearing budget cap</p>
            </div>
            <input
              type="checkbox"
              checked={cacheSettings.autoLruEnabled}
              onChange={(e) => onUpdateCacheSettings({ ...cacheSettings, autoLruEnabled: e.target.checked })}
              className="accent-teal-500 w-4 h-4 rounded"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-semibold text-stone-200 block">OS Low-Storage Listener</span>
              <p className="text-[11px] text-stone-400">Evict non-pinned previews on mobile storage pressure</p>
            </div>
            <button
              onClick={handleSimulateOsLowStorage}
              disabled={isSimulatingLowStorage}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] font-mono text-teal-300 border border-stone-700"
              title="Simulate Android low-storage broadcast or iOS storage pressure"
            >
              {isSimulatingLowStorage ? 'Signaling...' : 'Test Signal'}
            </button>
          </div>

        </div>
      </div>

      {/* Pinned Offline Albums & Chapters */}
      <div className="p-6 bg-stone-900/80 rounded-3xl border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif-title font-bold text-lg text-stone-100 flex items-center gap-2">
              <Pin className="w-4 h-4 text-rose-400" />
              <span>&ldquo;Keep Offline&rdquo; Pinned Collections</span>
            </h3>
            <p className="text-xs text-stone-400">
              Pinned albums maintain full-resolution copies locally for airplane mode or off-grid travels, completely protected from LRU eviction.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400">
            {cacheSettings.pinnedAlbumIds.length} Collections Pinned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albums.map((album) => {
            const isPinned = album.isPinnedOffline || cacheSettings.pinnedAlbumIds.includes(album.id);
            return (
              <div
                key={album.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isPinned 
                    ? 'bg-rose-950/20 border-rose-500/40' 
                    : 'bg-stone-950 border-stone-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-200 truncate">{album.title}</span>
                    <span className="text-[10px] font-mono text-stone-400">({album.photoIds.length} photos)</span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{album.dateRange} • {album.locations.join(', ')}</p>
                </div>

                <button
                  id={`toggle-pin-album-${album.id}`}
                  onClick={() => onTogglePinAlbum(album.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isPinned
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                  }`}
                >
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-white' : ''}`} />
                  <span>{isPinned ? 'Pinned Offline' : 'Keep Offline'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
