import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  Waves, 
  Coffee, 
  Wind, 
  CloudRain, 
  Flame, 
  Sun, 
  Radio,
  Sliders,
  X,
  Maximize2,
  Headphones
} from 'lucide-react';
import { SoundscapePresetId } from '../types';
import { proceduralAudio, SOUNDSCAPE_PRESETS } from '../utils/proceduralAudio';

interface SoundscapeFloatingPlayerProps {
  currentPhotoContextTitle?: string;
  suggestedPresetId?: SoundscapePresetId;
  onShowToast?: (msg: string) => void;
}

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  Waves,
  Coffee,
  Wind,
  CloudRain,
  Flame,
  Sun,
};

export const SoundscapeFloatingPlayer: React.FC<SoundscapeFloatingPlayerProps> = ({
  currentPhotoContextTitle,
  suggestedPresetId,
  onShowToast,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<SoundscapePresetId>('amalfi_waves');
  const [volume, setVolume] = useState<number>(0.35);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (suggestedPresetId && suggestedPresetId !== selectedPresetId) {
      setSelectedPresetId(suggestedPresetId);
      if (isPlaying) {
        proceduralAudio.play(suggestedPresetId, volume);
      }
    }
  }, [suggestedPresetId]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      proceduralAudio.stop();
      setIsPlaying(false);
      onShowToast?.('⏸️ Soundscape paused');
    } else {
      proceduralAudio.play(selectedPresetId, volume);
      setIsPlaying(true);
      const preset = SOUNDSCAPE_PRESETS[selectedPresetId];
      onShowToast?.(`🎧 Now playing procedural ambient soundscape: "${preset.name}"`);
    }
  };

  const handleSelectPreset = (id: SoundscapePresetId) => {
    setSelectedPresetId(id);
    if (isPlaying) {
      proceduralAudio.play(id, volume);
    }
    const preset = SOUNDSCAPE_PRESETS[id];
    onShowToast?.(`Switched ambience to: ${preset.name}`);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    proceduralAudio.setVolume(newVol);
  };

  const activePreset = SOUNDSCAPE_PRESETS[selectedPresetId] || SOUNDSCAPE_PRESETS.amalfi_waves;
  const ActiveIcon = ICONS[activePreset.icon] || Waves;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in font-sans">
      {!isExpanded ? (
        // Mini Compact Pill
        <div className="flex items-center gap-2 p-2 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-700 shadow-2xl hover:border-teal-500/50 transition-all">
          <button
            id="soundscape-play-toggle-btn"
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-teal-500 text-stone-950 shadow-md shadow-teal-500/30 animate-pulse' 
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title={isPlaying ? 'Pause Procedural Soundscape' : 'Play Procedural Soundscape'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-stone-950" /> : <Play className="w-4 h-4 fill-stone-300 ml-0.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 pr-2 text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-800/80 flex items-center justify-center border border-stone-700/60">
              <ActiveIcon className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-stone-200 block max-w-[140px] truncate">
                {activePreset.name}
              </span>
              <span className="text-[10px] text-teal-400 font-mono block">
                {isPlaying ? '⚡ Web Audio Live' : 'Generative Ambience'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
            title="Open Soundscape Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // Expanded Soundscape Control Console
        <div className="w-80 sm:w-96 p-5 bg-stone-900/95 backdrop-blur-xl rounded-3xl border border-teal-500/30 shadow-2xl space-y-4 text-stone-100">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-sm text-stone-100">
                  Acoustic Memory Soundscapes
                </h4>
                <p className="text-[10px] text-stone-400 font-mono">
                  Procedural Web Audio • Zero Bandwidth
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Active Info */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${activePreset.accentColor}20`, border: `1px solid ${activePreset.accentColor}40` }}
              >
                <ActiveIcon className="w-5 h-5" style={{ color: activePreset.accentColor }} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-stone-100 block truncate">
                  {activePreset.name}
                </span>
                <span className="text-[11px] text-stone-400 block truncate">
                  {activePreset.description}
                </span>
              </div>
            </div>

            <button
              onClick={handleTogglePlay}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isPlaying 
                  ? 'bg-teal-500 text-stone-950 shadow-lg shadow-teal-500/30' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-stone-950" /> : <Play className="w-4 h-4 fill-stone-200 ml-0.5" />}
            </button>
          </div>

          {/* Preset Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              Choose Atmospheric Soundscape:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SOUNDSCAPE_PRESETS) as SoundscapePresetId[]).map((id) => {
                const preset = SOUNDSCAPE_PRESETS[id];
                const IconComponent = ICONS[preset.icon] || Waves;
                const isSelected = selectedPresetId === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectPreset(id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-sm'
                        : 'bg-stone-950/70 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" style={{ color: isSelected ? '#2dd4bf' : preset.accentColor }} />
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium block truncate leading-tight">{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
                      <span className="text-[9px] text-stone-500 block truncate">{preset.associatedKeywords.slice(0, 2).join(', ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="pt-2 border-t border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
                <span>Ambience Volume</span>
              </span>
              <span className="text-teal-300 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-teal-500 bg-stone-950 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Memory Match Context if available */}
          {currentPhotoContextTitle && (
            <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-800/40 text-[11px] text-teal-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Auto-matched to: &ldquo;{currentPhotoContextTitle}&rdquo;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
