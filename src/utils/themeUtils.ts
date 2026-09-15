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
    description: 'ชมพูอ่อน → ชมพูสด → ม่วงพาสเทล',
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
    id: 'emerald',
    name: 'เขียวมิ้นท์ธรรมชาติ (Mint Fresh)',
    emoji: '💚',
    hex: '#059669',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'เขียวมิ้นท์ → มรกตสด → ทีล',
  },
  {
    id: 'peach',
    name: 'ส้มพีชคอรัล (Peach Coral)',
    emoji: '🍑',
    hex: '#ea580c',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'ครีมพีช → ส้มสดใส → คอรัลอบอุ่น',
  },
  {
    id: 'amber',
    name: 'เหลืองบัตเตอร์อบอุ่น (Honey Butter)',
    emoji: '💛',
    hex: '#d97706',
    category: 'โทนสีสดใสยอดนิยม',
    description: 'เนยหวาน → ซอฟต์ออเรนจ์ → อำพันทอง',
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
  {
    id: 'dark',
    name: 'มิดไนท์ดีพบลู (Midnight Navy)',
    emoji: '🌙',
    hex: '#1e293b',
    category: 'โทนสุขุมมินิมอล',
    description: 'เนวีบลู → ม่วงมิดไนท์ → สเลทเข้ม',
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

// Ensure high-contrast readable text
export function getReadableTextColor(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (hsl.l > 42) {
    const darkenedRgb = hslToRgb(hsl.h, Math.min(hsl.s + 15, 100), 32);
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
  const isDarkTheme = hsl.l < 30;

  if (isDarkTheme) {
    const bgStart = hslToRgb(hsl.h, Math.min(hsl.s, 40), 12);
    const bgMid = hslToRgb((hsl.h + 20) % 360, Math.min(hsl.s, 45), 10);
    const bgEnd = hslToRgb((hsl.h + 40) % 360, Math.min(hsl.s, 35), 8);
    const blob1 = hslToRgb(hsl.h, 60, 25);
    const blob2 = hslToRgb((hsl.h + 45) % 360, 60, 20);
    return {
      bgStart: rgbToHex(bgStart.r, bgStart.g, bgStart.b),
      bgMid: rgbToHex(bgMid.r, bgMid.g, bgMid.b),
      bgEnd: rgbToHex(bgEnd.r, bgEnd.g, bgEnd.b),
      blob1: rgbToHex(blob1.r, blob1.g, blob1.b),
      blob2: rgbToHex(blob2.r, blob2.g, blob2.b),
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

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--app-primary', primary);
    root.style.setProperty('--app-primary-hover', hover);
    root.style.setProperty('--app-primary-text', textColor);
    root.style.setProperty('--app-primary-gradient-end', gradientEnd);
    root.style.setProperty('--app-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--app-bg-start', palette.bgStart);
    root.style.setProperty('--app-bg-mid', palette.bgMid);
    root.style.setProperty('--app-bg-end', palette.bgEnd);
    root.style.setProperty('--app-blob-1', palette.blob1);
    root.style.setProperty('--app-blob-2', palette.blob2);
    root.style.setProperty('--app-pattern-uri', patternUri);

    // Ensure body has no solid gray background
    document.body.style.backgroundColor = palette.bgStart;
    document.body.style.backgroundImage = `linear-gradient(135deg, ${palette.bgStart} 0%, ${palette.bgMid} 50%, ${palette.bgEnd} 100%)`;
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
      --app-pattern-uri: ${patternUri};

      /* Liquid Glass Variables */
      --glass-bg-primary: rgba(255, 255, 255, 0.72);
      --glass-bg-secondary: rgba(255, 255, 255, 0.58);
      --glass-bg-soft: rgba(255, 255, 255, 0.42);
      --glass-bg-floating: rgba(255, 255, 255, 0.82);
      --glass-border: rgba(255, 255, 255, 0.75);
      --glass-border-accent: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35);
      --glass-shadow: 0 8px 32px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10), 0 2px 8px 0 rgba(0,0,0,0.03);
      --glass-shadow-lg: 0 14px 44px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16), 0 4px 14px 0 rgba(0,0,0,0.05);
    }

    /* Core Liquid Glass Classes */
    .glass-primary {
      background: var(--glass-bg-primary) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: var(--glass-shadow-lg) !important;
    }

    .glass-secondary {
      background: var(--glass-bg-secondary) !important;
      backdrop-filter: blur(16px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: var(--glass-shadow) !important;
    }

    .glass-soft {
      background: var(--glass-bg-soft) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.55) !important;
    }

    .glass-floating {
      background: var(--glass-bg-floating) !important;
      backdrop-filter: blur(24px) saturate(190%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
      border: 1.5px solid rgba(255, 255, 255, 0.85) !important;
      box-shadow: var(--glass-shadow-lg) !important;
    }

    .glass-input {
      background: rgba(255, 255, 255, 0.70) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25) !important;
    }
    .glass-input:focus {
      background: rgba(255, 255, 255, 0.92) !important;
      border-color: var(--app-primary) !important;
      box-shadow: 0 0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18) !important;
    }

    /* Convert standard flat white cards to translucent liquid glass smoothly */
    .bg-white:not([data-opaque="true"]):not(select):not(option) {
      background-color: rgba(255, 255, 255, 0.76) !important;
      backdrop-filter: blur(16px) saturate(170%);
      -webkit-backdrop-filter: blur(16px) saturate(170%);
      border-color: rgba(255, 255, 255, 0.75);
      box-shadow: 0 8px 30px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08);
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
      background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) !important;
    }

    /* Light tinted backgrounds */
    .bg-pink-100,
    .bg-pink-100\\/90,
    .bg-pink-100\\/70,
    .bg-pink-100\\/50,
    .bg-indigo-100 {
      background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16) !important;
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
