export interface ThemeColorPreset {
  id: string;
  name: string;
  emoji: string;
  hex: string;
  category: string;
}

export const PRESET_THEME_COLORS: ThemeColorPreset[] = [
  { id: 'indigo', name: 'ม่วงครามคลาสสิก', emoji: '🔮', hex: '#6366f1', category: 'โทนยอดนิยม' },
  { id: 'sky', name: 'ฟ้าโอเชี่ยนสดใส', emoji: '🌊', hex: '#0284c7', category: 'โทนยอดนิยม' },
  { id: 'emerald', name: 'เขียวมรกตธรรมชาติ', emoji: '🍃', hex: '#059669', category: 'โทนยอดนิยม' },
  { id: 'rose', name: 'แดงกุหลาบกระตือรือร้น', emoji: '🌹', hex: '#e11d48', category: 'โทนยอดนิยม' },
  { id: 'purple', name: 'ม่วงเข้มรอยัล', emoji: '👑', hex: '#7c3aed', category: 'โทนสีสดใส' },
  { id: 'pink', name: 'ชมพูซากุระหวาน', emoji: '🌸', hex: '#db2777', category: 'โทนสีสดใส' },
  { id: 'orange', name: 'ส้มแสงแดดยามเย็น', emoji: '🌅', hex: '#ea580c', category: 'โทนสีสดใส' },
  { id: 'amber', name: 'เหลืองอำพันอบอุ่น', emoji: '✨', hex: '#d97706', category: 'โทนสีสดใส' },
  { id: 'teal', name: 'เขียวมิ้นท์ไซแอน', emoji: '💎', hex: '#0d9488', category: 'โทนธรรมชาติ' },
  { id: 'cyan', name: 'ฟ้าเทอร์ควอยซ์', emoji: '❄️', hex: '#0891b2', category: 'โทนธรรมชาติ' },
  { id: 'navy', name: 'น้ำเงินดีพเนวีสุขุม', emoji: '🌌', hex: '#1e40af', category: 'โทนสุขุมมินิมอล' },
  { id: 'slate', name: 'เทาสเลทมินิมอล', emoji: '📓', hex: '#475569', category: 'โทนสุขุมมินิมอล' },
];

export const DEFAULT_THEME_COLOR = '#6366f1';
const STORAGE_KEY = 'mygrade_custom_theme_color';
const LEGACY_STORAGE_KEY = 'grademate_custom_theme_color';

// Utility to parse hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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

// Check contrast and darken text if too bright for light backgrounds
export function getReadableTextColor(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // If lightness is high (> 48%), darken it so text is crisp and readable
  if (hsl.l > 45) {
    const darkenedRgb = hslToRgb(hsl.h, Math.min(hsl.s + 10, 100), 38);
    return rgbToHex(darkenedRgb.r, darkenedRgb.g, darkenedRgb.b);
  }
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Get gradient secondary color (shift hue by ~25 degrees)
export function getGradientSecondaryColor(rgb: { r: number; g: number; b: number }): string {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shiftedH = (hsl.h + 28) % 360;
  const secondaryRgb = hslToRgb(shiftedH, hsl.s, Math.max(hsl.l - 5, 30));
  return rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
}

// Apply dynamic theme CSS variables & class styles to document
export function applyThemeColorToDOM(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return;

  const primary = hexColor;
  const textColor = getReadableTextColor(rgb);
  const gradientEnd = getGradientSecondaryColor(rgb);
  const hoverRgb = hslToRgb(rgbToHsl(rgb.r, rgb.g, rgb.b).h, rgbToHsl(rgb.r, rgb.g, rgb.b).s, Math.max(15, rgbToHsl(rgb.r, rgb.g, rgb.b).l - 8));
  const hover = rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b);

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
      --app-primary-light: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12);
      --app-primary-subtle: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06);
      --app-primary-border: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22);
    }

    /* Dynamic overrides for components using indigo */
    .bg-indigo-600,
    .bg-indigo-700,
    button.bg-indigo-600,
    .app-theme-bg {
      background-color: var(--app-primary) !important;
    }

    .hover\\:bg-indigo-700:hover,
    .hover\\:bg-indigo-600:hover {
      background-color: var(--app-primary-hover) !important;
    }

    .bg-indigo-50 {
      background-color: var(--app-primary-subtle) !important;
    }

    .bg-indigo-100 {
      background-color: var(--app-primary-light) !important;
    }

    .text-indigo-600,
    .text-indigo-700,
    .text-indigo-800,
    .hover\\:text-indigo-600:hover,
    .hover\\:text-indigo-700:hover,
    .app-theme-text {
      color: var(--app-primary-text) !important;
    }

    .border-indigo-100,
    .border-indigo-200 {
      border-color: var(--app-primary-border) !important;
    }

    .border-indigo-300,
    .border-indigo-500,
    .border-indigo-600 {
      border-color: var(--app-primary) !important;
    }

    .focus\\:ring-indigo-500:focus,
    .focus\\:ring-indigo-600:focus {
      --tw-ring-color: var(--app-primary) !important;
    }

    /* Logo gradient & accents */
    .from-indigo-600,
    .from-indigo-700 {
      --tw-gradient-from: var(--app-primary) var(--tw-gradient-from-position) !important;
      --tw-gradient-to: rgb(var(--app-primary-rgb) / 0) var(--tw-gradient-to-position) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }

    .to-sky-400,
    .to-sky-600 {
      --tw-gradient-to: var(--app-primary-gradient-end) var(--tw-gradient-to-position) !important;
    }

    .via-indigo-500,
    .via-indigo-600 {
      --tw-gradient-stops: var(--tw-gradient-from), var(--app-primary) var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
    }

    ::selection {
      background-color: var(--app-primary) !important;
      color: #ffffff !important;
    }
  `;
}

// Get saved theme from localStorage or default
export function getSavedThemeColor(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved && hexToRgb(saved)) {
      return saved;
    }
  } catch (e) {
    // LocalStorage fallback
  }
  return DEFAULT_THEME_COLOR;
}

// Save theme to localStorage
export function saveThemeColor(hexColor: string) {
  try {
    localStorage.setItem(STORAGE_KEY, hexColor);
  } catch (e) {
    // Fallback
  }
}
