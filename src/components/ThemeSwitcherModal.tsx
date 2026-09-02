import React from 'react';
import { AppThemeId, ThemeConfig } from '../types';
import { THEME_PRESETS } from '../theme/themes';
import { 
  Palette, 
  Check, 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Type, 
  Sliders, 
  Eye,
  SlidersHorizontal,
  Flame,
  Film
} from 'lucide-react';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
  ambientGlow: boolean;
  onToggleAmbientGlow: () => void;
  filmGrain: boolean;
  onToggleFilmGrain: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  ambientGlow,
  onToggleAmbientGlow,
  filmGrain,
  onToggleFilmGrain,
}) => {
  if (!isOpen) return null;

  const currentTheme = THEME_PRESETS[activeThemeId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif-title font-bold text-stone-100">
                  Visual Atmosphere &amp; Design Theme
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {currentTheme.name}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Curated color palettes and optical styling crafted for romantic couple memories.
              </p>
            </div>
          </div>

          <button
            id="close-theme-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            title="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Theme Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Select Curated Palette</span>
              </label>
              <span className="text-[11px] text-stone-400 font-mono">5 Aesthetic Atmospheres</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(Object.values(THEME_PRESETS) as ThemeConfig[]).map((theme) => {
                const isSelected = theme.id === activeThemeId;
                return (
                  <button
                    key={theme.id}
                    id={`theme-select-${theme.id}`}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`relative flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 group ${
                      isSelected
                        ? 'ring-2 ring-rose-500 border-rose-400 shadow-lg shadow-rose-950/40 bg-stone-800/90'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                    }`}
                  >
                    {/* Top Row: Theme Name & Dark/Light badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-title font-semibold text-sm text-stone-100">
                          {theme.name}
                        </span>
                        {theme.isDark ? (
                          <Moon className="w-3 h-3 text-stone-400" />
                        ) : (
                          <Sun className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed mb-3">
                      {theme.tagline}
                    </p>

                    {/* Swatches Bar */}
                    <div className="mt-auto pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {theme.palette.swatches.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {theme.fontPairing.mood.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Theme Specimen Card */}
          <div 
            className="p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: currentTheme.palette.surface,
              borderColor: currentTheme.palette.border,
              boxShadow: `0 10px 30px -10px ${currentTheme.palette.glow}`,
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-800/40">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: currentTheme.palette.accent }}
                />
                <h3 
                  className="font-serif-title font-bold text-base"
                  style={{ color: currentTheme.palette.textPrimary }}
                >
                  Active Typography &amp; Optical Preview: {currentTheme.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span 
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ 
                    backgroundColor: currentTheme.palette.accentMuted,
                    color: currentTheme.palette.accent 
                  }}
                >
                  {currentTheme.fontPairing.title} + {currentTheme.fontPairing.body}
                </span>
              </div>
            </div>

            {/* Specimen Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                  Headline Hierarchy
                </span>
                <p 
                  className="font-serif-title text-xl sm:text-2xl font-semibold leading-tight"
                  style={{ color: currentTheme.palette.textPrimary }}
                >
                  &ldquo;Every quiet sunset shared with you becomes immortal.&rdquo;
                </p>
                <p 
                  className="text-xs leading-relaxed"
                  style={{ color: currentTheme.palette.textSecondary }}
                >
                  TogetherLens pairs optical contrast with warm atmospheric warmth, keeping memories authentic.
                </p>
              </div>

              <div className="space-y-3 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                  Interactive Controls &amp; Accent Badges
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
                    style={{ backgroundColor: currentTheme.palette.accent }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border"
                    style={{ 
                      backgroundColor: currentTheme.palette.accentMuted,
                      borderColor: currentTheme.palette.border,
                      color: currentTheme.palette.accent 
                    }}
                  >
                    Secondary Tag
                  </button>
                  <span 
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium"
                    style={{ 
                      backgroundColor: currentTheme.palette.surfaceElevated,
                      color: currentTheme.palette.textSecondary 
                    }}
                  >
                    sqlite-vec Index
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Effects & Optical Tweaks */}
          <div className="p-5 bg-stone-950/60 rounded-2xl border border-stone-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                Atmospheric Adjustments
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Ambient Glow Toggle */}
              <div 
                onClick={onToggleAmbientGlow}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ambientGlow ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'}`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Candlelight Ambient Glow
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Subtle chromatic halo around highlights
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={ambientGlow}
                  onChange={onToggleAmbientGlow}
                  className="w-4 h-4 rounded text-rose-500 border-stone-700 focus:ring-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Film Grain Toggle */}
              <div 
                onClick={onToggleFilmGrain}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${filmGrain ? 'bg-rose-500/20 text-rose-400' : 'bg-stone-800 text-stone-500'}`}>
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Analog 35mm Film Grain
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Micro-texture for tactile nostalgia
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={filmGrain}
                  onChange={onToggleFilmGrain}
                  className="w-4 h-4 rounded text-rose-500 border-stone-700 focus:ring-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-400 font-mono">
            Theme preference auto-saved to device cache
          </span>
          <button
            id="apply-theme-close-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/40 transition-all active:scale-95"
          >
            Apply &amp; Enjoy View
          </button>
        </div>

      </div>
    </div>
  );
};
