// Color utility functions, pastel palettes, and color wheel calculations for subjects

export interface PastelColorPreset {
  id: string;
  hex: string;
  name: string;
  emoji: string;
  category: 'ขนมหวาน' | 'ธรรมชาติ' | 'ผลไม้ & เครื่องดื่ม' | 'ละมุนแฟนตาซี';
}

export const PASTEL_COLOR_PRESETS: PastelColorPreset[] = [
  // ขนมหวาน
  { id: 'strawberry-milk', hex: '#fb7185', name: 'สตรอว์เบอร์รีมิลค์', emoji: '🍓', category: 'ขนมหวาน' },
  { id: 'peach-fluff', hex: '#fb923c', name: 'พีชนุ่มฟู', emoji: '🍑', category: 'ขนมหวาน' },
  { id: 'vanilla-cream', hex: '#fde047', name: 'ครีมวานิลลา', emoji: '🧁', category: 'ขนมหวาน' },
  { id: 'lemon-custard', hex: '#facc15', name: 'เลมอนคัสตาร์ด', emoji: '🍋', category: 'ขนมหวาน' },
  { id: 'cotton-candy', hex: '#f472b6', name: 'คอตตอนแคนดี้', emoji: '🍭', category: 'ขนมหวาน' },
  { id: 'chocolate-mousse', hex: '#a88274', name: 'ช็อกโกแลตมูส', emoji: '🍫', category: 'ขนมหวาน' },

  // ธรรมชาติ
  { id: 'sakura-blossom', hex: '#fda4af', name: 'ซากุระพาสเทล', emoji: '🌸', category: 'ธรรมชาติ' },
  { id: 'mint-icecream', hex: '#4ade80', name: 'มิ้นต์ไอศกรีม', emoji: '🍃', category: 'ธรรมชาติ' },
  { id: 'matcha-latte', hex: '#86efac', name: 'มัทฉะลาเต้', emoji: '🍵', category: 'ธรรมชาติ' },
  { id: 'sky-cloud', hex: '#38bdf8', name: 'สกายคลาวด์', emoji: '☁️', category: 'ธรรมชาติ' },
  { id: 'lavender-field', hex: '#818cf8', name: 'ทุ่งลาเวนเดอร์', emoji: '🪻', category: 'ธรรมชาติ' },
  { id: 'morning-mist', hex: '#94a3b8', name: 'หมอกยามเช้า', emoji: '🌫️', category: 'ธรรมชาติ' },

  // ผลไม้ & เครื่องดื่ม
  { id: 'melon-soda', hex: '#2dd4bf', name: 'เมลอนโซดา', emoji: '🍈', category: 'ผลไม้ & เครื่องดื่ม' },
  { id: 'baby-blueberry', hex: '#60a5fa', name: 'เบบี้บลูเบอร์รี', emoji: '🫐', category: 'ผลไม้ & เครื่องดื่ม' },
  { id: 'kyoho-grape', hex: '#c084fc', name: 'องุ่นเคียวโฮ', emoji: '🍇', category: 'ผลไม้ & เครื่องดื่ม' },
  { id: 'taiwan-milktea', hex: '#d4a373', name: 'ชานมไต้หวัน', emoji: '🧋', category: 'ผลไม้ & เครื่องดื่ม' },
  { id: 'apricot-sunny', hex: '#fdba74', name: 'ส้มแอปริคอต', emoji: '🍊', category: 'ผลไม้ & เครื่องดื่ม' },
  { id: 'coral-smoothie', hex: '#f87171', name: 'คอรัลสมูทตี้', emoji: '🪸', category: 'ผลไม้ & เครื่องดื่ม' },

  // ละมุนแฟนตาซี
  { id: 'magic-lilac', hex: '#a855f7', name: 'เมจิกไลแลค', emoji: '🦄', category: 'ละมุนแฟนตาซี' },
  { id: 'pony-pastel', hex: '#e879f9', name: 'โพนี่พาสเทล', emoji: '🌈', category: 'ละมุนแฟนตาซี' },
  { id: 'indigo-dream', hex: '#6366f1', name: 'อินดิโก้ดรีม', emoji: '✨', category: 'ละมุนแฟนตาซี' },
  { id: 'almond-cream', hex: '#c4b5fd', name: 'อัลมอนด์ครีม', emoji: '🥜', category: 'ละมุนแฟนตาซี' },
];

export const LEGACY_COLOR_MAP: Record<string, string> = {
  rose: '#fb7185',
  pink: '#f472b6',
  amber: '#fb923c',
  orange: '#fdba74',
  emerald: '#34d399',
  teal: '#2dd4bf',
  green: '#4ade80',
  indigo: '#6366f1',
  sky: '#38bdf8',
  blue: '#60a5fa',
  violet: '#818cf8',
  purple: '#a855f7',
  yellow: '#facc15',
  red: '#f87171',
  gray: '#94a3b8',
  slate: '#64748b',
};

// Normalize subject color to guaranteed valid hex
export function getSubjectColor(color: string | undefined | null): string {
  if (!color) return '#6366f1';
  const trimmed = color.trim().toLowerCase();
  if (trimmed.startsWith('#')) {
    // Validate hex
    const cleaned = trimmed.replace('#', '');
    if (cleaned.length === 3 || cleaned.length === 6) {
      if (/^[0-9a-fA-F]+$/.test(cleaned)) {
        return trimmed;
      }
    }
  }
  if (LEGACY_COLOR_MAP[trimmed]) {
    return LEGACY_COLOR_MAP[trimmed];
  }
  return '#6366f1';
}

// Convert Hex to RGB
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

// Transform any color into a soft pastel version
export function makeColorPastel(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#f472b6';
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Sweet pastel characteristics: lightness ~ 75-80%, saturation ~ 65-75%
  const newSat = Math.min(75, Math.max(50, hsl.s));
  const newLight = 78;
  const pastelRgb = hslToRgb(hsl.h, newSat, newLight);
  return rgbToHex(pastelRgb.r, pastelRgb.g, pastelRgb.b);
}

// Get contrast text color for badges/icons
export function getContrastTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Luminance calculation
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 170 ? '#0f172a' : '#ffffff';
}

// Generate CSS helper styles for a subject
export function getSubjectColorStyles(colorHex: string) {
  const hex = getSubjectColor(colorHex);
  const rgb = hexToRgb(hex) || { r: 99, g: 102, b: 241 };
  const textColor = getContrastTextColor(hex);

  return {
    hex,
    textColor,
    bgStyle: { backgroundColor: hex, color: textColor },
    softBgStyle: {
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
      color: textColor === '#0f172a' ? `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})` : hex,
      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
    },
    subtleBorder: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
  };
}
