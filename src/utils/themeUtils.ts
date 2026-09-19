import { ThemePatternId, getPatternSvgDataUri } from './themePatterns';

export interface ThemeColorPreset {
  id: string;
  name: string;
  emoji: string;
  hex: string;
  category: string;
  description: string;
}

export const PRESET_THEME_COLORS: ThemeColorPreset[] = [
  {
    id: 'pink',
    name: 'ชมพูซากุระหวาน (Sakura Pink)',
    emoji: '🌸',
    hex: '#db2777',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ชมพูอ่อน → ซากุระสดใส → ม่วงพาสเทล',
  },
  {
    id: 'purple',
    name: 'ม่วงลาเวนเดอร์ (Lavender Dream)',
    emoji: '💜',
    hex: '#7c3aed',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ม่วงอ่อน → ลาเวนเดอร์ → ม่วงรอยัล',
  },
  {
    id: 'blue',
    name: 'ฟ้าโอเชี่ยนคริสตัล (Crystal Ocean)',
    emoji: '🩵',
    hex: '#0284c7',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ฟ้าอ่อน → Sky Blue → ไซแอนสดใส',
  },
  {
    id: 'green',
    name: 'เขียวมิ้นท์ธรรมชาติ (Mint Green)',
    emoji: '💚',
    hex: '#059669',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'เขียวมิ้นท์ → มรกตสดใส → ทีลธรรมชาติ',
  },
  {
    id: 'yellow',
    name: 'เหลืองบัตเตอร์อบอุ่น (Honey Butter)',
    emoji: '💛',
    hex: '#d97706',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'เนยหวาน → ซอฟต์ออเรนจ์ → อำพันทอง',
  },
  {
    id: 'orange',
    name: 'ส้มสดใสพีชคอรัล (Sunset Orange)',
    emoji: '🧡',
    hex: '#ea580c',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ครีมพีช → ส้มสดใส → ซันเซ็ตคอรัล',
  },
  {
    id: 'sky',
    name: 'สกายบลูสดใส (Bright Sky)',
    emoji: '🌌',
    hex: '#0ea5e9',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ฟ้าสว่าง → สกายบลูพาสเทล → ไซแอน',
  },
  {
    id: 'dark',
    name: 'ดาร์กมิดไนท์ดีพบลู (Midnight Dark)',
    emoji: '🌙',
    hex: '#1e293b',
    category: 'โทนสุขุมมินิมอล',
    description: 'เนวีบลู → มิดไนท์คอสโม → สเลทเข้มหรู',
  },
  {
    id: 'rose',
    name: 'แดงกุหลาบโรแมนติก (Romantic Rose)',
    emoji: '🌹',
    hex: '#e11d48',
    category: 'โทนสดใส',
    description: 'ชมพูแดง → กุหลาบสด → ม่วงแดง',
  },
  {
    id: 'indigo',
    name: 'ม่วงครามกาแล็กซี (Galaxy Indigo)',
    emoji: '🔮',
    hex: '#6366f1',
    category: 'โทนสดใส',
    description: 'ครามสว่าง → ม่วงนีออน → พลัม',
  },
  {
    id: 'teal',
    name: 'ฟ้าเทอร์ควอยซ์คริสตัล (Aqua Turquoise)',
    emoji: '💎',
    hex: '#0d9488',
    category: 'โทนธรรมชาติ',
    description: 'เขียวทะเล → เทอร์ควอยซ์ → ฟ้ามิ้นท์',
  },
];

export const DEFAULT_THEME_COLOR = '#db2777'; // Romantic Sakura Pink default
export const DEFAULT_THEME_PATTERN: ThemePatternId = 'flowers';

const STORAGE_KEY_COLOR = 'mygrade_custom_theme_color';
const STORAGE_KEY_PATTERN = 'mygrade_custom_theme_pattern';
const LEGACY_STORAGE_KEY_COLOR = 'grademate_custom_theme_color';

// Utility to parse hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return null;
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Ensure high-contrast readable text (WCAG AA compliant >= 4.5:1 on light backdrops)
export function getReadableTextColor(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (hsl.l > 36) {
    const darkenedRgb = hslToRgb(hsl.h, Math.min(hsl.s + 20, 100), 28);
    return rgbToHex(darkenedRgb.r, darkenedRgb.g, darkenedRgb.b);
  }
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Get gradient secondary color (shift hue by ~25 degrees)
export function getGradientSecondaryColor(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shiftedH = (hsl.h + 28) % 360;
  const secondaryRgb = hslToRgb(shiftedH, hsl.s, Math.max(hsl.l - 4, 30));
  return rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
}

// Generate pastel background gradient steps based on theme
export function getThemeBackgroundPalette(rgb: { r: number; g: number; b: number }) {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const isDarkTheme = hsl.l < 30 || (rgb.r <= 35 && rgb.g <= 45 && rgb.b <= 65);

  if (isDarkTheme) {
    const bgStart = '#0f172a'; // Deep slate
    const bgMid = '#1e1b4b';   // Deep indigo midnight
    const bgEnd = '#020617';   // Rich midnight
    const blob1 = '#6366f1';   // Indigo glow
    const blob2 = '#a855f7';   // Purple glow
    const blob3 = '#38bdf8';   // Sky blue glow
    return {
      bgStart,
      bgMid,
      bgEnd,
      blob1,
      blob2,
      blob3,
      isDark: true,
    };
  }

  // Soft glowing pastel multi-layer gradient
  const bgStart = hslToRgb(hsl.h, Math.min(hsl.s, 48), 96);
  const bgMid = hslToRgb((hsl.h + 22) % 360, Math.min(hsl.s, 42), 94);
  const bgEnd = hslToRgb((hsl.h + 45) % 360, Math.min(hsl.s, 40), 96);
  const blob1 = hslToRgb(hsl.h, 85, 76);
  const blob2 = hslToRgb((hsl.h + 35) % 360, 80, 78);
  const blob3 = hslToRgb((hsl.h - 25 + 360) % 360, 75, 82);

  return {
    bgStart: rgbToHex(bgStart.r, bgStart.g, bgStart.b),
    bgMid: rgbToHex(bgMid.r, bgMid.g, bgMid.b),
    bgEnd: rgbToHex(bgEnd.r, bgEnd.g, bgEnd.b),
    blob1: rgbToHex(blob1.r, blob1.g, blob1.b),
    blob2: rgbToHex(blob2.r, blob2.g, blob2.b),
    blob3: rgbToHex(blob3.r, blob3.g, blob3.b),
    isDark: false,
  };
}

/**
 * Apply dynamic theme CSS variables & class styles to DOM
 */
export function applyThemeColorToDOM(hexColor: string, patternId: ThemePatternId = 'flowers') {
  const rgb = hexToRgb(hexColor) || { r: 219, g: 39, b: 119 };
  const primary = hexColor;
  const textColor = getReadableTextColor(rgb);
  const gradientEnd = getGradientSecondaryColor(rgb);
  const hoverRgb = hslToRgb(
    rgbToHsl(rgb.r, rgb.g, rgb.b).h,
    rgbToHsl(rgb.r, rgb.g, rgb.b).s,
    Math.max(15, rgbToHsl(rgb.r, rgb.g, rgb.b).l - 8)
  );
  const hover = rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b);
  const palette = getThemeBackgroundPalette(rgb);
  const patternUri = getPatternSvgDataUri(patternId, primary);

  const themeVars = {
    '--theme-bg': palette.bgStart,
    '--theme-bg-secondary': palette.bgMid,
    '--theme-primary': primary,
    '--theme-primary-soft': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.22' : '0.14'})`,
    '--theme-secondary': gradientEnd,
    '--theme-background': palette.bgStart,
    '--theme-background-gradient': `linear-gradient(135deg, ${palette.bgStart} 0%, ${palette.bgMid} 50%, ${palette.bgEnd} 100%)`,
    '--theme-glass': palette.isDark ? 'rgba(30, 41, 59, 0.76)' : 'rgba(255, 255, 255, 0.74)',
    '--theme-glass-secondary': palette.isDark ? 'rgba(30, 41, 59, 0.62)' : 'rgba(255, 255, 255, 0.62)',
    '--theme-glass-strong': palette.isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.86)',
    '--theme-glass-border': palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.82)',
    '--theme-glass-border-accent': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.45' : '0.35'})`,
    '--glass-input-bg': palette.isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.88)',
    '--glass-input-border': palette.isDark ? 'rgba(255, 255, 255, 0.22)' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
    '--glass-shadow': `0 12px 36px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.28' : '0.16'})`,
    '--theme-glow': `0 12px 36px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.28' : '0.18'})`,
    '--theme-button': `linear-gradient(135deg, ${primary} 0%, ${gradientEnd} 100%)`,
    '--theme-button-text': '#ffffff',
    '--theme-text-primary': palette.isDark ? '#f8fafc' : '#0f172a',
    '--theme-text-secondary': palette.isDark ? '#cbd5e1' : '#334155',
    '--theme-text-muted': palette.isDark ? '#94a3b8' : '#475569',
    '--theme-icon': palette.isDark ? (gradientEnd || '#818cf8') : primary,
    '--theme-progress': primary,
    '--theme-accent-soft': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.22' : '0.14'})`,
    '--theme-accent-border': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.42' : '0.32'})`,
    '--theme-pill-bg': palette.isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.75)',

    // Legacy & system variables
    '--app-primary': primary,
    '--app-primary-hover': hover,
    '--app-primary-text': textColor,
    '--app-primary-gradient-end': gradientEnd,
    '--app-primary-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--app-bg-start': palette.bgStart,
    '--app-bg-mid': palette.bgMid,
    '--app-bg-end': palette.bgEnd,
    '--app-blob-1': palette.blob1,
    '--app-blob-2': palette.blob2,
    '--app-blob-3': palette.blob3 || palette.blob1,
    '--app-pattern-uri': patternUri,
    '--theme-pattern-uri': patternUri,
  };

  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    if (palette.isDark) {
      root.setAttribute('data-theme-dark', 'true');
      document.body.setAttribute('data-theme-dark', 'true');
    } else {
      root.removeAttribute('data-theme-dark');
      document.body.removeAttribute('data-theme-dark');
    }

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Ensure body styling matches
    document.body.style.backgroundColor = palette.bgStart;
    document.body.style.backgroundImage = themeVars['--theme-background-gradient'];
    document.body.style.color = palette.isDark ? '#f8fafc' : '#0f172a';
  }

  const styleId = 'mygrade-dynamic-theme-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.getElementById('grademate-dynamic-theme-style') as HTMLStyleElement | null;
    if (styleEl) {
      styleEl.id = styleId;
    } else {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
  }

  styleEl.textContent = `
    :root {
      --theme-bg: ${palette.bgStart};
      --theme-bg-secondary: ${palette.bgMid};
      --theme-primary: ${primary};
      --theme-primary-soft: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.22' : '0.14'});
      --theme-secondary: ${gradientEnd};
      --theme-background: ${palette.bgStart};
      --theme-background-gradient: linear-gradient(135deg, ${palette.bgStart} 0%, ${palette.bgMid} 50%, ${palette.bgEnd} 100%);
      --theme-glass: ${palette.isDark ? 'rgba(30, 41, 59, 0.76)' : 'rgba(255, 255, 255, 0.74)'};
      --theme-glass-secondary: ${palette.isDark ? 'rgba(30, 41, 59, 0.62)' : 'rgba(255, 255, 255, 0.62)'};
      --theme-glass-strong: ${palette.isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.86)'};
      --theme-glass-border: ${palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.82)'};
      --theme-glass-border-accent: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.45' : '0.35'});
      --glass-input-bg: ${palette.isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.88)'};
      --glass-input-border: ${palette.isDark ? 'rgba(255, 255, 255, 0.22)' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`};
      --glass-shadow: 0 12px 36px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.28' : '0.16'});
      --theme-glow: 0 12px 36px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.28' : '0.18'});
      --theme-button: linear-gradient(135deg, ${primary} 0%, ${gradientEnd} 100%);
      --theme-button-text: #ffffff;
      --theme-text-primary: ${palette.isDark ? '#f8fafc' : '#0f172a'};
      --theme-text-secondary: ${palette.isDark ? '#cbd5e1' : '#334155'};
      --theme-text-muted: ${palette.isDark ? '#94a3b8' : '#475569'};
      --theme-icon: ${palette.isDark ? (gradientEnd || '#818cf8') : primary};
      --theme-progress: ${primary};
      --theme-accent-soft: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.22' : '0.14'});
      --theme-accent-border: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.42' : '0.32'});
      --theme-pill-bg: ${palette.isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.75)'};

      --app-primary: ${primary};
      --app-primary-hover: ${hover};
      --app-primary-text: ${textColor};
      --app-primary-gradient-end: ${gradientEnd};
      --app-primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
      --app-bg-start: ${palette.bgStart};
      --app-bg-mid: ${palette.bgMid};
      --app-bg-end: ${palette.bgEnd};
      --app-blob-1: ${palette.blob1};
      --app-blob-2: ${palette.blob2};
      --app-blob-3: ${palette.blob3 || palette.blob1};
      --app-pattern-uri: ${patternUri};
      --theme-pattern-uri: ${patternUri};

      /* Typography Color System (WCAG AA Compliant) */
      --text-primary: ${palette.isDark ? '#f8fafc' : '#0f172a'};
      --text-secondary: ${palette.isDark ? '#cbd5e1' : '#334155'};
      --text-muted: ${palette.isDark ? '#94a3b8' : '#475569'};
      --text-on-accent: #ffffff;
      --text-link: ${textColor};
      --text-success: ${palette.isDark ? '#34d399' : '#047857'};
      --text-warning: ${palette.isDark ? '#fbbf24' : '#b45309'};
      --text-danger: ${palette.isDark ? '#f87171' : '#be123c'};

      /* Liquid Glass Variables */
      --glass-bg-primary: var(--theme-glass);
      --glass-bg-secondary: var(--theme-glass-secondary);
      --glass-bg-soft: ${palette.isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.65)'};
      --glass-bg-floating: ${palette.isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.92)'};
      --glass-border: var(--theme-glass-border);
      --glass-border-accent: var(--theme-glass-border-accent);
      --glass-shadow: var(--theme-glow);
      --glass-shadow-lg: 0 16px 48px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.30' : '0.20'});
    }

    /* Dedicated Theme Class Utility Hooks */
    .app-theme-btn {
      background: var(--theme-button) !important;
      color: var(--theme-button-text) !important;
      box-shadow: var(--theme-glow) !important;
    }
    .app-theme-icon-container {
      background-color: var(--theme-accent-soft) !important;
      border: 1.5px solid var(--theme-accent-border) !important;
      box-shadow: 0 4px 16px 0 rgba(var(--app-primary-rgb), 0.22) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
    }
    .app-theme-icon {
      color: var(--theme-icon) !important;
    }
    .app-theme-progress {
      background-color: var(--theme-progress) !important;
    }

    /* Core Liquid Glass Classes */
    .glass-card,
    .glass-primary {
      background: var(--theme-glass) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid var(--theme-glass-border) !important;
      box-shadow: var(--glass-shadow) !important;
      color: var(--text-primary);
    }

    .glass-secondary {
      background: var(--theme-glass-secondary) !important;
      backdrop-filter: blur(14px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
      border: 1px solid var(--theme-glass-border) !important;
      box-shadow: var(--glass-shadow) !important;
      color: var(--text-primary);
    }

    .glass-soft {
      background: var(--glass-bg-soft) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.65) !important;
      color: var(--text-primary);
    }

    .glass-floating {
      background: var(--glass-bg-floating) !important;
      backdrop-filter: blur(24px) saturate(190%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
      border: 1.5px solid var(--glass-border) !important;
      box-shadow: var(--glass-shadow-lg) !important;
      color: var(--text-primary);
    }

    /* Liquid Glass Inputs - Maximum Text Readability */
    .glass-input {
      background: var(--glass-input-bg) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1.5px solid var(--glass-input-border) !important;
      color: var(--text-primary) !important;
    }
    .glass-input:focus {
      background: ${palette.isDark ? 'rgba(30, 41, 59, 0.95)' : '#ffffff'} !important;
      border-color: var(--app-primary) !important;
      box-shadow: 0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22) !important;
    }
    .glass-input::placeholder {
      color: #64748b !important;
      opacity: 1 !important;
    }

    /* Convert standard flat white cards to translucent liquid glass with readable text */
    .bg-white:not([data-opaque="true"]):not(select):not(option):not(input):not(textarea) {
      background-color: ${palette.isDark ? 'rgba(30, 41, 59, 0.78)' : 'rgba(255, 255, 255, 0.76)'} !important;
      backdrop-filter: blur(16px) saturate(170%);
      -webkit-backdrop-filter: blur(16px) saturate(170%);
      border-color: ${palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.82)'};
      box-shadow: 0 8px 30px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.24' : '0.08'});
      color: var(--text-primary);
    }

    /* Dark theme specific overrides to eliminate harsh white surfaces and black text on dark bg */
    [data-theme-dark="true"] .text-slate-900,
    [data-theme-dark="true"] .text-slate-800,
    [data-theme-dark="true"] .text-slate-700 {
      color: #f8fafc !important;
    }
    [data-theme-dark="true"] .text-slate-600,
    [data-theme-dark="true"] .text-slate-500 {
      color: #cbd5e1 !important;
    }
    [data-theme-dark="true"] .text-slate-400 {
      color: #94a3b8 !important;
    }
    [data-theme-dark="true"] .bg-white\/80,
    [data-theme-dark="true"] .bg-white\/90,
    [data-theme-dark="true"] .bg-white\/75,
    [data-theme-dark="true"] .bg-white\/70,
    [data-theme-dark="true"] .bg-white\/65,
    [data-theme-dark="true"] .bg-white\/60 {
      background-color: rgba(30, 41, 59, 0.88) !important;
      border-color: rgba(255, 255, 255, 0.16) !important;
      color: #f8fafc !important;
    }
    [data-theme-dark="true"] .bg-slate-100,
    [data-theme-dark="true"] .bg-slate-100\/80,
    [data-theme-dark="true"] .bg-slate-100\/95,
    [data-theme-dark="true"] .bg-slate-50 {
      background-color: rgba(15, 23, 42, 0.70) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }
    [data-theme-dark="true"] .border-slate-200,
    [data-theme-dark="true"] .border-slate-200\/80,
    [data-theme-dark="true"] .border-slate-200\/60,
    [data-theme-dark="true"] .border-slate-100 {
      border-color: rgba(255, 255, 255, 0.14) !important;
    }
    [data-theme-dark="true"] .blob-mix {
      mix-blend-mode: screen !important;
      opacity: 0.35 !important;
    }
    html:not([data-theme-dark="true"]) .blob-mix {
      mix-blend-mode: multiply !important;
      opacity: 0.42 !important;
    }

    /* Smooth Floating Animation for background blobs */
    @keyframes float-blob-1 {
      0%, 100% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(35px, -30px) scale(1.08); }
    }
    @keyframes float-blob-2 {
      0%, 100% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(-30px, 35px) scale(1.12); }
    }
    @keyframes float-blob-3 {
      0%, 100% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(25px, 25px) scale(0.95); }
    }
    .animate-blob-1 {
      animation: float-blob-1 18s ease-in-out infinite;
    }
    .animate-blob-2 {
      animation: float-blob-2 22s ease-in-out infinite;
    }
    .animate-blob-3 {
      animation: float-blob-3 20s ease-in-out infinite;
    }

    /* Primary backgrounds */
    .bg-pink-600,
    .bg-pink-500,
    .bg-indigo-600,
    .bg-indigo-700,
    button.bg-pink-600,
    button.bg-indigo-600,
    .app-theme-bg {
      background-color: var(--app-primary) !important;
    }

    /* Hover states */
    .hover\\:bg-pink-700:hover,
    .hover\\:bg-pink-600:hover,
    .hover\\:bg-indigo-700:hover,
    .hover\\:bg-indigo-600:hover {
      background-color: var(--app-primary-hover) !important;
    }

    /* Subtle tinted backgrounds */
    .bg-pink-50,
    .bg-pink-50\\/70,
    .bg-pink-50\\/50,
    .bg-pink-50\\/40,
    .bg-pink-50\\/30,
    .bg-indigo-50 {
      background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.20' : '0.08'}) !important;
    }

    /* Light tinted backgrounds */
    .bg-pink-100,
    .bg-pink-100\\/90,
    .bg-pink-100\\/70,
    .bg-pink-100\\/50,
    .bg-indigo-100 {
      background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${palette.isDark ? '0.28' : '0.16'}) !important;
    }

    /* Accent texts */
    .text-pink-600,
    .text-pink-700,
    .text-pink-500,
    .text-indigo-600,
    .text-indigo-700,
    .text-indigo-800,
    .hover\\:text-pink-600:hover,
    .hover\\:text-pink-700:hover,
    .hover\\:text-indigo-600:hover,
    .hover\\:text-indigo-700:hover,
    .app-theme-text {
      color: var(--app-primary-text) !important;
    }

    /* Accent borders */
    .border-pink-100,
    .border-pink-200,
    .border-pink-200\\/80,
    .border-pink-200\\/90,
    .border-pink-300,
    .border-indigo-100,
    .border-indigo-200,
    .border-indigo-300 {
      border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28) !important;
    }

    .border-pink-400,
    .border-pink-500,
    .border-pink-600,
    .border-indigo-400,
    .border-indigo-500,
    .border-indigo-600 {
      border-color: var(--app-primary) !important;
    }

    /* Focus rings */
    .ring-pink-400,
    .ring-pink-500,
    .focus\\:ring-pink-400:focus,
    .focus\\:ring-pink-500:focus,
    .focus\\:ring-indigo-500:focus,
    .focus\\:ring-indigo-600:focus {
      --tw-ring-color: var(--app-primary) !important;
    }

    /* Gradients */
    .from-pink-500,
    .from-pink-600,
    .from-indigo-600,
    .from-indigo-700 {
      --tw-gradient-from: var(--app-primary) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: rgb(var(--app-primary-rgb) / 0) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }

    .to-pink-400,
    .to-pink-500,
    .to-pink-600,
    .to-sky-400,
    .to-sky-600 {
      --tw-gradient-to: var(--app-primary-gradient-end) var(--tw-gradient-to-position) !important;
    }

    ::selection {
      background-color: var(--app-primary) !important;
      color: #ffffff !important;
    }
  `;
}

// Get saved theme color
export function getSavedThemeColor(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COLOR) || localStorage.getItem(LEGACY_STORAGE_KEY_COLOR);
    if (saved && hexToRgb(saved)) {
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_THEME_COLOR;
}

// Save theme color
export function saveThemeColor(hexColor: string) {
  try {
    localStorage.setItem(STORAGE_KEY_COLOR, hexColor);
  } catch (e) {
    // fallback
  }
}

// Get saved theme pattern
export function getSavedThemePattern(): ThemePatternId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PATTERN);
    if (saved) {
      return saved as ThemePatternId;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_THEME_PATTERN;
}

// Save theme pattern
export function saveThemePattern(patternId: ThemePatternId) {
  try {
    localStorage.setItem(STORAGE_KEY_PATTERN, patternId);
  } catch (e) {
    // fallback
  }
}

// Curated list of distinct vibrant/pastel/neon/dark theme colors for Random Theme Generator
export const RANDOM_THEME_COLORS = [
  '#db2777', // Sweet Sakura Pink
  '#ec4899', // Hot Strawberry Pink
  '#f43f5e', // Vibrant Rose
  '#7c3aed', // Lavender Purple
  '#8b5cf6', // Soft Violet
  '#6366f1', // Galaxy Indigo
  '#0284c7', // Crystal Ocean Blue
  '#0ea5e9', // Bright Sky Blue
  '#06b6d4', // Neon Cyan
  '#0d9488', // Aqua Turquoise
  '#059669', // Emerald Mint Green
  '#10b981', // Vivid Mint
  '#84cc16', // Fresh Lime
  '#d97706', // Honey Butter Gold
  '#ea580c', // Sunset Coral Orange
  '#ef4444', // Candy Red
  '#1e293b', // Midnight Dark Slate
  '#0f172a', // Cosmos Black Deep
  '#1e1b4b', // Deep Royal Navy Dark
];

