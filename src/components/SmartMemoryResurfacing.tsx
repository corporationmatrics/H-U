import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Heart, 
  Send, 
  Share2, 
  PartyPopper,
  Clock,
  Music,
  Compass
} from 'lucide-react';
import { PhotoItem, CoupleProfile } from '../types';
import { ambientSoundtrack } from '../utils/audioSynth';

interface SmartMemoryResurfacingProps {
  photos: PhotoItem[];
  profile: CoupleProfile;
  onSelectPhoto: (photo: PhotoItem) => void;
}

export const SmartMemoryResurfacing: React.FC<SmartMemoryResurfacingProps> = ({
  photos,
  profile,
  onSelectPhoto,
}) => {
  // Memories across past years
  const memoryCandidates = [
    {
      id: 'mem-3yr',
      yearsAgo: 3,
      dateFormatted: 'September 1, 2023',
      title: 'Our Engagement in the Dolomites',
      location: 'Seceda Ridge, Val Gardena, Italy',
      photoId: 'photo-4',
      contextTag: 'Proposal & Ring',
      initialCaption: 'Standing on the edge of the world where you said yes. The alpine wind stopped for just a second as the ring caught the morning sun.',
    },
    {
      id: 'mem-2yr',
      yearsAgo: 2,
      dateFormatted: 'September 1, 2024',
      title: 'Sunset Cliffs along Highway 1',
      location: 'Big Sur, California',
      photoId: 'photo-2',
      contextTag: 'Golden Hour',
      initialCaption: 'The marine layer was rolling in over Big Sur, and we parked the car just to watch the sky turn from gold to deep violet.',
    },
    {
      id: 'mem-1yr',
      yearsAgo: 1,
      dateFormatted: 'September 1, 2025',
      title: 'Anniversary Dinner in Tuscany',
      location: 'Osteria del Sole, Florence, Italy',
      photoId: 'photo-1',
      contextTag: 'Anniversary Dinner',
      initialCaption: 'Toasting our third year with local Chianti and handmade tortelli under warm string lights in Santo Spirito.',
    },
  ];

  const [selectedMemoryIdx, setSelectedMemoryIdx] = useState<number>(0);
  const [captions, setCaptions] = useState<{ [key: string]: string }>({
    'mem-3yr': memoryCandidates[0].initialCaption,
    'mem-2yr': memoryCandidates[1].initialCaption,
    'mem-1yr': memoryCandidates[2].initialCaption,
  });
  const [isGeneratingAiCaption, setIsGeneratingAiCaption] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [sharedCopied, setSharedCopied] = useState<boolean>(false);

  const currentMemory = memoryCandidates[selectedMemoryIdx];
  const matchedPhoto = photos.find((p) => p.id === currentMemory.photoId) || photos[0];

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fbbf24', '#ec4899', '#f97316'],
    });
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      ambientSoundtrack.stop();
      setIsAudioPlaying(false);
    } else {
      ambientSoundtrack.playTrack('romantic-acoustic');
      setIsAudioPlaying(true);
    }
  };

  const handleGenerateAiNostalgiaCaption = async () => {
    setIsGeneratingAiCaption(true);
    try {
      const res = await fetch('/api/ai/on-this-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memory: {
            yearsAgo: currentMemory.yearsAgo,
            dateFormatted: currentMemory.dateFormatted,
            location: currentMemory.location,
            contextTag: currentMemory.contextTag,
            tags: matchedPhoto?.semanticTags || [],
            title: currentMemory.title,
          }
        }),
      });

      const data = await res.json();
      if (data.caption) {
        setCaptions((prev) => ({
          ...prev,
          [currentMemory.id]: data.caption,
        }));
        handleTriggerConfetti();
      }
    } catch (err) {
      console.error('Failed to generate memory caption:', err);
    } finally {
      setIsGeneratingAiCaption(false);
    }
  };

  const handleCopyShare = () => {
    const text = `✨ On This Day (${currentMemory.yearsAgo} years ago): "${captions[currentMemory.id]}" — ${currentMemory.location} • TogetherLens`;
    navigator.clipboard?.writeText(text);
    setSharedCopied(true);
    setTimeout(() => setSharedCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header with Anniversary Stats & Nostalgic Atmosphere audio toggle */}
      <div className="bg-gradient-to-r from-rose-950/40 via-stone-900/80 to-amber-950/40 p-6 sm:p-8 rounded-3xl border border-rose-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Smart Memory Resurfacing • September 1 Edition</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif-title font-bold text-stone-100">
              On This Day with {profile.partner1Name} & {profile.partner2Name}
            </h1>
            <p className="text-stone-400 text-sm max-w-xl font-sans">
              Gemini contextual reflection engine revisits your past anniversaries and road trips, weaving sensory nostalgia from your lightweight metadata.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Ambient Synth Toggle */}
            <button
              id="resurfacing-audio-toggle"
              onClick={handleToggleAudio}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm border transition-all ${
                isAudioPlaying
                  ? 'bg-rose-600/30 text-rose-200 border-rose-500/50 shadow-lg shadow-rose-950/50 animate-pulse'
                  : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border-stone-700'
              }`}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-rose-400" />
                  <span>Music: Romantic Acoustic (Playing)</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-stone-400" />
                  <span>Play Nostalgic Soundtrack</span>
                </>
              )}
            </button>

            {/* Celebrate with Confetti */}
            <button
              id="celebrate-anniv-btn"
              onClick={handleTriggerConfetti}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <PartyPopper className="w-4 h-4 text-amber-400" />
              <span>Celebrate</span>
            </button>
          </div>
        </div>

        {/* Milestone Pills selector */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {memoryCandidates.map((mem, idx) => (
            <button
              key={mem.id}
              onClick={() => setSelectedMemoryIdx(idx)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left border transition-all whitespace-nowrap ${
                selectedMemoryIdx === idx
                  ? 'bg-stone-800 text-stone-100 border-rose-500/60 ring-2 ring-rose-500/20 shadow-lg'
                  : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif-title font-bold text-sm ${
                selectedMemoryIdx === idx ? 'bg-rose-500 text-white' : 'bg-stone-800 text-stone-400'
              }`}>
                {mem.yearsAgo}y
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm text-stone-200">{mem.yearsAgo} Years Ago Today</p>
                <p className="text-[11px] text-stone-400">{mem.dateFormatted.split(',')[1]} • {mem.location.split(',')[0]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Memory Hero Display */}
      {matchedPhoto && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-800/30 p-6 sm:p-8 rounded-3xl border border-stone-800/80">
          
          {/* Photo Frame */}
          <div className="lg:col-span-7 relative group">
            <div 
              className="relative aspect-16/10 rounded-2xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-700 cursor-pointer"
              onClick={() => onSelectPhoto(matchedPhoto)}
            >
              <img
                src={matchedPhoto.url}
                alt={matchedPhoto.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Photo Overlay details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-md flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-white" />
                    {matchedPhoto.context}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-900/80 text-stone-300 border border-stone-700">
                    Aesthetic Score: {matchedPhoto.aestheticScore}/100
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-white leading-snug">
                  {matchedPhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {currentMemory.location}
                </p>
              </div>
            </div>
          </div>

          {/* AI Memory Reflection & Resurfacing Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Nostalgia Narrative
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {currentMemory.dateFormatted}
                </span>
              </div>

              {/* Caption Box */}
              <div className="relative p-5 rounded-2xl bg-stone-900/80 border border-rose-500/20 shadow-inner">
                <p className="font-serif-title text-base sm:text-lg text-stone-100 italic leading-relaxed">
                  &ldquo;{captions[currentMemory.id]}&rdquo;
                </p>
                
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-stone-400">
                    <Compass className="w-3 h-3 text-rose-400" />
                    Zero-Token Cloud Recall
                  </span>
                  <span className="text-[11px] text-amber-300">
                    {profile.partner1Name} & {profile.partner2Name}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                id="generate-new-nostalgia-caption-btn"
                onClick={handleGenerateAiNostalgiaCaption}
                disabled={isGeneratingAiCaption}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAiCaption ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAiCaption ? 'Composing Nostalgic Memory...' : 'Ask Gemini to Re-compose Caption'}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  id="share-memory-btn"
                  onClick={handleCopyShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{sharedCopied ? 'Copied to Clipboard!' : 'Share Memory Note'}</span>
                </button>

                <button
                  onClick={() => onSelectPhoto(matchedPhoto)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
                >
                  <span>Inspect ML Kit Faces</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
