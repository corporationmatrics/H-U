import React from 'react';
import { 
  Heart, 
  Cloud, 
  Search, 
  Sparkles, 
  Film, 
  Database, 
  Upload, 
  Layers, 
  Calendar, 
  Crown,
  CheckCircle2,
  RefreshCw,
  Palette,
  FolderHeart,
  Hourglass,
  BookOpen,
  Lock,
  UserCheck,
  HardDrive
} from 'lucide-react';
import { CoupleProfile, DriveSyncStatus, TierLevel, AppThemeId, ActivePartnerView } from '../types';
import { THEME_PRESETS } from '../theme/themes';

export type MainTabType = 'timeline' | 'albums' | 'memories' | 'capsules' | 'storybook' | 'batch' | 'cinema' | 'vault';

interface HeaderNavProps {
  profile: CoupleProfile;
  syncStatus: DriveSyncStatus;
  tier: TierLevel;
  activeTab: MainTabType;
  activeThemeId: AppThemeId;
  activePartnerView?: ActivePartnerView;
  googleUser?: any | null;
  hasLiveGoogleToken?: boolean;
  isAuthenticating?: boolean;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onSelectTab: (tab: MainTabType) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenTheme: () => void;
  onOpenPinModal?: () => void;
  onOpenDriveSetup?: () => void;
  onToggleTier: () => void;
  onTriggerDriveSync: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  profile,
  syncStatus,
  tier,
  activeTab,
  activeThemeId,
  activePartnerView = 'together',
  googleUser,
  hasLiveGoogleToken,
  isAuthenticating,
  onGoogleSignIn,
  onGoogleSignOut,
  onSelectTab,
  onOpenSearch,
  onOpenUpload,
  onOpenTheme,
  onOpenPinModal,
  onOpenDriveSetup,
  onToggleTier,
  onTriggerDriveSync,
}) => {
  const currentTheme = THEME_PRESETS[activeThemeId] || THEME_PRESETS['midnight-rose'];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
      {/* Top Banner / Sync Info bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Couple Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center">
              <div className="w-10 h-10 rounded-full ring-2 ring-rose-500 overflow-hidden bg-stone-800 shadow-md">
                <img 
                  src={profile.partner1Avatar} 
                  alt={profile.partner1Name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-10 h-10 rounded-full ring-2 ring-amber-500 overflow-hidden bg-stone-800 -ml-3 shadow-md">
                <img 
                  src={profile.partner2Avatar} 
                  alt={profile.partner2Name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 left-7 bg-rose-600 rounded-full p-0.5 text-white shadow">
                <Heart className="w-3 h-3 fill-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-semibold text-lg text-stone-100 tracking-tight">
                  {profile.relationshipTitle}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {profile.daysTogether} Days of Us
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans hidden sm:block">
                Zero-Backend Cloud Vault • Gemini Vision • sqlite-vec Edge
              </p>
            </div>
          </div>

          {/* Quick Actions & Sync / Tier controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Trigger */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 text-xs sm:text-sm border border-stone-700 transition-all group"
              title="Semantic AI Search"
            >
              <Search className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-stone-400">Search memories...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] bg-stone-900 rounded text-stone-400 border border-stone-700">⌘K</kbd>
            </button>

            {/* Google Drive Account / Sign-In Status Pill */}
            {googleUser ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Google" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="hidden lg:inline text-stone-300 max-w-[120px] truncate font-mono text-[11px]">
                  {googleUser.displayName || googleUser.email?.split('@')[0]}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected to personal Drive" />
                {onGoogleSignOut && (
                  <button 
                    onClick={onGoogleSignOut} 
                    className="ml-1 text-[10px] text-stone-500 hover:text-stone-300"
                    title="Sign Out of Google"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <button
                id="header-google-signin-btn"
                onClick={onGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-all"
                title="Connect Personal Google Drive"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.36 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                <span className="hidden sm:inline">{isAuthenticating ? 'Connecting...' : 'Connect Drive'}</span>
              </button>
            )}

            {/* Google Drive appDataFolder Sync Pill */}
            <button
              id="header-drive-sync-btn"
              onClick={onTriggerDriveSync}
              disabled={syncStatus.isSyncingNow}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 text-xs transition-all"
              title="Google Drive appDataFolder status (Click to sync library_index.json)"
            >
              <Cloud className={`w-3.5 h-3.5 ${syncStatus.isSyncingNow ? 'animate-bounce text-emerald-400' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline font-mono text-[11px]">
                {syncStatus.isSyncingNow ? 'Syncing...' : 'Drive Synced'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Tier Badge */}
            <button
              id="header-tier-toggle-btn"
              onClick={onToggleTier}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                tier === 'pro'
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
              }`}
              title="Toggle Free vs Pro SaaS Tier"
            >
              <Crown className={`w-3.5 h-3.5 ${tier === 'pro' ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} />
              <span>{tier === 'pro' ? 'PRO VAULT' : 'FREE TIER'}</span>
            </button>

            {/* Theme Atmosphere Switcher Button */}
            <button
              id="header-theme-toggle-btn"
              onClick={onOpenTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-750 text-stone-200 border border-stone-700 hover:border-stone-600 text-xs font-medium transition-all group shadow-xs"
              title={`Atmosphere Theme: ${currentTheme.name} (Click to change)`}
            >
              <Palette className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden xl:inline text-stone-300">{currentTheme.name}</span>
              <span 
                className="w-2 h-2 rounded-full border border-black/40 shrink-0" 
                style={{ backgroundColor: currentTheme.palette.accent }} 
              />
            </button>

            {/* Partner Perspective Profile Switcher */}
            {onOpenPinModal && (
              <button
                id="header-partner-perspective-btn"
                onClick={onOpenPinModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  activePartnerView === 'partner1'
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                    : activePartnerView === 'partner2'
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                    : 'bg-stone-800 border-stone-700 text-stone-200 hover:border-stone-600'
                }`}
                title="Switch Profile Perspective or Enter PIN"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">
                  {activePartnerView === 'partner1'
                    ? `${profile.partner1Name} (His View)`
                    : activePartnerView === 'partner2'
                    ? `${profile.partner2Name} (Her View)`
                    : 'Couple View'}
                </span>
                <span className="text-[10px] text-stone-400">🔒 Switch</span>
              </button>
            )}

            {/* Google Drive Setup & Auto-Save Trigger */}
            {onOpenDriveSetup && (
              <button
                id="header-drive-setup-btn"
                onClick={onOpenDriveSetup}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-950/50 hover:bg-sky-900/50 border border-sky-700/60 text-sky-300 text-xs font-medium transition-all"
                title="Configure Google Drive Auto-Save & Folder"
              >
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden lg:inline font-mono text-[11px]">Drive Auto-Save</span>
              </button>
            )}

            {/* Bulk Upload Button */}
            <button
              id="header-bulk-upload-btn"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Bulk Ingestion Engine (Drive appDataFolder & 3x3 Batch)"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar border-t border-stone-800/60 text-xs sm:text-sm">
          <button
            id="tab-us-timeline"
            onClick={() => onSelectTab('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>The Us Timeline</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 font-mono">2-Face Filter</span>
          </button>

          <button
            id="tab-themed-albums"
            onClick={() => onSelectTab('albums')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'albums'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
            <span>Themed Albums</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">Auto Grouped</span>
          </button>

          <button
            id="tab-on-this-day"
            onClick={() => onSelectTab('memories')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'memories'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>On This Day</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">AI Nostalgia</span>
          </button>

          <button
            id="tab-time-capsules"
            onClick={() => onSelectTab('capsules')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'capsules'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-rose-400" />
            <span>Time Capsules</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 font-mono">Wax Sealed</span>
          </button>

          <button
            id="tab-storybook"
            onClick={() => onSelectTab('storybook')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'storybook'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>8x8 Storybook</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">Print Ready</span>
          </button>

          <button
            id="tab-batch-studio"
            onClick={() => onSelectTab('batch')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'batch'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>3x3 Batch AI Studio</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">-88% Tokens</span>
          </button>

          <button
            id="tab-anniversary-cinema"
            onClick={() => onSelectTab('cinema')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'cinema'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Recap Cinema</span>
            {tier === 'pro' && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 font-semibold">HD</span>
            )}
          </button>

          <button
            id="tab-drive-vault"
            onClick={() => onSelectTab('vault')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
              activeTab === 'vault'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drive & sqlite-vec</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
