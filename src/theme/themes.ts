import { AppThemeId, ThemeConfig } from '../types';

export const THEME_PRESETS: Record<AppThemeId, ThemeConfig> = {
  'midnight-rose': {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    tagline: 'Velvet charcoal and candlelit blush rose for intimate evening storytelling',
    isDark: true,
    palette: {
      bg: '#1c1917', // stone-900
      surface: '#292524', // stone-800
      surfaceElevated: '#38302e',
      border: 'rgba(244, 63, 94, 0.2)',
      textPrimary: '#f5f5f4', // stone-100
      textSecondary: '#a8a29e', // stone-400
      accent: '#f43f5e', // rose-500
      accentHover: '#fb7185', // rose-400
      accentMuted: 'rgba(244, 63, 94, 0.15)',
      glow: 'rgba(244, 63, 94, 0.35)',
      ringColor: '#f43f5e',
      swatches: ['#1c1917', '#292524', '#f43f5e', '#f59e0b'],
    },
    fontPairing: {
      title: 'Playfair Display',
      body: 'Plus Jakarta Sans',
      mood: 'Romantic & Intimate',
    },
  },
  'warm-linen': {
    id: 'warm-linen',
    name: 'Warm Linen & Sepia',
    tagline: 'Artisanal photobook editorial aesthetic with alabaster linen and terracotta accents',
    isDark: false,
    palette: {
      bg: '#f7f4ee', // warm linen cream
      surface: '#ffffff', // crisp paper card
      surfaceElevated: '#f0ebe1',
      border: 'rgba(180, 83, 9, 0.2)',
      textPrimary: '#292524', // deep stone/espresso
      textSecondary: '#78716c', // stone-500
      accent: '#c2410c', // burnt terracotta
      accentHover: '#ea580c', // orange-600
      accentMuted: 'rgba(194, 65, 12, 0.12)',
      glow: 'rgba(217, 119, 6, 0.25)',
      ringColor: '#c2410c',
      swatches: ['#f7f4ee', '#ffffff', '#c2410c', '#d97706'],
    },
    fontPairing: {
      title: 'Playfair Display',
      body: 'Outfit',
      mood: 'Editorial & Timeless Photobook',
    },
  },
  'nordic-twilight': {
    id: 'nordic-twilight',
    name: 'Nordic Twilight',
    tagline: 'Deep arctic slate navy with glacial starlight and aurora cyan highlights',
    isDark: true,
    palette: {
      bg: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      surfaceElevated: '#334155', // slate-700
      border: 'rgba(56, 189, 248, 0.25)',
      textPrimary: '#f8fafc', // slate-50
      textSecondary: '#94a3b8', // slate-400
      accent: '#38bdf8', // sky-400
      accentHover: '#0ea5e9', // sky-500
      accentMuted: 'rgba(56, 189, 248, 0.15)',
      glow: 'rgba(56, 189, 248, 0.35)',
      ringColor: '#38bdf8',
      swatches: ['#0f172a', '#1e293b', '#38bdf8', '#2dd4bf'],
    },
    fontPairing: {
      title: 'Outfit',
      body: 'Plus Jakarta Sans',
      mood: 'Serene, Crisp & Cinematic',
    },
  },
  'emerald-botanical': {
    id: 'emerald-botanical',
    name: 'Emerald Botanical',
    tagline: 'Deep evergreen moss and conservatory shadows with warm champagne gold accents',
    isDark: true,
    palette: {
      bg: '#052e16', // green-950
      surface: '#064e3b', // emerald-900
      surfaceElevated: '#047857', // emerald-700
      border: 'rgba(234, 179, 8, 0.25)',
      textPrimary: '#f0fdf4', // green-50
      textSecondary: '#a7f3d0', // emerald-200
      accent: '#eab308', // amber-500 (champagne gold)
      accentHover: '#facc15', // amber-400
      accentMuted: 'rgba(234, 179, 8, 0.15)',
      glow: 'rgba(234, 179, 8, 0.35)',
      ringColor: '#eab308',
      swatches: ['#052e16', '#064e3b', '#eab308', '#34d399'],
    },
    fontPairing: {
      title: 'Playfair Display',
      body: 'Plus Jakarta Sans',
      mood: 'Lush, Organic & Vintage Gold',
    },
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    tagline: 'Golden hour burnished copper, honey amber, and warm roasted espresso',
    isDark: true,
    palette: {
      bg: '#1c100a', // rich dark warm espresso
      surface: '#2b1810',
      surfaceElevated: '#3d2318',
      border: 'rgba(249, 115, 22, 0.25)',
      textPrimary: '#fff7ed', // orange-50
      textSecondary: '#fed7aa', // orange-200
      accent: '#f97316', // orange-500
      accentHover: '#fb923c', // orange-400
      accentMuted: 'rgba(249, 115, 22, 0.15)',
      glow: 'rgba(249, 115, 22, 0.35)',
      ringColor: '#f97316',
      swatches: ['#1c100a', '#2b1810', '#f97316', '#fbbf24'],
    },
    fontPairing: {
      title: 'Playfair Display',
      body: 'Outfit',
      mood: 'Warm, Radiant & Golden Hour',
    },
  },
};

export const DEFAULT_THEME_ID: AppThemeId = 'midnight-rose';
