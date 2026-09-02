import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  Music, 
  Heart, 
  Wand2,
  Crown,
  Share2
} from 'lucide-react';
import { PhotoItem, AnniversaryRecapStory, TierLevel } from '../types';
import { ambientSoundtrack } from '../utils/audioSynth';

interface AnniversaryCinemaProps {
  photos: PhotoItem[];
  tier: TierLevel;
  onUnlockPro: () => void;
}

export const AnniversaryCinema: React.FC<AnniversaryCinemaProps> = ({
  photos,
  tier,
  onUnlockPro,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState<boolean>(false);
  const [recapTitle, setRecapTitle] = useState<string>('Four Years of Us: Coast to Alps');
  const [selectedMood, setSelectedMood] = useState<'Romantic & Cozy' | 'Lively & Adventurous' | 'Cinematic & Nostalgic'>('Romantic & Cozy');
  const [story, setStory] = useState<AnniversaryRecapStory | null>(null);

  // Take couple photos for default recap slides
  const usPhotos = photos.filter(p => p.isUsCouple);

  // Initialize initial recap story
  useEffect(() => {
    if (usPhotos.length > 0) {
      const slides = usPhotos.slice(0, 6).map((p, idx) => ({
        photoId: p.id,
        photo: p,
        chapterTitle: ['I. The First Spark', 'II. Italian Sunsets', 'III. Pacific Coast Highway', 'IV. The Promise on Seceda Ridge', 'V. Sunday Mornings & Milo', 'VI. Into Forever'][idx] || `Chapter ${idx + 1}`,
        narration: p.nostalgicSummary,
        durationSeconds: 5,
        cameraEffect: (['pan-left', 'zoom-in', 'tilt-up', 'glow-focus'][idx % 4]) as any,
      }));

      setStory({
        id: 'recap-master-001',
        title: recapTitle,
        subtitle: 'An automated narrative woven from our highest-rated couple moments',
        dateRange: '2022 - 2026',
        moodVibe: selectedMood,
        musicTrackTitle: 'Starlight Romance (Acoustic Strings)',
        totalDurationSeconds: slides.length * 5,
        slides,
      });
    }
  }, [photos]);

  // Slideshow auto-advance
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && story && story.slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlideIdx((prev) => {
          if (prev >= story.slides.length - 1) {
            setIsPlaying(false);
            ambientSoundtrack.stop();
            return 0;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, story]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      ambientSoundtrack.stop();
    } else {
      setIsPlaying(true);
      if (isAudioEnabled) {
        ambientSoundtrack.playTrack('romantic-acoustic');
      }
    }
  };

  const handleToggleAudio = () => {
    if (isAudioEnabled) {
      ambientSoundtrack.stop();
      setIsAudioEnabled(false);
    } else {
      setIsAudioEnabled(true);
      if (isPlaying) {
        ambientSoundtrack.playTrack('romantic-acoustic');
      }
    }
  };

  const handleGenerateAiRecap = async () => {
    setIsGeneratingRecap(true);
    try {
      const res = await fetch('/api/ai/generate-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recapTitle,
          mood: selectedMood,
          selectedPhotos: usPhotos.slice(0, 7),
        }),
      });

      const data = await res.json();
      if (data.recap && data.recap.slides) {
        const fullSlides = data.recap.slides.map((s: any, idx: number) => {
          const photo = usPhotos.find(p => p.id === s.photoId) || usPhotos[idx % usPhotos.length];
          return {
            photoId: photo.id,
            photo,
            chapterTitle: s.chapterTitle || `Moment ${idx + 1}`,
            narration: s.narration || photo.nostalgicSummary,
            durationSeconds: 5,
            cameraEffect: s.cameraEffect || 'zoom-in',
          };
        });

        setStory({
          id: `recap_${Date.now()}`,
          title: data.recap.storyTitle || recapTitle,
          subtitle: data.recap.subtitle || 'Generated with Gemini Memory Director',
          dateRange: '2022 - 2026',
          moodVibe: selectedMood,
          musicTrackTitle: data.recap.musicTheme || 'Starlight Romance',
          totalDurationSeconds: fullSlides.length * 5,
          slides: fullSlides,
        });

        setCurrentSlideIdx(0);
        setIsPlaying(true);
        if (isAudioEnabled) ambientSoundtrack.playTrack('romantic-acoustic');
      }
    } catch (err) {
      console.error('Failed to generate recap:', err);
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const currentSlide = story?.slides[currentSlideIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-stone-900/90 to-rose-950/40 p-6 sm:p-8 rounded-3xl border border-purple-900/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Section 4: Premium Milestone Video Recap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-stone-100">
              Anniversary Cinema Storyteller
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl font-sans">
              Auto-generate poetic anniversary reels with motion pan-and-scan, synchronized spoken subtitles, and ambient romantic soundtracks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {tier === 'free' ? (
              <button
                onClick={onUnlockPro}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>Unlock 4K Video Exports (PRO)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold font-mono">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>PRO CINEMA UNLOCKED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Cinema Theater Stage */}
      <div className="bg-stone-950 rounded-3xl border-2 border-purple-900/40 shadow-2xl overflow-hidden relative">
        
        {/* The Screen */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-stone-950 overflow-hidden flex items-center justify-center">
          {currentSlide ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={currentSlide.photo.url}
                alt={currentSlide.photo.title}
                className={`w-full h-full object-cover transition-all duration-5000 ease-out ${
                  isPlaying ? 'scale-110 translate-x-2' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Cinematic Vignette & Letterbox */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>

              {/* Subtitle & Narration HUD */}
              <div className="absolute bottom-16 left-6 right-6 sm:left-12 sm:right-12 text-center space-y-2 pointer-events-none">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-purple-600/80 text-white backdrop-blur-md shadow">
                  {currentSlide.chapterTitle}
                </span>
                <p className="font-serif-title text-base sm:text-2xl text-stone-100 italic leading-relaxed drop-shadow-md max-w-3xl mx-auto">
                  &ldquo;{currentSlide.narration}&rdquo;
                </p>
                <p className="text-[11px] font-mono text-stone-400">
                  {currentSlide.photo.location.name} • {currentSlide.photo.month} {currentSlide.photo.year}
                </p>
              </div>

              {/* Chapter Indicators along top */}
              <div className="absolute top-4 left-6 right-6 flex items-center gap-1.5">
                {story?.slides.map((s, idx) => (
                  <div
                    key={s.photoId}
                    onClick={() => setCurrentSlideIdx(idx)}
                    className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                      idx === currentSlideIdx
                        ? 'bg-rose-500 ring-2 ring-rose-500/30'
                        : idx < currentSlideIdx
                        ? 'bg-stone-500'
                        : 'bg-stone-800'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-stone-500">
              <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No photos selected for recap yet</p>
            </div>
          )}
        </div>

        {/* Playback Controls Toolbar */}
        <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
          
          {/* Story Title & Meta */}
          <div className="space-y-0.5">
            <h3 className="font-serif-title font-bold text-stone-100 text-sm sm:text-base">
              {story?.title}
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Track: {story?.musicTrackTitle} • {currentSlideIdx + 1}/{story?.slides.length} Chapters
            </p>
          </div>

          {/* Center Playback Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all"
              title="Previous Chapter"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="cinema-play-pause-btn"
              onClick={handleTogglePlay}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play Anniversary Reel'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentSlideIdx((prev) => (story ? Math.min(story.slides.length - 1, prev + 1) : 0))}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all"
              title="Next Chapter"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls: Audio & Generator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-xl border transition-all ${
                isAudioEnabled
                  ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                  : 'bg-stone-800 text-stone-500 border-stone-700'
              }`}
              title={isAudioEnabled ? 'Mute Background Score' : 'Unmute Soundtrack'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="cinema-remix-story-btn"
              onClick={handleGenerateAiRecap}
              disabled={isGeneratingRecap}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGeneratingRecap ? 'animate-spin' : ''}`} />
              <span>{isGeneratingRecap ? 'Remixing Story...' : 'Gemini Director Remix'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
