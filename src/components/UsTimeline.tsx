import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Filter, 
  Eye, 
  ShieldAlert, 
  Check, 
  Star, 
  SlidersHorizontal,
  Flame,
  Camera,
  Layers,
  Film
} from 'lucide-react';
import { PhotoItem, CoupleProfile, ActivePartnerView } from '../types';

interface UsTimelineProps {
  photos: PhotoItem[];
  profile: CoupleProfile;
  activePartnerView?: ActivePartnerView;
  onSelectPhoto: (photo: PhotoItem) => void;
  onToggleFavorite: (id: string) => void;
  onAddToRecap: (photo: PhotoItem) => void;
  onOpenUpload?: () => void;
}

type TimelineFilter = 'only-us' | 'partner-favorites' | 'partner-solo' | 'all' | 'trips' | 'milestones' | 'dates' | 'clutter';

export const UsTimeline: React.FC<UsTimelineProps> = ({
  photos,
  profile,
  activePartnerView = 'together',
  onSelectPhoto,
  onToggleFavorite,
  onAddToRecap,
  onOpenUpload,
}) => {
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('only-us');
  const [showFaceBoxesPreview, setShowFaceBoxesPreview] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'aesthetic'>('newest');

  const currentPartnerName = activePartnerView === 'partner1' ? profile.partner1Name : activePartnerView === 'partner2' ? profile.partner2Name : 'Both of Us';
  const otherPartnerName = activePartnerView === 'partner1' ? profile.partner2Name : activePartnerView === 'partner2' ? profile.partner1Name : null;

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      if (activeFilter === 'only-us') {
        return p.isUsCouple && !p.visualTriggers.isClutterOrReceipt;
      }
      if (activeFilter === 'partner-favorites') {
        return p.isFavorite && !p.visualTriggers.isClutterOrReceipt;
      }
      if (activeFilter === 'partner-solo') {
        if (activePartnerView === 'partner1') {
          return p.detectedFaces.partner2Detected && !p.visualTriggers.isClutterOrReceipt;
        }
        if (activePartnerView === 'partner2') {
          return p.detectedFaces.partner1Detected && !p.visualTriggers.isClutterOrReceipt;
        }
        return p.facesCount === 1 && !p.visualTriggers.isClutterOrReceipt;
      }
      if (activeFilter === 'all') {
        return !p.visualTriggers.isClutterOrReceipt;
      }
      if (activeFilter === 'trips') {
        return ['Road Trip', 'Beach Getaway', 'City Stroll', 'Mountain Hike'].includes(p.context);
      }
      if (activeFilter === 'milestones') {
        return ['Anniversary Dinner', 'Proposal & Ring', 'Celebration & Party'].includes(p.context) || p.visualTriggers.hasRing || p.visualTriggers.hasCake;
      }
      if (activeFilter === 'dates') {
        return ['Cozy Date', 'Home Cooking', 'Golden Hour'].includes(p.context) || p.visualTriggers.hasFoodOrWine;
      }
      if (activeFilter === 'clutter') {
        return p.visualTriggers.isClutterOrReceipt;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.aestheticScore - a.aestheticScore;
    });
  }, [photos, activeFilter, sortBy, activePartnerView]);

  // Group photos by Year + Month
  const groupedTimeline = useMemo(() => {
    const groups: { [key: string]: PhotoItem[] } = {};
    filteredPhotos.forEach((photo) => {
      const key = `${photo.month} ${photo.year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
    });
    return Object.entries(groups).map(([label, items]) => ({ label, items }));
  }, [filteredPhotos]);

  const usCoupleCount = photos.filter(p => p.isUsCouple && !p.visualTriggers.isClutterOrReceipt).length;
  const clutterCount = photos.filter(p => p.visualTriggers.isClutterOrReceipt).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Algorithmic Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-800/40 p-4 sm:p-5 rounded-2xl border border-stone-800 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Heart className="w-4 h-4 fill-rose-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-100">
              The Us Timeline
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-stone-700/80 text-rose-300 border border-stone-600">
              {filteredPhotos.length} moments
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
            Algorithmic couple feed powered by on-device ML Kit & Gemini vision. Automatically filters for photos where both <strong className="text-stone-200">{profile.partner1Name}</strong> and <strong className="text-stone-200">{profile.partner2Name}</strong> are detected together, suppressing screenshots and solo clutter.
          </p>
        </div>

        {/* Controls: Face Bounding Boxes Toggle & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="toggle-face-boxes"
            onClick={() => setShowFaceBoxesPreview(!showFaceBoxesPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showFaceBoxesPreview
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}
            title="Toggle face detection bounding boxes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Face Overlays: {showFaceBoxesPreview ? 'ON' : 'OFF'}</span>
          </button>

          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-all shadow-sm"
              title="Add photos with 3x3 batching & Drive sync"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Bulk Ingest</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-700 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <select
              id="sort-timeline-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-stone-900 text-stone-200">Chronological (Newest)</option>
              <option value="oldest" className="bg-stone-900 text-stone-200">Chronological (Oldest)</option>
              <option value="aesthetic" className="bg-stone-900 text-stone-200">Aesthetic Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-stone-800">
        <button
          id="filter-only-us"
          onClick={() => setActiveFilter('only-us')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'only-us'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <Heart className="w-4 h-4 fill-current text-rose-200" />
          <span>Only Us (Both Faces)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono font-bold">
            {usCoupleCount}
          </span>
        </button>

        {/* Perspective Favorites */}
        <button
          id="filter-partner-favorites"
          onClick={() => setActiveFilter('partner-favorites')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'partner-favorites'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md font-semibold'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>
            {activePartnerView === 'partner1'
              ? `${profile.partner1Name}'s Favorites`
              : activePartnerView === 'partner2'
              ? `${profile.partner2Name}'s Favorites`
              : 'Star Favorites'}
          </span>
        </button>

        {/* Perspective Partner Solos */}
        {otherPartnerName && (
          <button
            id="filter-partner-solo"
            onClick={() => setActiveFilter('partner-solo')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'partner-solo'
                ? 'bg-rose-700 text-white shadow-md font-semibold'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
            }`}
          >
            <span>
              {activePartnerView === 'partner1'
                ? `💖 Photos of ${profile.partner2Name}`
                : `💖 Photos of ${profile.partner1Name}`}
            </span>
          </button>
        )}

        <button
          id="filter-all"
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-stone-100 text-stone-900 font-semibold'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <span>All Photos (Solo Included)</span>
        </button>

        <button
          id="filter-trips"
          onClick={() => setActiveFilter('trips')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'trips'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <span>✈️ Trips & Adventures</span>
        </button>

        <button
          id="filter-milestones"
          onClick={() => setActiveFilter('milestones')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'milestones'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <span>💍 Milestones & Rings</span>
        </button>

        <button
          id="filter-dates"
          onClick={() => setActiveFilter('dates')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'dates'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
          }`}
        >
          <span>🍷 Cozy Dates & Food</span>
        </button>

        <button
          id="filter-clutter"
          onClick={() => setActiveFilter('clutter')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ml-auto ${
            activeFilter === 'clutter'
              ? 'bg-stone-700 text-amber-300 border border-amber-500/40 shadow-md'
              : 'bg-stone-900/60 text-stone-500 hover:text-stone-400 border border-stone-800'
          }`}
          title="Inspect receipts and screenshots filtered out by Gemini"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Quarantined Clutter</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
            {clutterCount}
          </span>
        </button>
      </div>

      {/* Notice if Clutter Filter is active */}
      {activeFilter === 'clutter' && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-300">Intelligent Clutter Isolation Active:</strong> These items were classified with <code className="bg-amber-900/60 px-1 py-0.5 rounded text-[11px]">isClutterOrReceipt: true</code> during the 3x3 Gemini Batch Scan (boarding passes, food receipts, accidental screenshots). They remain safely stored in Google Drive <code className="bg-amber-900/60 px-1 py-0.5 rounded text-[11px]">appDataFolder</code> but are omitted from your primary couple storybook.
          </div>
        </div>
      )}

      {/* Timeline Sections */}
      {groupedTimeline.length === 0 ? (
        <div className="text-center py-16 bg-stone-800/20 rounded-2xl border border-stone-800 space-y-3">
          <Heart className="w-12 h-12 text-stone-600 mx-auto mb-1" />
          <p className="text-stone-300 font-medium">No moments matching this filter</p>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            Try switching filter tabs or import new albums with client-side 3x3 batching &amp; Drive sync.
          </p>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Bulk Uploader</span>
            </button>
          )}
        </div>
      ) : (
        groupedTimeline.map(({ label, items }) => (
          <div key={label} className="space-y-4">
            
            {/* Sticky Month/Year Header */}
            <div className="sticky top-28 z-20 flex items-center gap-3 bg-stone-900/90 backdrop-blur-md py-2 border-b border-stone-800/60">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></div>
              <h2 className="font-serif-title font-bold text-lg text-stone-200 tracking-tight">
                {label}
              </h2>
              <span className="text-xs font-mono text-stone-500">
                {items.length} {items.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((photo) => (
                <div
                  key={photo.id}
                  id={`photo-card-${photo.id}`}
                  className="group relative bg-stone-800/60 hover:bg-stone-800 rounded-2xl border border-stone-700/60 hover:border-rose-500/40 overflow-hidden transition-all duration-300 flex flex-col shadow-lg shadow-black/30 hover:-translate-y-1"
                >
                  {/* Image Container with Face Overlays */}
                  <div 
                    className="relative aspect-4/3 overflow-hidden bg-stone-900 cursor-pointer"
                    onClick={() => onSelectPhoto(photo)}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Simulated ML Kit Face Bounding Boxes Overlay */}
                    {showFaceBoxesPreview && photo.detectedFaces.boxes.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {photo.detectedFaces.boxes.map((box) => (
                          <div
                            key={box.id}
                            style={{
                              left: `${box.x}%`,
                              top: `${box.y}%`,
                              width: `${box.w}%`,
                              height: `${box.h}%`,
                            }}
                            className={`absolute border-2 rounded transition-opacity ${
                              box.label.includes('Alex')
                                ? 'border-rose-400 bg-rose-500/10'
                                : box.label.includes('Taylor')
                                ? 'border-amber-400 bg-amber-500/10'
                                : 'border-sky-400 bg-sky-500/10'
                            }`}
                          >
                            <span 
                              className={`absolute -top-5 left-0 text-[9px] font-mono font-semibold px-1 py-0.2 rounded text-white shadow-sm whitespace-nowrap ${
                                box.label.includes('Alex') ? 'bg-rose-600' : box.label.includes('Taylor') ? 'bg-amber-600' : 'bg-sky-600'
                              }`}
                            >
                              {box.label.split(' ')[0]} {Math.round(box.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {photo.isUsCouple ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600/90 text-white backdrop-blur-md shadow">
                            <Heart className="w-2.5 h-2.5 fill-white" />
                            Us Together
                          </span>
                        ) : photo.visualTriggers.isClutterOrReceipt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            Quarantine
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800/90 text-stone-200 backdrop-blur-md">
                            Solo Moment
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-900/80 text-stone-300 backdrop-blur-md border border-stone-700/50">
                          {photo.context}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(photo.id);
                        }}
                        className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                          photo.isFavorite
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-stone-900/70 hover:bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                        title={photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Quick Triggers */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-stone-300 pointer-events-none">
                      <span className="flex items-center gap-1 text-[11px] bg-stone-950/70 px-2 py-0.5 rounded backdrop-blur-md">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {photo.location.city || photo.location.name}
                      </span>

                      <div className="flex items-center gap-1">
                        {photo.visualTriggers.hasRing && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-stone-950 font-bold text-[10px]" title="Engagement Ring Detected">💍</span>
                        )}
                        {photo.visualTriggers.hasCake && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white font-bold text-[10px]" title="Anniversary Cake Detected">🎂</span>
                        )}
                        {photo.visualTriggers.hasSunset && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/80 text-white font-bold text-[10px]" title="Sunset Detected">🌅</span>
                        )}
                        {photo.visualTriggers.hasPets && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/80 text-white font-bold text-[10px]" title="Pet Detected">🐾</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 
                        className="font-medium text-stone-100 text-sm sm:text-base leading-snug line-clamp-1 hover:text-rose-300 cursor-pointer transition-colors"
                        onClick={() => onSelectPhoto(photo)}
                      >
                        {photo.title}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 italic">
                        &quot;{photo.nostalgicSummary}&quot;
                      </p>
                    </div>

                    {/* Tags & Action row */}
                    <div className="pt-2 border-t border-stone-700/50 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 overflow-hidden h-5">
                        {photo.semanticTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-stone-700/50 text-stone-300 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onAddToRecap(photo)}
                          className="p-1.5 rounded-lg bg-stone-700/70 hover:bg-purple-600/30 text-stone-300 hover:text-purple-300 border border-stone-600 transition-all text-xs flex items-center gap-1"
                          title="Add to Anniversary Recap Story"
                        >
                          <Film className="w-3 h-3" />
                          <span className="text-[10px] hidden xl:inline">Recap</span>
                        </button>

                        <button
                          onClick={() => onSelectPhoto(photo)}
                          className="p-1.5 rounded-lg bg-stone-700/70 hover:bg-stone-600 text-stone-300 hover:text-white border border-stone-600 transition-all"
                          title="Inspect AI Vision Metadata"
                        >
                          <Layers className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        ))
      )}

    </div>
  );
};
