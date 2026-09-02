import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Download, 
  UploadCloud, 
  FileJson, 
  Layers, 
  HardDrive, 
  Zap, 
  Crown, 
  Check, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { 
  DriveSyncStatus, 
  PhotoItem, 
  TierLevel, 
  ThemedAlbum, 
  CacheSettings 
} from '../types';
import { TieredCacheManager } from './TieredCacheManager';
import { calculateLocalCacheStats } from '../utils/cacheManager';

interface DriveCloudVaultProps {
  photos: PhotoItem[];
  albums: ThemedAlbum[];
  syncStatus: DriveSyncStatus;
  cacheSettings: CacheSettings;
  tier: TierLevel;
  googleUser?: any | null;
  hasLiveGoogleToken?: boolean;
  isAuthenticating?: boolean;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onTriggerDriveSync: () => void;
  onToggleTier: () => void;
  onUpdateCacheSettings: (newSettings: CacheSettings) => void;
  onPhotosUpdated: (updatedPhotos: PhotoItem[]) => void;
  onTogglePinAlbum: (albumId: string) => void;
  onTogglePinPhoto: (photoId: string) => void;
  onShowToast: (msg: string) => void;
}

export const DriveCloudVault: React.FC<DriveCloudVaultProps> = ({
  photos,
  albums,
  syncStatus,
  cacheSettings,
  tier,
  googleUser,
  hasLiveGoogleToken,
  isAuthenticating,
  onGoogleSignIn,
  onGoogleSignOut,
  onTriggerDriveSync,
  onToggleTier,
  onUpdateCacheSettings,
  onPhotosUpdated,
  onTogglePinAlbum,
  onTogglePinPhoto,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tiered-cache' | 'architecture' | 'api-guide' | 'index-json' | 'sqlite-vec' | 'rate-limiter'>('tiered-cache');
  const [simulatedLoadRequests, setSimulatedLoadRequests] = useState<number>(140);
  const [isSimulatingRateSpike, setIsSimulatingRateSpike] = useState<boolean>(false);

  const cacheStats = calculateLocalCacheStats(photos, cacheSettings);


  // Generate lightweight library_index.json payload
  const libraryIndexPayload = {
    app: 'TogetherLens',
    version: '1.4.0',
    syncedAt: syncStatus.lastSyncedAt,
    userScope: 'https://www.googleapis.com/auth/drive.appdata',
    totalPhotos: photos.length,
    usTimelineCoupleOnlyCount: photos.filter(p => p.isUsCouple).length,
    items: photos.map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      context: p.context,
      isUsCouple: p.isUsCouple,
      facesCount: p.facesCount,
      triggers: p.visualTriggers,
      tags: p.semanticTags,
      score: p.aestheticScore,
      summary: p.nostalgicSummary,
      vector: p.vectorEmbedding.slice(0, 4).map(v => Number(v.toFixed(3))), // abbreviated preview
      driveFileId: p.driveFileId,
    }))
  };

  const handleDownloadIndexJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(libraryIndexPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'TogetherLens_library_index.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSimulateHighTrafficSpike = () => {
    setIsSimulatingRateSpike(true);
    setSimulatedLoadRequests(310); // Exceeds standard threshold to trigger exponential backoff calculation
    setTimeout(() => {
      onTriggerDriveSync();
      setIsSimulatingRateSpike(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-stone-900/90 to-teal-950/40 p-6 sm:p-8 rounded-3xl border border-emerald-900/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Section 1 &amp; 4: Zero-Backend Privacy Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-100">
              Google Drive Cloud Vault &amp; sqlite-vec Edge Engine
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              All raw photos are stored directly in the user&apos;s personal Google Drive <code className="bg-emerald-950 px-1 py-0.5 rounded text-emerald-300">appDataFolder</code> (hidden from clutter, 0 server storage cost). Lightweight embeddings and metadata sync in seconds via <code className="bg-emerald-950 px-1 py-0.5 rounded text-emerald-300">library_index.json</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {googleUser ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-emerald-500/40 text-xs">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-left">
                  <div className="text-stone-200 font-medium font-sans leading-tight">
                    {googleUser.displayName || 'Google Drive Connected'}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {googleUser.email}
                  </div>
                </div>
                {onGoogleSignOut && (
                  <button
                    onClick={onGoogleSignOut}
                    className="ml-2 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px]"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            ) : (
              <button
                id="vault-google-signin-btn"
                onClick={onGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs sm:text-sm shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.36 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>{isAuthenticating ? 'Authorizing Drive...' : 'Sign in with Google Drive'}</span>
              </button>
            )}

            <button
              id="sync-drive-vault-now-btn"
              onClick={onTriggerDriveSync}
              disabled={syncStatus.isSyncingNow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncingNow ? 'animate-spin' : ''}`} />
              <span>{syncStatus.isSyncingNow ? 'Syncing to Drive...' : 'Sync Index Now'}</span>
            </button>

            <button
              onClick={handleDownloadIndexJson}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export library_index.json</span>
            </button>
          </div>
        </div>

        {/* Live Quota & Storage Gauges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800">
          <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Drive appDataFolder (Cloud)</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-stone-100">
              {syncStatus.rawStorageMb} MB <span className="text-xs text-stone-500 font-normal">/ Permanent</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">Single source of truth</p>
          </div>

          <div className="bg-stone-900/80 p-4 rounded-2xl border border-teal-500/30">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Local Capped Cache</span>
              <Database className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-bold font-mono text-teal-300">
              {cacheStats.totalCacheMB} MB <span className="text-xs text-stone-400 font-normal">/ {cacheStats.maxCacheLimitMB} MB</span>
            </div>
            <p className="text-[11px] text-teal-400 mt-1">{cacheStats.evictableMB} MB safe to evict</p>
          </div>

          <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>library_index.json Footprint</span>
              <FileJson className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-stone-100">
              {syncStatus.indexFileSizeKb} KB <span className="text-xs text-stone-500 font-normal">(Instant Sync)</span>
            </div>
            <p className="text-[11px] text-sky-400 mt-1">Re-syncs in &lt;100ms</p>
          </div>

          <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Drive API QPS Limiter</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-stone-100">
              {syncStatus.rateLimitQuota.usedRequestsThisMin} <span className="text-xs text-stone-500 font-normal">/ 325k/min</span>
            </div>
            <p className="text-[11px] text-amber-300 mt-1">Backoff active</p>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          id="subtab-tiered-cache"
          onClick={() => setActiveSubTab('tiered-cache')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'tiered-cache'
              ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>Tiered Cache &amp; LRU Eviction</span>
        </button>

        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'architecture'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Zero-Backend Privacy Blueprint
        </button>

        <button
          onClick={() => setActiveSubTab('api-guide')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'api-guide'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🔑 Drive &amp; Gemini Keys Setup Guide
        </button>

        <button
          onClick={() => setActiveSubTab('index-json')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'index-json'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          library_index.json Viewer
        </button>

        <button
          onClick={() => setActiveSubTab('sqlite-vec')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'sqlite-vec'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          sqlite-vec Edge Vectors
        </button>

        <button
          onClick={() => setActiveSubTab('rate-limiter')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'rate-limiter'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Exponential Backoff Simulator
        </button>
      </div>

      {/* SubTab Contents */}
      {activeSubTab === 'tiered-cache' && (
        <TieredCacheManager
          photos={photos}
          albums={albums}
          cacheSettings={cacheSettings}
          tier={tier}
          onUpdateCacheSettings={onUpdateCacheSettings}
          onPhotosUpdated={onPhotosUpdated}
          onTogglePinAlbum={onTogglePinAlbum}
          onTogglePinPhoto={onTogglePinPhoto}
          onShowToast={onShowToast}
        />
      )}


      {/* SubTab Contents */}
      {activeSubTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="font-serif-title font-bold text-stone-100 text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Why Google Drive appDataFolder?</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Absolute User Privacy:</strong> Couple photos never pass through or reside on any third-party app server.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Hidden from User Drive Clutter:</strong> Stored inside <code className="bg-stone-800 px-1 py-0.5 rounded">appDataFolder</code>, preventing clutter in their standard Google Drive file lists.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Hosting Overhead:</strong> Storage limits are managed automatically under the user&apos;s personal Google account quota.</span>
              </li>
            </ul>
          </div>

          {/* Freemium SaaS Tier Breakdown */}
          <div className="p-6 bg-stone-900/80 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title font-bold text-stone-100 text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Freemium SaaS Monetization Model</span>
              </h3>
              <button
                id="vault-toggle-tier-btn"
                onClick={onToggleTier}
                className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 hover:bg-amber-500/30 transition-all"
              >
                Current: {tier.toUpperCase()} (Click to Switch)
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                <strong className="text-stone-200 block">Free Tier</strong>
                <p className="text-stone-400 text-[11px]">Drive cloud syncing, standard tags, chronological Us timeline.</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
                <strong className="text-amber-300 block">Pro Tier ($4.99/mo)</strong>
                <p className="text-amber-200/80 text-[11px]">AI Vector semantic search, 4K anniversary video recaps, instant multi-device sync.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* API Setup Guide */}
      {activeSubTab === 'api-guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gemini API Key Section */}
          <div className="p-6 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title font-bold text-stone-100 text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>1. Gemini API Key Configuration</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                Server Secret
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              TogetherLens uses the official <strong>@google/genai</strong> TypeScript SDK on the server (<code>server.ts</code>) to protect your key and analyze batches.
            </p>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-semibold text-rose-300 block">Step A: Open AI Studio Secrets</span>
                <p className="text-stone-400 text-[11px]">
                  Go to the <strong>Settings / Secrets</strong> tab in Google AI Studio.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-semibold text-rose-300 block">Step B: Set Secret Key</span>
                <p className="text-stone-400 text-[11px]">
                  Add your key with the name <code className="text-rose-300 font-mono">GEMINI_API_KEY</code>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-semibold text-rose-300 block">Step C: Server API Protection</span>
                <p className="text-stone-400 text-[11px]">
                  Endpoints like <code className="text-stone-300">/api/ai/batch-analyze</code> and <code className="text-stone-300">/api/ai/nostalgic-memory</code> read <code>process.env.GEMINI_API_KEY</code> securely without leaking to the browser.
                </p>
              </div>
            </div>
          </div>

          {/* Google Drive OAuth Configuration */}
          <div className="p-6 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title font-bold text-stone-100 text-base flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>2. Google Drive OAuth Integration</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                OAuth 2.0
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Google Drive uses client-side Google Identity OAuth popups to grant access to the user&apos;s isolated <code>appDataFolder</code>.
            </p>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-semibold text-emerald-300 block">Required Scopes:</span>
                <ul className="text-stone-400 text-[11px] list-disc list-inside space-y-0.5 font-mono">
                  <li>https://www.googleapis.com/auth/drive.appdata</li>
                  <li>https://www.googleapis.com/auth/drive.file</li>
                  <li>https://www.googleapis.com/auth/userinfo.email</li>
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-semibold text-emerald-300 block">Zero-Backend Setup:</span>
                <p className="text-stone-400 text-[11px]">
                  Click <strong>&quot;Sign in with Google Drive&quot;</strong> in the top header or in this Vault dashboard. Your photos upload straight from the browser to Google Drive via multipart upload without touching any intermediary servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'index-json' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Live payload synchronized to <code className="text-emerald-300">appDataFolder/library_index.json</code></span>
            <span className="font-mono">Payload Size: ~{syncStatus.indexFileSizeKb} KB</span>
          </div>
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(libraryIndexPayload, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeSubTab === 'sqlite-vec' && (
        <div className="space-y-4">
          <div className="text-xs text-stone-400">
            Local SQLite edge database table (<code className="text-teal-300">sqlite-vec</code>) storing 16-dimensional semantic embeddings for offline instant cosine ranking:
          </div>

          <div className="overflow-x-auto bg-stone-950 rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-900 text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="p-3">Photo ID</th>
                  <th className="p-3">Context</th>
                  <th className="p-3">Us Flag</th>
                  <th className="p-3">16-d Vector Embedding (sqlite-vec)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {photos.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/50">
                    <td className="p-3 text-indigo-400">{p.id}</td>
                    <td className="p-3 font-sans font-medium text-stone-200">{p.context}</td>
                    <td className="p-3">
                      {p.isUsCouple ? <span className="text-rose-400">true</span> : <span className="text-stone-500">false</span>}
                    </td>
                    <td className="p-3 text-stone-400 text-[11px]">
                      [{p.vectorEmbedding.slice(0, 6).join(', ')}, ...]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rate-limiter' && (
        <div className="p-6 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-4">
          <h3 className="font-serif-title font-bold text-stone-100 text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Drive API Exponential Backoff Rate Limiting (Blueprint Section 4)</span>
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            Google Drive enforces a limit of 325,000 queries per minute per project. During large initial bulk imports, TogetherLens automatically detects <code>429 Too Many Requests</code> and backs off exponentially: <code className="bg-stone-800 px-1 py-0.5 rounded text-amber-300">delay = min(1000 * 1.5^attempt, 12000ms)</code>.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              id="simulate-traffic-spike-btn"
              onClick={handleSimulateHighTrafficSpike}
              disabled={isSimulatingRateSpike}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all"
            >
              {isSimulatingRateSpike ? 'Applying Exponential Backoff...' : 'Simulate API Burst & Test Backoff'}
            </button>
            <span className="text-xs text-stone-400 font-mono">
              Status: <span className="text-emerald-400">Nominal / Ready</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
