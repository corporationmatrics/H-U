import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Printer, 
  Sparkles, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sliders, 
  Check, 
  Download, 
  Share2, 
  Palette, 
  Maximize2, 
  FileText,
  Star,
  Eye
} from 'lucide-react';
import { PhotoItem, CoupleProfile, StorybookProject, StorybookSpread, StorybookPage, TierLevel } from '../types';

interface StorybookPrintGeneratorProps {
  photos: PhotoItem[];
  profile: CoupleProfile;
  tier: TierLevel;
  onSelectPhoto: (photo: PhotoItem) => void;
  onShowToast: (msg: string) => void;
}

const COVER_STYLES = {
  linen_cream: {
    name: 'Natural Linen & Gold Foil',
    bg: 'bg-amber-50',
    text: 'text-stone-900',
    accent: 'text-amber-700',
    border: 'border-amber-200',
    foil: 'text-amber-600',
  },
  midnight_leather: {
    name: 'Midnight Navy & Silver Foil',
    bg: 'bg-slate-900',
    text: 'text-stone-100',
    accent: 'text-sky-400',
    border: 'border-slate-700',
    foil: 'text-slate-300',
  },
  terracotta_rose: {
    name: 'Terracotta Rose & Copper Foil',
    bg: 'bg-rose-950',
    text: 'text-rose-100',
    accent: 'text-rose-300',
    border: 'border-rose-800',
    foil: 'text-rose-400',
  },
  emerald_gold: {
    name: 'Heritage Emerald & Gold Leaf',
    bg: 'bg-emerald-950',
    text: 'text-emerald-100',
    accent: 'text-amber-300',
    border: 'border-emerald-800',
    foil: 'text-amber-400',
  },
};

export const StorybookPrintGenerator: React.FC<StorybookPrintGeneratorProps> = ({
  photos,
  profile,
  tier,
  onSelectPhoto,
  onShowToast,
}) => {
  const [minAestheticScore, setMinAestheticScore] = useState<number>(85);
  const [coverStyleKey, setCoverStyleKey] = useState<keyof typeof COVER_STYLES>('linen_cream');
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [bookTitle, setBookTitle] = useState('Our Story in Light & Time');
  const [bookSubtitle, setBookSubtitle] = useState('Volume I: 1,461 Days of Us');
  const [dedicationText, setDedicationText] = useState(
    `For Taylor, who turned every ordinary corner of this world into an unforgettable memory.`
  );

  // Filter photos by aesthetic score (>= 85 for high-print quality)
  const curatedPhotos = useMemo(() => {
    return photos
      .filter((p) => (p.aestheticScore || 80) >= minAestheticScore)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [photos, minAestheticScore]);

  // Construct dual-perspective spreads
  const bookSpreads: StorybookSpread[] = useMemo(() => {
    const spreads: StorybookSpread[] = [];

    // Spread 0: Cover & Dedication
    spreads.push({
      spreadIndex: 0,
      leftPage: {
        pageNumber: 1,
        type: 'intro',
        title: 'Dedication',
        subtitle: 'From the heart of Alex & Taylor',
        photoIds: [],
        aiNarrative: dedicationText,
        layoutVariant: 'centered',
      },
      rightPage: {
        pageNumber: 2,
        type: 'intro',
        title: profile.relationshipTitle,
        subtitle: `${profile.daysTogether} Days Together • First Kiss to Today`,
        photoIds: curatedPhotos[0] ? [curatedPhotos[0].id] : [],
        partner1Perspective: `Alex: "From the second we met in Milan, every chapter has been brighter."`,
        partner2Perspective: `Taylor: "Four years, thousands of laughs, and a lifetime still ahead."`,
        layoutVariant: 'editorial_split',
      },
    });

    // Generate Spreads from curated photos
    for (let i = 0; i < curatedPhotos.length; i += 2) {
      const pLeft = curatedPhotos[i];
      const pRight = curatedPhotos[i + 1] || curatedPhotos[0];
      const pageNum = spreads.length * 2 + 1;

      spreads.push({
        spreadIndex: spreads.length,
        leftPage: {
          pageNumber: pageNum,
          type: 'photo_dual',
          title: pLeft?.title || 'Golden Moments',
          subtitle: pLeft?.location?.name || 'Together',
          photoIds: [pLeft.id],
          partner1Perspective: `Alex: "${pLeft.nostalgicSummary.slice(0, 110)}..."`,
          dateLocationStamp: `${new Date(pLeft.date).toLocaleDateString()} • ${pLeft.location?.name || ''}`,
          layoutVariant: 'centered',
        },
        rightPage: {
          pageNumber: pageNum + 1,
          type: 'photo_dual',
          title: pRight?.title || 'Shared Joy',
          subtitle: pRight?.location?.name || 'Everyday Magic',
          photoIds: [pRight.id],
          partner2Perspective: `Taylor: "A day I will remember forever. Aesthetic score ${pRight.aestheticScore}/100."`,
          dateLocationStamp: `${new Date(pRight.date).toLocaleDateString()} • ${pRight.location?.name || ''}`,
          layoutVariant: 'centered',
        },
      });
    }

    return spreads;
  }, [curatedPhotos, dedicationText, profile]);

  const currentSpread = bookSpreads[currentSpreadIndex] || bookSpreads[0];
  const activeCover = COVER_STYLES[coverStyleKey];

  const handlePrint = () => {
    onShowToast('🖨️ Preparing 8x8 hardcover photobook print view (300 DPI layout)...');
    window.print();
  };

  return (
    <div id="storybook-print-generator" className="space-y-8 animate-fade-in font-sans">
      
      {/* Header & Controls Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-rose-950/40 border border-amber-800/30 shadow-2xl relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Hardcover 8x8 Photobook &amp; Physical Print Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-100 tracking-tight">
              Shared Couple Storybook
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Curates high-aesthetic (Score &ge; {minAestheticScore}) photos into print-ready 8x8 hardcover spreads with dual-perspective notes from both partners.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="print-storybook-pdf-btn"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-xl shadow-amber-950/50 transition-all hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4 text-stone-950" />
              <span>Print 8x8 Hardcover Book (PDF)</span>
            </button>
          </div>
        </div>

        {/* Curator Controls */}
        <div className="mt-6 pt-6 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Aesthetic Score Filter */}
          <div className="flex items-center gap-3">
            <span className="text-stone-400 font-mono">Min Aesthetic Score:</span>
            <div className="flex items-center gap-1.5">
              {[80, 85, 90, 95].map((score) => (
                <button
                  key={score}
                  onClick={() => setMinAestheticScore(score)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    minAestheticScore === score
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  &ge; {score}
                </button>
              ))}
            </div>
            <span className="text-stone-500 font-mono">({curatedPhotos.length} Plates Selected)</span>
          </div>

          {/* Cover Style Palette */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-mono">Cover Binding:</span>
            {(Object.keys(COVER_STYLES) as (keyof typeof COVER_STYLES)[]).map((key) => {
              const c = COVER_STYLES[key];
              const isSelected = coverStyleKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setCoverStyleKey(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-100 text-stone-950 shadow-md font-bold'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span>{c.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Interactive 8x8 Book Previewer */}
      <div className="space-y-4">
        
        {/* Navigation & Spread Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span>Spread <strong>{currentSpreadIndex + 1}</strong> of <strong>{bookSpreads.length}</strong></span>
            <span>• Pages {currentSpread.leftPage.pageNumber} &amp; {currentSpread.rightPage.pageNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSpreadIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSpreadIndex === 0}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSpreadIndex((prev) => Math.min(bookSpreads.length - 1, prev + 1))}
              disabled={currentSpreadIndex === bookSpreads.length - 1}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Realistic Hardcover Book Spread Stage */}
        <div className="relative p-4 sm:p-8 rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl flex items-center justify-center">
          
          {/* Two-page 8x8 Book Container with spine gutter shadow */}
          <div className="w-full max-w-5xl aspect-[2/1] bg-amber-50/95 rounded-2xl shadow-2xl border-4 border-stone-800 relative overflow-hidden grid grid-cols-2 text-stone-900 font-serif">
            
            {/* Spine Center Shadow Gutter */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-black/20 via-black/40 to-black/20 pointer-events-none z-20" />
            
            {/* LEFT PAGE */}
            <div className="p-6 sm:p-10 flex flex-col justify-between border-r border-amber-200/60 relative overflow-hidden bg-[#faf7f2]">
              
              {/* Header / Chapter */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase block">
                  TogetherLens Keepsake • Page {currentSpread.leftPage.pageNumber}
                </span>
                <h3 className="font-serif-title font-bold text-lg sm:text-xl text-stone-900">
                  {currentSpread.leftPage.title}
                </h3>
                {currentSpread.leftPage.subtitle && (
                  <p className="text-xs text-stone-600 italic">{currentSpread.leftPage.subtitle}</p>
                )}
              </div>

              {/* Center Content: Photo or Dedication */}
              <div className="my-auto py-2 flex flex-col items-center justify-center">
                {currentSpread.leftPage.photoIds.length > 0 ? (
                  <div className="w-full max-w-xs sm:max-w-sm aspect-square rounded-xl overflow-hidden shadow-md ring-4 ring-white">
                    {(() => {
                      const p = photos.find((item) => item.id === currentSpread.leftPage.photoIds[0]);
                      return p ? (
                        <img
                          src={p.mediumUrl || p.url}
                          alt="Photo plate"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => onSelectPhoto(p)}
                        />
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="max-w-xs text-center space-y-4 py-6">
                    <Heart className="w-8 h-8 text-rose-600 mx-auto fill-rose-600/20" />
                    <p className="text-sm sm:text-base italic text-stone-800 leading-relaxed font-serif">
                      &ldquo;{currentSpread.leftPage.aiNarrative}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Caption / Alex Perspective */}
              <div className="text-center space-y-1">
                {currentSpread.leftPage.partner1Perspective && (
                  <p className="text-xs sm:text-sm text-stone-700 italic font-serif">
                    {currentSpread.leftPage.partner1Perspective}
                  </p>
                )}
                {currentSpread.leftPage.dateLocationStamp && (
                  <span className="text-[10px] font-mono text-stone-500 block">
                    {currentSpread.leftPage.dateLocationStamp}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT PAGE */}
            <div className="p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden bg-[#faf7f2]">
              
              {/* Header / Chapter */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase block">
                  TogetherLens Keepsake • Page {currentSpread.rightPage.pageNumber}
                </span>
                <h3 className="font-serif-title font-bold text-lg sm:text-xl text-stone-900">
                  {currentSpread.rightPage.title}
                </h3>
                {currentSpread.rightPage.subtitle && (
                  <p className="text-xs text-stone-600 italic">{currentSpread.rightPage.subtitle}</p>
                )}
              </div>

              {/* Center Content: Photo */}
              <div className="my-auto py-2 flex flex-col items-center justify-center">
                {currentSpread.rightPage.photoIds.length > 0 ? (
                  <div className="w-full max-w-xs sm:max-w-sm aspect-square rounded-xl overflow-hidden shadow-md ring-4 ring-white">
                    {(() => {
                      const p = photos.find((item) => item.id === currentSpread.rightPage.photoIds[0]);
                      return p ? (
                        <img
                          src={p.mediumUrl || p.url}
                          alt="Photo plate"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => onSelectPhoto(p)}
                        />
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="max-w-xs text-center space-y-4 py-6">
                    <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-sm sm:text-base italic text-stone-800 leading-relaxed font-serif">
                      &ldquo;Every chapter written in light, laughs, and quiet moments between us.&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Caption / Taylor Perspective */}
              <div className="text-center space-y-1">
                {currentSpread.rightPage.partner2Perspective && (
                  <p className="text-xs sm:text-sm text-stone-700 italic font-serif">
                    {currentSpread.rightPage.partner2Perspective}
                  </p>
                )}
                {currentSpread.rightPage.dateLocationStamp && (
                  <span className="text-[10px] font-mono text-stone-500 block">
                    {currentSpread.rightPage.dateLocationStamp}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Thumbnail Filmstrip of Spreads */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {bookSpreads.map((spread, idx) => {
            const isSelected = currentSpreadIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSpreadIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                Spread {idx + 1} (p.{spread.leftPage.pageNumber}-{spread.rightPage.pageNumber})
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
