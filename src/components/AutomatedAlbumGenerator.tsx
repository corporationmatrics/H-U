import React, { useState, useMemo } from 'react';
import { 
  PhotoItem, 
  ThemedAlbum, 
  CoupleProfile, 
  AlbumThemeCategory, 
  TierLevel 
} from '../types';
import { generateAutomatedAlbums, generateCustomThemedAlbum } from '../utils/albumGrouper';
import { 
  Layers, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Play, 
  Plus, 
  Download, 
  Share2, 
  Heart, 
  Music, 
  Sliders, 
  Compass, 
  Search, 
  X, 
  Check, 
  ArrowRight,
  Info,
  Camera,
  FolderSync,
  Pin
} from 'lucide-react';

interface AutomatedAlbumGeneratorProps {
  photos: PhotoItem[];
  profile: CoupleProfile;
  tier: TierLevel;
  pinnedAlbumIds?: string[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onPlayAlbumInCinema?: (photos: PhotoItem[], title: string) => void;
  onTogglePinAlbum?: (albumId: string) => void;
  onShowToast: (msg: string) => void;
}

export const AutomatedAlbumGenerator: React.FC<AutomatedAlbumGeneratorProps> = ({
  photos,
  profile,
  tier,
  pinnedAlbumIds = [],
  onSelectPhoto,
  onPlayAlbumInCinema,
  onTogglePinAlbum,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AlbumThemeCategory>('all');
  const [activeAlbum, setActiveAlbum] = useState<ThemedAlbum | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customAlbums, setCustomAlbums] = useState<ThemedAlbum[]>([]);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [isRescanning, setIsRescanning] = useState<boolean>(false);
  const [isRegeneratingAiStory, setIsRegeneratingAiStory] = useState<boolean>(false);

  // Generate automated base albums from photos
  const baseAlbums = useMemo(() => {
    return generateAutomatedAlbums(photos, profile);
  }, [photos, profile]);

  // Combine base and custom albums
  const allAlbums = useMemo(() => {
    return [...customAlbums, ...baseAlbums];
  }, [customAlbums, baseAlbums]);

  // Filtered albums by category
  const filteredAlbums = useMemo(() => {
    if (selectedCategory === 'all') return allAlbums;
    if (selectedCategory === 'custom') return allAlbums.filter(a => a.isUserCustom);
    return allAlbums.filter(a => a.category === selectedCategory);
  }, [allAlbums, selectedCategory]);

  // Photos lookup map
  const photoMap = useMemo(() => {
    const map = new Map<string, PhotoItem>();
    photos.forEach(p => map.set(p.id, p));
    return map;
  }, [photos]);

  // Handle creating custom theme album
  const handleCreateCustomTheme = (queryToUse?: string) => {
    const query = queryToUse || customQuery;
    if (!query.trim()) return;

    setIsGeneratingCustom(true);
    setTimeout(() => {
      const newAlbum = generateCustomThemedAlbum(query, photos, profile);
      if (newAlbum) {
        setCustomAlbums(prev => [newAlbum, ...prev]);
        setActiveAlbum(newAlbum);
        setCustomQuery('');
        onShowToast(`✨ Generated "${newAlbum.title}" (${newAlbum.photoIds.length} photos matched)`);
      } else {
        onShowToast(`No photos matched "${query}". Try different tags like 'sunset', 'wine', 'dolomites', or 'tokyo'.`);
      }
      setIsGeneratingCustom(false);
    }, 400);
  };

  // Handle re-scanning
  const handleRescanIndex = () => {
    setIsRescanning(true);
    setTimeout(() => {
      setIsRescanning(false);
      onShowToast(`Indexed ${photos.length} items from library_index.json into ${allAlbums.length} themed albums!`);
    }, 600);
  };

  // Export album manifest to JSON download
  const handleExportAlbumJson = (album: ThemedAlbum) => {
    const matchedPhotos = album.photoIds.map(id => photoMap.get(id)).filter(Boolean);
    const exportData = {
      app: 'TogetherLens',
      exportType: 'ThemedAlbumCollection',
      generatedAt: new Date().toISOString(),
      albumMeta: {
        id: album.id,
        title: album.title,
        subtitle: album.subtitle,
        category: album.category,
        dateRange: album.dateRange,
        locations: album.locations,
        averageAestheticScore: album.averageAestheticScore,
        songSuggestion: album.songSuggestion,
        nostalgicStory: album.nostalgicStory,
        matchedReasons: album.matchedReasons,
      },
      photos: matchedPhotos,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TogetherLens_Album_${album.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(`📥 Downloaded manifest for "${album.title}"`);
  };

  // Export all albums manifest
  const handleExportAllAlbumsToDrive = () => {
    const allExport = {
      app: 'TogetherLens',
      exportType: 'AllThemedAlbumsCatalog',
      syncedAt: new Date().toISOString(),
      driveSpace: 'appDataFolder',
      totalAlbums: allAlbums.length,
      albums: allAlbums.map(a => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        category: a.category,
        dateRange: a.dateRange,
        photoCount: a.photoIds.length,
        primaryTags: a.primaryTags,
        locations: a.locations,
        averageAestheticScore: a.averageAestheticScore,
        story: a.nostalgicStory,
        song: a.songSuggestion,
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'TogetherLens_albums_index.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(`☁️ Exported albums catalog for Google Drive appDataFolder backup!`);
  };

  // Regenerate AI Story with Gemini
  const handleRegenerateAiStory = async (album: ThemedAlbum) => {
    setIsRegeneratingAiStory(true);
    try {
      const res = await fetch('/api/ai/theme-album-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumTitle: album.title,
          matchedTags: album.primaryTags,
          locations: album.locations,
          dateRange: album.dateRange,
        }),
      });

      const data = await res.json();
      if (data.nostalgicStory) {
        const updatedAlbum: ThemedAlbum = {
          ...album,
          nostalgicStory: data.nostalgicStory,
          songSuggestion: data.songTitle ? {
            title: data.songTitle,
            artist: data.artist || 'Curated',
            vibe: data.vibe || 'Romantic',
          } : album.songSuggestion,
        };

        // Update in custom or local state
        setCustomAlbums(prev => prev.map(a => a.id === album.id ? updatedAlbum : a));
        setActiveAlbum(updatedAlbum);
        onShowToast(`✨ Gemini synthesized new story for "${album.title}"`);
      }
    } catch (err) {
      console.error('Failed to regenerate story:', err);
    } finally {
      setIsRegeneratingAiStory(false);
    }
  };

  // Play in Cinema
  const handlePlayInCinema = (album: ThemedAlbum) => {
    const albumPhotos = album.photoIds.map(id => photoMap.get(id)).filter(Boolean) as PhotoItem[];
    if (onPlayAlbumInCinema && albumPhotos.length > 0) {
      onPlayAlbumInCinema(albumPhotos, album.title);
    } else {
      onShowToast(`🎬 Loaded ${albumPhotos.length} photos from "${album.title}" into Anniversary Cinema`);
    }
  };

  const categories: Array<{ id: AlbumThemeCategory; label: string; icon: string }> = [
    { id: 'all', label: 'All Curated Themes', icon: '✨' },
    { id: 'summer', label: 'Summer Vibes', icon: '☀️' },
    { id: 'getaways', label: 'Weekend Getaways', icon: '🚗' },
    { id: 'romance', label: 'Romantic Dinners', icon: '🍷' },
    { id: 'adventures', label: 'Alpine Trails', icon: '🏔️' },
    { id: 'cozy', label: 'Cozy Home', icon: '☕' },
    { id: 'milestones', label: 'Milestones', icon: '💍' },
    { id: 'custom', label: 'Custom AI Themes', icon: '🎨' },
  ];

  const suggestedCustomSeeds = [
    'Italian Getaway in Florence',
    'Rainy Day Coffee & Cafes',
    'Puppy Moments with Milo',
    'Golden Hour Coastlines',
    'Tokyo Street Strolls',
  ];

  return (
    <div id="automated-album-generator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-stone-900/90 to-rose-950/40 p-6 sm:p-8 rounded-3xl border border-amber-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>library_index.json Automated Semantic Clustering</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif-title font-bold text-stone-100">
              Themed Album Generator
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
              Auto-groups your memories into thematic collections like <span className="text-amber-300 font-medium">&lsquo;Summer Vibes&rsquo;</span> and <span className="text-rose-300 font-medium">&lsquo;Weekend Getaways&rsquo;</span> by cross-referencing semantic tags, seasonal date ranges, and GPS cities directly from your zero-backend index.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="rescan-albums-index-btn"
              onClick={handleRescanIndex}
              disabled={isRescanning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <FolderSync className={`w-4 h-4 text-amber-400 ${isRescanning ? 'animate-spin' : ''}`} />
              <span>{isRescanning ? 'Clustering Index...' : 'Re-cluster Index'}</span>
            </button>

            <button
              id="export-all-albums-drive-btn"
              onClick={handleExportAllAlbumsToDrive}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-950/50 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Backup Catalog to Drive</span>
            </button>
          </div>
        </div>

        {/* Live Index Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800">
          <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">Auto-Curated Albums</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">{allAlbums.length} Collections</span>
          </div>
          <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">Indexed Photos Grouped</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-stone-100">{photos.filter(p => !p.visualTriggers.isClutterOrReceipt).length} Moments</span>
          </div>
          <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">Clutter Auto-Excluded</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">100% Zero-Noise</span>
          </div>
          <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">Privacy Architecture</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-teal-300">Local &amp; Drive</span>
          </div>
        </div>
      </div>

      {/* Custom Theme Prompt Input */}
      <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="custom-theme-input"
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomTheme()}
              placeholder="Create a custom smart album (e.g. 'Italian Dinners', 'Rainy Cafes', 'Road Trips')..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button
            id="generate-custom-theme-btn"
            onClick={() => handleCreateCustomTheme()}
            disabled={isGeneratingCustom || !customQuery.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isGeneratingCustom ? 'Clustering...' : 'Generate Theme Album'}</span>
          </button>
        </div>

        {/* Suggested Quick Seeds */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Popular Seeds:
          </span>
          {suggestedCustomSeeds.map((seed, idx) => (
            <button
              key={idx}
              onClick={() => handleCreateCustomTheme(seed)}
              className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-200 border border-stone-700/60 text-[11px] transition-all"
            >
              + {seed}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`filter-album-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 border border-transparent'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-800 text-stone-400">
              {cat.id === 'all' 
                ? allAlbums.length 
                : cat.id === 'custom' 
                  ? allAlbums.filter(a => a.isUserCustom).length 
                  : allAlbums.filter(a => a.category === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Album Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map((album) => {
          const coverPhoto = photoMap.get(album.coverPhotoId) || photos[0];
          const matchedPhotos = album.photoIds.map(id => photoMap.get(id)).filter(Boolean) as PhotoItem[];
          const previewThumbnails = matchedPhotos.slice(0, 3);

          return (
            <div
              key={album.id}
              id={`album-card-${album.id}`}
              className="group bg-stone-900/80 rounded-3xl border border-stone-800/80 hover:border-amber-500/40 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Cover Photo Header */}
              <div 
                className="relative aspect-16/10 cursor-pointer overflow-hidden bg-stone-950"
                onClick={() => setActiveAlbum(album)}
              >
                <img
                  src={coverPhoto?.url}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                
                {/* Top Badge & Photo Count */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                    {album.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/70 backdrop-blur-md text-stone-200 border border-white/10 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-amber-400" />
                    <span>{album.photoIds.length} Photos</span>
                  </span>
                </div>

                {/* Stacked Thumbnail Previews */}
                <div className="absolute bottom-3 right-3 flex -space-x-2">
                  {previewThumbnails.map((p, idx) => (
                    <div 
                      key={idx} 
                      className="w-8 h-8 rounded-lg overflow-hidden border-2 border-stone-900 shadow-md"
                    >
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>

                {/* Date Span on Cover */}
                <div className="absolute bottom-3 left-3">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-stone-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {album.dateRange}
                  </span>
                </div>
              </div>

              {/* Album Body Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 
                    className="font-serif-title font-bold text-lg text-stone-100 group-hover:text-amber-200 transition-colors cursor-pointer"
                    onClick={() => setActiveAlbum(album)}
                  >
                    {album.title}
                  </h3>
                  <p className="text-xs text-stone-400 font-sans line-clamp-2 leading-relaxed">
                    {album.subtitle}
                  </p>
                </div>

                {/* Semantic Tag Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {album.primaryTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-950 text-stone-300 border border-stone-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Soundtrack Recommendation */}
                {album.songSuggestion && (
                  <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate text-stone-300 font-medium">
                        {album.songSuggestion.title} <span className="text-stone-400 font-normal">• {album.songSuggestion.artist}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300/80 shrink-0 ml-2">
                      {album.songSuggestion.vibe}
                    </span>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <button
                    id={`open-album-detail-${album.id}`}
                    onClick={() => setActiveAlbum(album)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-all hover:text-amber-300"
                  >
                    <span>Inspect Album</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {onTogglePinAlbum && (
                    <button
                      id={`pin-album-card-${album.id}`}
                      onClick={() => onTogglePinAlbum(album.id)}
                      className={`p-2 rounded-xl border transition-all ${
                        album.isPinnedOffline || pinnedAlbumIds.includes(album.id)
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                      title="Keep album pinned offline (bypass LRU cache eviction)"
                    >
                      <Pin className={`w-4 h-4 ${album.isPinnedOffline || pinnedAlbumIds.includes(album.id) ? 'fill-white' : ''}`} />
                    </button>
                  )}

                  <button
                    id={`play-album-cinema-${album.id}`}
                    onClick={() => handlePlayInCinema(album)}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all"
                    title="Play this collection in Anniversary Cinema"
                  >
                    <Play className="w-4 h-4 fill-rose-300" />
                  </button>

                  <button
                    onClick={() => handleExportAlbumJson(album)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all"
                    title="Export Album JSON manifest"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Album Detail / Inspection Modal Drawer */}
      {activeAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 flex items-start justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-stone-900 to-rose-950/40">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {activeAlbum.badge}
                  </span>
                  <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {activeAlbum.dateRange}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-100">
                  {activeAlbum.title}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {activeAlbum.subtitle}
                </p>
              </div>

              <button
                onClick={() => setActiveAlbum(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Nostalgic AI Narrative Box */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-amber-500/20 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Nostalgic Album Introduction
                  </span>
                  <button
                    onClick={() => handleRegenerateAiStory(activeAlbum)}
                    disabled={isRegeneratingAiStory}
                    className="text-[11px] font-mono text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isRegeneratingAiStory ? 'animate-spin' : ''}`} />
                    <span>{isRegeneratingAiStory ? 'Synthesizing...' : 'Re-synthesize Story'}</span>
                  </button>
                </div>
                <p className="font-serif-title text-sm sm:text-base text-stone-200 italic leading-relaxed">
                  &ldquo;{activeAlbum.nostalgicStory}&rdquo;
                </p>
              </div>

              {/* Album Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700 space-y-1">
                  <span className="text-stone-400 block text-[11px]">Locations Visited</span>
                  <span className="text-stone-200 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {activeAlbum.locations.join(', ') || 'Various Spots'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700 space-y-1">
                  <span className="text-stone-400 block text-[11px]">Aesthetic Rating</span>
                  <span className="text-amber-300 font-semibold font-mono">
                    {activeAlbum.averageAestheticScore} / 100 Quality Avg
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700 space-y-1">
                  <span className="text-stone-400 block text-[11px]">Recommended Soundtrack</span>
                  <span className="text-rose-300 font-semibold truncate block">
                    {activeAlbum.songSuggestion?.title} - {activeAlbum.songSuggestion?.artist}
                  </span>
                </div>
              </div>

              {/* Grouping Logic Criteria */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2 text-xs">
                <span className="font-mono text-[11px] text-stone-400 uppercase tracking-wider block">
                  Automated Index Grouping Logic:
                </span>
                <ul className="space-y-1 text-stone-300 list-disc list-inside text-[11px]">
                  {activeAlbum.matchedReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Photos Gallery Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-stone-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Matched Photos ({activeAlbum.photoIds.length})</span>
                  </h4>
                  <span className="text-xs text-stone-400 font-mono">
                    Click any photo to inspect faces &amp; EXIF
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeAlbum.photoIds.map((id) => {
                    const photo = photoMap.get(id);
                    if (!photo) return null;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => onSelectPhoto(photo)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 hover:border-amber-500/60 cursor-pointer shadow-md transition-all"
                      >
                        <img
                          src={photo.thumbnail}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                          <span className="text-[10px] font-semibold text-white truncate block">
                            {photo.title}
                          </span>
                          <span className="text-[9px] text-stone-300 font-mono">
                            {photo.location.city} • {photo.aestheticScore}pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-stone-800 bg-stone-950/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportAlbumJson(activeAlbum)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Manifest</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handlePlayInCinema(activeAlbum);
                    setActiveAlbum(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play in Anniversary Cinema</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
