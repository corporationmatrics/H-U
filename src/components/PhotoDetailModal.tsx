import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Eye, 
  Cloud, 
  Database, 
  Star, 
  Film, 
  Share2, 
  HardDrive,
  Info,
  Check,
  Pin,
  ZoomIn,
  ZoomOut,
  Layers,
  ShieldCheck,
  Download,
  Headphones,
  Waves
} from 'lucide-react';
import { PhotoItem, CoupleProfile } from '../types';
import { getResolutionTierUrls, TIER_SIZES_KB, generatePhotoSha256 } from '../utils/cacheManager';
import { proceduralAudio, SOUNDSCAPE_PRESETS } from '../utils/proceduralAudio';

interface PhotoDetailModalProps {
  photo: PhotoItem | null;
  profile: CoupleProfile;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onAddToRecap: (photo: PhotoItem) => void;
  onTogglePinPhoto?: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  profile,
  onClose,
  onToggleFavorite,
  onAddToRecap,
  onTogglePinPhoto,
  onShowToast,
}) => {
  const [showFaceBoxes, setShowFaceBoxes] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<'thumb' | 'medium' | 'full'>('medium');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!photo) return null;

  const tierUrls = getResolutionTierUrls(photo.url);
  const currentDisplayUrl = 
    activeTier === 'thumb' 
      ? (photo.thumbnail || tierUrls.thumbnailUrl)
      : activeTier === 'full' 
        ? (photo.fullOriginalUrl || tierUrls.fullOriginalUrl)
        : (photo.mediumUrl || tierUrls.mediumUrl);

  const hash = photo.sha256Hash || generatePhotoSha256(photo);

  const handleCopyMemory = () => {
    const text = `📸 ${photo.title} (${photo.location.name}) — "${photo.nostalgicSummary}" • TogetherLens`;
    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectTier = (tier: 'thumb' | 'medium' | 'full') => {
    setActiveTier(tier);
    if (tier === 'full') {
      onShowToast?.(`☁️ Streamed Full RAW Original (${photo.fileSizeKb || TIER_SIZES_KB.fullOriginal} KB) from Drive vault`);
    }
  };

  const handleToggleZoom = () => {
    if (!isZoomed && activeTier !== 'full') {
      setActiveTier('full');
      onShowToast?.('🔍 Pulled Full Original from Drive for 100% optical zoom');
    }
    setIsZoomed(!isZoomed);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left: High-Res Photo Stage with Bounding Box overlays */}
        <div className="lg:w-3/5 bg-stone-950 relative flex items-center justify-center min-h-[320px] sm:min-h-[440px] overflow-hidden">
          <div className={`w-full h-full flex items-center justify-center transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-grab overflow-auto' : ''}`}>
            <img
              src={currentDisplayUrl}
              alt={photo.title}
              className="w-full h-full object-contain max-h-[75vh]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Face Bounding Box Overlays */}
          {showFaceBoxes && !isZoomed && photo.detectedFaces.boxes.map((box) => (
            <div
              key={box.id}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
              }}
              className={`absolute border-2 rounded pointer-events-none ${
                box.label.includes('Alex')
                  ? 'border-rose-400 bg-rose-500/10 ring-2 ring-rose-500/30'
                  : box.label.includes('Taylor')
                  ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-500/30'
                  : 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/30'
              }`}
            >
              <span 
                className={`absolute -top-6 left-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow ${
                  box.label.includes('Alex') ? 'bg-rose-600' : box.label.includes('Taylor') ? 'bg-amber-600' : 'bg-sky-600'
                }`}
              >
                {box.label} ({Math.round(box.confidence * 100)}%)
              </span>
            </div>
          ))}

          {/* Top Resolution Tier Switcher overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px] font-mono shadow-lg">
            <button
              onClick={() => handleSelectTier('thumb')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeTier === 'thumb' 
                  ? 'bg-teal-500 text-stone-950 font-bold' 
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Permanent Local Cache (42 KB)"
            >
              Thumb (42KB)
            </button>
            <button
              onClick={() => handleSelectTier('medium')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeTier === 'medium' 
                  ? 'bg-sky-500 text-stone-950 font-bold' 
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Medium Preview (~420 KB)"
            >
              Medium (420KB)
            </button>
            <button
              onClick={() => handleSelectTier('full')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeTier === 'full' 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Full Original in Drive (8.6 MB)"
            >
              Full RAW (Drive)
            </button>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            {/* Toggle Bounding Boxes overlay on photo */}
            <button
              onClick={() => setShowFaceBoxes(!showFaceBoxes)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-stone-300 text-xs font-medium backdrop-blur-md border border-stone-700 shadow-md"
            >
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>Face Overlays: {showFaceBoxes ? 'ON' : 'OFF'}</span>
            </button>

            {/* Zoom Toggle */}
            <button
              onClick={handleToggleZoom}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md border shadow-md transition-all ${
                isZoomed 
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold' 
                  : 'bg-stone-900/80 hover:bg-stone-900 text-stone-300 border-stone-700'
              }`}
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isZoomed ? 'Reset Zoom' : '100% Zoom'}</span>
            </button>
          </div>
        </div>

        {/* Right: AI Vision & Memory Metadata Pane */}
        <div className="lg:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-6 bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800">
          
          {/* Header & Close */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  {photo.context}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Aesthetic: {photo.aestheticScore}/100
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-serif-title font-bold text-stone-100">
              {photo.title}
            </h2>

            <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                {photo.month} {photo.year}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {photo.location.name} ({photo.location.country})
              </span>
            </div>
          </div>

          {/* Gemini Nostalgic Reflection */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Nostalgic Reflection
            </span>
            <p className="font-serif-title text-sm text-stone-200 italic leading-relaxed">
              &ldquo;{photo.nostalgicSummary}&rdquo;
            </p>
          </div>

          {/* Storage Tier & Deduplication Info */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                Storage &amp; Deduplication Tier
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                photo.isPinnedOffline 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}>
                {photo.isPinnedOffline ? '📌 Pinned Offline' : '⚡ Evictable Cache'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Cloud Store:</span>
                <span className="text-emerald-300 font-mono font-semibold flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Drive appDataFolder
                </span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">SHA-256 Deduplication:</span>
                <span className="text-stone-300 font-mono truncate block" title={hash}>
                  {hash.slice(0, 16)}...
                </span>
              </div>
            </div>
          </div>

          {/* Face Detection & Triggers Breakdown */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>Semantic Tags &amp; Vision Vectors</span>
            </h4>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {photo.semanticTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] font-mono border border-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Acoustic Memory Soundscape trigger */}
          {(() => {
            const matchedPresetId = proceduralAudio.matchSoundscapeForPhoto(photo);
            const preset = SOUNDSCAPE_PRESETS[matchedPresetId];
            return (
              <button
                id={`play-soundscape-photo-${photo.id}`}
                onClick={() => {
                  proceduralAudio.play(matchedPresetId);
                  onShowToast?.(`🎧 Playing ambient soundscape: "${preset.name}"`);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-950/40 hover:bg-teal-950/70 border border-teal-700/40 text-teal-200 text-xs transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-semibold text-stone-200 block truncate">{preset.name}</span>
                    <span className="text-[10px] text-teal-400 font-mono block truncate">Generative Web Audio • Auto-matched</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-teal-500 text-stone-950 font-bold text-[11px] shrink-0">
                  Play Ambience
                </span>
              </button>
            );
          })()}

          {/* Action Row */}
          <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onToggleFavorite(photo.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                photo.isFavorite
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-white' : ''}`} />
              <span>{photo.isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>

            {onTogglePinPhoto && (
              <button
                onClick={() => onTogglePinPhoto(photo.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  photo.isPinnedOffline
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/50'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
                title="Pin full original locally, bypassing LRU cache eviction"
              >
                <Pin className={`w-3.5 h-3.5 ${photo.isPinnedOffline ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{photo.isPinnedOffline ? 'Pinned Offline' : 'Keep Offline'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onAddToRecap(photo);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Add to Cinema</span>
            </button>

            <button
              onClick={handleCopyMemory}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

