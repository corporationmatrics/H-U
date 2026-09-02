import React, { useState, useEffect, useMemo } from 'react';
import { initialCoupleProfile, initialPhotos } from './data/initialPhotos';
import { initialTimeCapsules } from './data/initialCapsules';
import { CoupleProfile, DriveSyncStatus, PhotoItem, TierLevel, AppThemeId, CacheSettings, ThemedAlbum, TimeCapsule } from './types';
import { DEFAULT_CACHE_SETTINGS } from './utils/cacheManager';
import { generateAutomatedAlbums } from './utils/albumGrouper';
import { loadPersistedPhotos, savePersistedPhotos, loadPersistedProfile, savePersistedProfile } from './utils/indexedDbStorage';
import { HeaderNav, MainTabType } from './components/HeaderNav';
import { UsTimeline } from './components/UsTimeline';
import { SmartMemoryResurfacing } from './components/SmartMemoryResurfacing';
import { BatchAnalysisStudio } from './components/BatchAnalysisStudio';
import { AnniversaryCinema } from './components/AnniversaryCinema';
import { DriveCloudVault } from './components/DriveCloudVault';
import { AutomatedAlbumGenerator } from './components/AutomatedAlbumGenerator';
import { TimeCapsuleStudio } from './components/TimeCapsuleStudio';
import { StorybookPrintGenerator } from './components/StorybookPrintGenerator';
import { SoundscapeFloatingPlayer } from './components/SoundscapeFloatingPlayer';
import { SemanticSearchModal } from './components/SemanticSearchModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { BulkUploaderModal } from './components/BulkUploaderModal';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { THEME_PRESETS, DEFAULT_THEME_ID } from './theme/themes';
import { initAuth, signInWithGoogle, logOutGoogle, getAccessToken } from './lib/googleAuth';
import { listAppDataFiles, uploadToAppDataFolder } from './lib/driveService';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<CoupleProfile>(initialCoupleProfile);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [tier, setTier] = useState<TierLevel>('pro');
  const [activeTab, setActiveTab] = useState<MainTabType>('timeline');
  
  // Time Capsules state
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>(() => {
    const saved = localStorage.getItem('togetherlens_time_capsules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialTimeCapsules;
  });

  const handleAddCapsule = (newCapsule: TimeCapsule) => {
    const updated = [newCapsule, ...timeCapsules];
    setTimeCapsules(updated);
    localStorage.setItem('togetherlens_time_capsules', JSON.stringify(updated));
  };

  const handleUnlockCapsule = (id: string) => {
    const updated = timeCapsules.map((c) => (c.id === id ? { ...c, isUnlocked: true } : c));
    setTimeCapsules(updated);
    localStorage.setItem('togetherlens_time_capsules', JSON.stringify(updated));
  };

  // Cache & Storage Management state
  const [cacheSettings, setCacheSettings] = useState<CacheSettings>(() => {
    const saved = localStorage.getItem('togetherlens_cache_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CACHE_SETTINGS;
  });

  const autoAlbums = useMemo(() => generateAutomatedAlbums(photos, profile), [photos, profile]);

  
  // Theme state
  const [activeThemeId, setActiveThemeId] = useState<AppThemeId>(() => {
    const saved = localStorage.getItem('togetherlens_theme') as AppThemeId;
    return (saved && THEME_PRESETS[saved]) ? saved : DEFAULT_THEME_ID;
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(() => {
    return localStorage.getItem('togetherlens_glow') !== 'false';
  });
  const [filmGrain, setFilmGrain] = useState<boolean>(() => {
    return localStorage.getItem('togetherlens_filmgrain') === 'true';
  });

  const activeTheme = THEME_PRESETS[activeThemeId] || THEME_PRESETS[DEFAULT_THEME_ID];

  const handleSelectTheme = (themeId: AppThemeId) => {
    setActiveThemeId(themeId);
    localStorage.setItem('togetherlens_theme', themeId);
    showToast(`Atmosphere switched to ${THEME_PRESETS[themeId].name}`);
  };

  const handleToggleAmbientGlow = () => {
    setAmbientGlow((prev) => {
      const next = !prev;
      localStorage.setItem('togetherlens_glow', String(next));
      return next;
    });
  };

  const handleToggleFilmGrain = () => {
    setFilmGrain((prev) => {
      const next = !prev;
      localStorage.setItem('togetherlens_filmgrain', String(next));
      return next;
    });
  };

  // Google Auth user state
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [hasLiveGoogleToken, setHasLiveGoogleToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Modals & Overlays
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Drive Sync status state
  const [syncStatus, setSyncStatus] = useState<DriveSyncStatus>({
    isConnected: true,
    userEmail: 'alex.taylor.story@gmail.com',
    syncFolder: 'appDataFolder',
    lastSyncedAt: 'Just now',
    pendingCount: 0,
    rateLimitQuota: {
      usedRequestsThisMin: 142,
      maxRequestsPerMin: 325000,
      backoffDelayMs: 0,
      status: 'nominal',
    },
    indexFileSizeKb: 14.8,
    rawStorageMb: 42.6,
    isSyncingNow: false,
    syncLog: [
      {
        id: 'log_01',
        timestamp: '00:15:20',
        action: 'library_index.json uploaded to appDataFolder',
        status: 'success',
        details: '10 couple items indexed, sqlite-vec embeddings refreshed',
      }
    ]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen for Google Auth state
  useEffect(() => {
    // Load persisted photos from IndexedDB on initial launch
    loadPersistedPhotos().then((stored) => {
      if (stored && stored.length > 0) {
        setPhotos(stored);
      }
    }).catch(console.error);

    loadPersistedProfile().then((storedProfile) => {
      if (storedProfile) {
        setProfile(storedProfile);
      }
    }).catch(console.error);

    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setHasLiveGoogleToken(true);
        }
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: true,
          userEmail: user.email || prev.userEmail,
        }));
      },
      () => {
        setGoogleUser(null);
        setHasLiveGoogleToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Persist photos automatically whenever photo collection changes
  const updateAndPersistPhotos = (updater: (prev: PhotoItem[]) => PhotoItem[]) => {
    setPhotos((prev) => {
      const next = updater(prev);
      savePersistedPhotos(next).catch(console.error);
      return next;
    });
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        setGoogleUser(res.user);
        setHasLiveGoogleToken(true);
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: true,
          userEmail: res.user.email || prev.userEmail,
        }));
        showToast(`Connected to Google Drive for ${res.user.email}!`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast(`Google Sign-in: ${err?.message || 'Failed'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logOutGoogle();
    setGoogleUser(null);
    setHasLiveGoogleToken(false);
    showToast('Signed out of Google Drive');
  };

  // Keyboard shortcut for Cmd+K Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger Google Drive sync simulation
  const handleTriggerDriveSync = async () => {
    setSyncStatus((prev) => ({ ...prev, isSyncingNow: true }));
    try {
      const response = await fetch('/api/drive/sync-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indexPayload: photos,
          requestCount: syncStatus.rateLimitQuota.usedRequestsThisMin,
        }),
      });
      const data = await response.json();
      setSyncStatus((prev) => ({
        ...prev,
        isSyncingNow: false,
        lastSyncedAt: new Date().toLocaleTimeString(),
        indexFileSizeKb: data.indexSizeKb || 15.2,
        rawStorageMb: data.rawStorageMb || 44.1,
      }));
      showToast('☁️ library_index.json synced to Google Drive appDataFolder');
    } catch (err) {
      console.error('Drive sync failed:', err);
      setSyncStatus((prev) => ({ ...prev, isSyncingNow: false }));
    }
  };

  // Update photos from 3x3 Gemini Batch Scan
  const handleBatchUpdatePhotos = (results: any[]) => {
    updateAndPersistPhotos((prev) =>
      prev.map((photo) => {
        const match = results.find((r: any) => r.photoId === photo.id);
        if (match) {
          return {
            ...photo,
            context: match.context || photo.context,
            isUsCouple: match.isUsCouple !== undefined ? match.isUsCouple : photo.isUsCouple,
            visualTriggers: match.visualTriggers || match.triggers || photo.visualTriggers,
            semanticTags: match.semanticTags || photo.semanticTags,
            nostalgicSummary: match.nostalgicSummary || photo.nostalgicSummary,
            aestheticScore: match.aestheticScore || photo.aestheticScore,
          };
        }
        return photo;
      })
    );
    showToast('✨ 3x3 Batch AI Scan completed! Metadata updated.');
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    updateAndPersistPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Add photo to Anniversary Recap
  const handleAddToRecap = (photo: PhotoItem) => {
    showToast(`🎬 Added "${photo.title}" to Anniversary Cinema queue!`);
    setActiveTab('cinema');
  };

  // Add new photos
  const handleAddPhotos = (newPhotos: PhotoItem[]) => {
    updateAndPersistPhotos((prev) => [...newPhotos, ...prev]);
    showToast(`📸 Imported ${newPhotos.length} new photos to Vault & synchronized.`);
  };

  // Toggle Free vs Pro SaaS Tier
  const handleToggleTier = () => {
    const nextTier = tier === 'free' ? 'pro' : 'free';
    setTier(nextTier);
    showToast(nextTier === 'pro' ? '👑 PRO Vault Plan Activated!' : 'Switched to Free Tier plan');
  };

  // Cache settings handlers
  const handleUpdateCacheSettings = (newSettings: CacheSettings) => {
    setCacheSettings(newSettings);
    localStorage.setItem('togetherlens_cache_settings', JSON.stringify(newSettings));
  };

  const handleTogglePinAlbum = (albumId: string) => {
    const isCurrentlyPinned = cacheSettings.pinnedAlbumIds.includes(albumId);
    const newPinnedIds = isCurrentlyPinned
      ? cacheSettings.pinnedAlbumIds.filter(id => id !== albumId)
      : [...cacheSettings.pinnedAlbumIds, albumId];
    
    handleUpdateCacheSettings({
      ...cacheSettings,
      pinnedAlbumIds: newPinnedIds,
    });

    // Update photos within album to be pinned
    const targetAlbum = autoAlbums.find(a => a.id === albumId);
    if (targetAlbum) {
      updateAndPersistPhotos(prev => prev.map(p => {
        if (targetAlbum.photoIds.includes(p.id)) {
          return {
            ...p,
            isPinnedOffline: !isCurrentlyPinned,
            cachedTier: !isCurrentlyPinned ? 'full' : p.cachedTier,
          };
        }
        return p;
      }));
    }

    showToast(isCurrentlyPinned ? `Removed album pin (${targetAlbum?.title || ''})` : `📌 Pinned "${targetAlbum?.title || 'Album'}" offline! (Protected from LRU eviction)`);
  };

  const handleTogglePinPhoto = (photoId: string) => {
    updateAndPersistPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        const next = !p.isPinnedOffline;
        showToast(next ? `📌 Pinned photo offline for instant full-res access!` : `Unpinned photo (now evictable on LRU)`);
        return {
          ...p,
          isPinnedOffline: next,
          cachedTier: next ? 'full' : p.cachedTier,
        };
      }
      return p;
    }));
  };

  const handlePhotosUpdated = (updatedPhotos: PhotoItem[]) => {
    updateAndPersistPhotos(() => updatedPhotos);
  };


  return (
    <div 
      data-theme={activeThemeId}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        activeTheme.isDark ? 'bg-stone-900 text-stone-100' : 'bg-[#f7f4ee] text-stone-850'
      } ${ambientGlow ? 'ambient-glow-effect' : ''} ${filmGrain ? 'film-grain-overlay' : ''}`}
      style={{
        backgroundColor: activeTheme.palette.bg,
        color: activeTheme.palette.textPrimary,
        ['--theme-glow' as any]: activeTheme.palette.glow,
      }}
    >
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-900/95 border border-rose-500/50 text-stone-100 text-xs sm:text-sm shadow-2xl backdrop-blur-md animate-slide-up">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <HeaderNav
        profile={profile}
        syncStatus={syncStatus}
        tier={tier}
        activeTab={activeTab}
        activeThemeId={activeThemeId}
        googleUser={googleUser}
        hasLiveGoogleToken={hasLiveGoogleToken}
        isAuthenticating={isAuthenticating}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTheme={() => setIsThemeModalOpen(true)}
        onToggleTier={handleToggleTier}
        onTriggerDriveSync={handleTriggerDriveSync}
      />

      {/* Main View Display */}
      <main className="flex-1 pb-16">
        {activeTab === 'timeline' && (
          <UsTimeline
            photos={photos}
            profile={profile}
            onSelectPhoto={setSelectedPhoto}
            onToggleFavorite={handleToggleFavorite}
            onAddToRecap={handleAddToRecap}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'albums' && (
          <AutomatedAlbumGenerator
            photos={photos}
            profile={profile}
            tier={tier}
            pinnedAlbumIds={cacheSettings.pinnedAlbumIds}
            onSelectPhoto={setSelectedPhoto}
            onPlayAlbumInCinema={(albumPhotos, albumTitle) => {
              showToast(`🎬 Loaded ${albumPhotos.length} moments from "${albumTitle}" into Cinema!`);
              setActiveTab('cinema');
            }}
            onTogglePinAlbum={handleTogglePinAlbum}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'memories' && (
          <SmartMemoryResurfacing
            photos={photos}
            profile={profile}
            onSelectPhoto={setSelectedPhoto}
          />
        )}

        {activeTab === 'capsules' && (
          <TimeCapsuleStudio
            capsules={timeCapsules}
            photos={photos}
            profile={profile}
            tier={tier}
            onAddCapsule={handleAddCapsule}
            onUnlockCapsule={handleUnlockCapsule}
            onSelectPhoto={setSelectedPhoto}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'storybook' && (
          <StorybookPrintGenerator
            photos={photos}
            profile={profile}
            tier={tier}
            onSelectPhoto={setSelectedPhoto}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'batch' && (
          <BatchAnalysisStudio
            photos={photos}
            onBatchUpdatePhotos={handleBatchUpdatePhotos}
            onTriggerDriveSync={handleTriggerDriveSync}
          />
        )}

        {activeTab === 'cinema' && (
          <AnniversaryCinema
            photos={photos}
            tier={tier}
            onUnlockPro={() => setTier('pro')}
          />
        )}

        {activeTab === 'vault' && (
          <DriveCloudVault
            photos={photos}
            albums={autoAlbums}
            syncStatus={syncStatus}
            cacheSettings={cacheSettings}
            tier={tier}
            googleUser={googleUser}
            hasLiveGoogleToken={hasLiveGoogleToken}
            isAuthenticating={isAuthenticating}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onTriggerDriveSync={handleTriggerDriveSync}
            onToggleTier={handleToggleTier}
            onUpdateCacheSettings={handleUpdateCacheSettings}
            onPhotosUpdated={handlePhotosUpdated}
            onTogglePinAlbum={handleTogglePinAlbum}
            onTogglePinPhoto={handleTogglePinPhoto}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/60 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-stone-400 font-serif-title font-medium">TogetherLens</span>
            <span>— Zero-Backend Cloud Vault for Couples</span>
          </div>
          <div className="font-mono text-[11px] text-stone-400">
            Google Drive appDataFolder • sqlite-vec • Gemini Vision 3x3 Batch
          </div>
        </div>
      </footer>

      {/* Semantic Search Overlay Modal */}
      <SemanticSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        photos={photos}
        tier={tier}
        onSelectPhoto={setSelectedPhoto}
        onUnlockPro={() => setTier('pro')}
      />

      {/* Photo Detail & Face Inspector Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        profile={profile}
        onClose={() => setSelectedPhoto(null)}
        onToggleFavorite={handleToggleFavorite}
        onAddToRecap={handleAddToRecap}
        onTogglePinPhoto={handleTogglePinPhoto}
        onShowToast={showToast}
      />


      {/* Upload & Album Import Modal */}
      <BulkUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddPhotos={handleAddPhotos}
        profile={profile}
      />

      {/* Design Theme Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={handleSelectTheme}
        ambientGlow={ambientGlow}
        onToggleAmbientGlow={handleToggleAmbientGlow}
        filmGrain={filmGrain}
        onToggleFilmGrain={handleToggleFilmGrain}
      />

      {/* Floating Procedural Soundscape Player */}
      <SoundscapeFloatingPlayer
        currentPhotoContextTitle={selectedPhoto?.title}
        onShowToast={showToast}
      />

    </div>
  );
}
