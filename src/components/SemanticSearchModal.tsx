import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  MapPin, 
  Heart, 
  Zap, 
  Crown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PhotoItem, TierLevel } from '../types';
import { cosineSimilarity, generatePseudoEmbedding } from '../utils/vectorSimilarity';

interface SemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  tier: TierLevel;
  onSelectPhoto: (photo: PhotoItem) => void;
  onUnlockPro: () => void;
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  isOpen,
  onClose,
  photos,
  tier,
  onSelectPhoto,
  onUnlockPro,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchIntent, setSearchIntent] = useState<string | null>(null);

  const suggestedQueries = [
    'photos of us at the beach last winter',
    'cozy dinner with wine in Florence',
    'the engagement ring in the mountains',
    'road trip along the sunny coast',
    'baking sourdough on Sunday morning',
    'adopting our puppy Milo',
  ];

  // Perform hybrid vector + keyword matching
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();
    const queryVec = generatePseudoEmbedding(query);

    return photos.map((photo) => {
      // 1. Vector Cosine Similarity
      const vectorScore = cosineSimilarity(queryVec, photo.vectorEmbedding);

      // 2. Keyword & Context boost
      let keywordScore = 0;
      if (photo.title.toLowerCase().includes(lower)) keywordScore += 0.4;
      if (photo.location.name.toLowerCase().includes(lower) || photo.location.city.toLowerCase().includes(lower)) keywordScore += 0.3;
      if (photo.context.toLowerCase().includes(lower)) keywordScore += 0.3;
      photo.semanticTags.forEach(t => {
        if (lower.includes(t.toLowerCase())) keywordScore += 0.25;
      });

      // Composite match score (0 to 100)
      const combinedScore = Math.min(99, Math.round((vectorScore * 0.6 + keywordScore * 0.4) * 100));

      return {
        photo,
        score: Math.max(combinedScore, Math.round(vectorScore * 95)),
      };
    })
    .filter(res => res.score > 40)
    .sort((a, b) => b.score - a.score);
  }, [query, photos]);

  const handleRunSearch = async (targetQuery: string) => {
    setQuery(targetQuery);
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery }),
      });
      const data = await res.json();
      if (data.analysis?.intent) {
        setSearchIntent(data.analysis.intent);
      }
    } catch (err) {
      console.warn('Semantic search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-stone-900 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center gap-3 relative bg-stone-950/60">
          <Sparkles className={`w-5 h-5 text-rose-400 ${isSearching ? 'animate-spin' : ''}`} />
          <input
            id="semantic-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSearch(query)}
            placeholder="Search with natural language (e.g., 'photos of us drinking wine in Italy')..."
            className="flex-1 bg-transparent text-stone-100 text-sm sm:text-base placeholder-stone-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSearchIntent(null); }}
              className="p-1 rounded-full text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs"
          >
            ESC
          </button>
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-stone-900 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-mono text-stone-500 shrink-0">Try:</span>
          {suggestedQueries.map((sug) => (
            <button
              key={sug}
              onClick={() => handleRunSearch(sug)}
              className="px-2.5 py-1 rounded-full bg-stone-800/80 hover:bg-rose-950/50 hover:text-rose-300 border border-stone-700/60 text-stone-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* AI Interpreted Intent */}
        {searchIntent && (
          <div className="px-5 py-2.5 bg-rose-950/30 border-b border-rose-900/30 text-xs text-rose-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span><strong>Gemini Semantic Intent:</strong> {searchIntent}</span>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Search className="w-10 h-10 mx-auto text-stone-600 opacity-60" />
              <p className="text-stone-300 text-sm font-medium">
                {query ? 'No memory matches found for this query' : 'Type a query or pick a suggestion above'}
              </p>
              <p className="text-stone-500 text-xs max-w-sm mx-auto">
                Powered by sqlite-vec on-device embeddings and Gemini vision semantic tagging.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map(({ photo, score }) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    onSelectPhoto(photo);
                    onClose();
                  }}
                  className="flex gap-3 p-2.5 rounded-2xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 hover:border-rose-500/40 cursor-pointer transition-all group"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-emerald-400 font-bold">
                      {score}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-semibold text-stone-200 text-xs sm:text-sm truncate group-hover:text-rose-300">
                        {photo.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {photo.location.city || photo.location.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                      <span>{photo.context}</span>
                      {photo.isUsCouple && (
                        <span className="text-rose-400 font-bold">Us Together</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
