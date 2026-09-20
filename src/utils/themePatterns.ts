export type ThemePatternId =
  // Cute 💗
  | 'hearts'
  | 'flowers'
  | 'stars'
  | 'clouds'
  | 'bows'
  | 'sparkles'
  | 'dots'
  | 'rainbow'
  | 'kitty'
  | 'cute-doodle'
  // Cool 🖤
  | 'grid'
  | 'cyber'
  | 'circuit'
  | 'neon-grid'
  | 'geometry'
  | 'diagonal'
  | 'waves'
  | 'dark-stars'
  | 'matrix'
  | 'tech-dots'
  // Aesthetic ✨
  | 'minimal'
  | 'soft-waves'
  | 'paper'
  | 'aurora'
  | 'glass-shine'
  | 'moon-stars'
  | 'night-sky'
  | 'ocean'
  // Classic / Minimal
  | 'gradient'
  | 'none';

export type PatternCategory = 'cute' | 'cool' | 'aesthetic' | 'classic';

export interface ThemePatternOption {
  id: ThemePatternId;
  name: string;
  emoji: string;
  desc: string;
  category: PatternCategory;
  tileSize?: string;
}

export const THEME_PATTERN_CATEGORIES: { id: PatternCategory; name: string; emoji: string }[] = [
  { id: 'cute', name: 'Cute 💗', emoji: '💗' },
  { id: 'cool', name: 'Cool 🖤', emoji: '🖤' },
  { id: 'aesthetic', name: 'Aesthetic ✨', emoji: '✨' },
  { id: 'classic', name: 'Clean / เรียบง่าย', emoji: '🫧' },
];

export const THEME_PATTERNS: ThemePatternOption[] = [
  // ---------------- Cute 💗 (10 patterns) ----------------
  {
    id: 'hearts',
    name: 'Hearts (หัวใจนุ่มนวล)',
    emoji: '💗',
    desc: 'ลายหัวใจเล็ก ๆ กระจายแบบนุ่ม ๆ ฟุ้งฟริ้ง',
    category: 'cute',
    tileSize: '56px 56px',
  },
  {
    id: 'flowers',
    name: 'Flowers (ดอกไม้พาสเทล)',
    emoji: '🌸',
    desc: 'ดอกซากุระและกลีบดอกไม้เล็ก ๆ สดใส',
    category: 'cute',
    tileSize: '64px 64px',
  },
  {
    id: 'stars',
    name: 'Stars (ดาวคิวท์วิบวับ)',
    emoji: '⭐',
    desc: 'ดวงดาว 4 แฉกและประกายแสงน่ารัก',
    category: 'cute',
    tileSize: '52px 52px',
  },
  {
    id: 'clouds',
    name: 'Clouds (ก้อนเมฆนุ่ม)',
    emoji: '☁️',
    desc: 'ปุยเมฆนุ่มละมุนตาพร้อมละอองประกาย',
    category: 'cute',
    tileSize: '64px 64px',
  },
  {
    id: 'bows',
    name: 'Bows (โบว์ริบบิ้น)',
    emoji: '🎀',
    desc: 'โบว์ผูกริบบิ้นเล็ก ๆ สไตล์วัยรุ่นหวาน',
    category: 'cute',
    tileSize: '60px 60px',
  },
  {
    id: 'sparkles',
    name: 'Sparkles (วิบวับระยิบ)',
    emoji: '✨',
    desc: 'ประกายเพชร ✦ ✧ วาววับตา',
    category: 'cute',
    tileSize: '48px 48px',
  },
  {
    id: 'dots',
    name: 'Dots (จุดกลมพาสเทล)',
    emoji: '🫧',
    desc: 'จุด Polka Dot กลมนุ่มนวลสดใส',
    category: 'cute',
    tileSize: '36px 36px',
  },
  {
    id: 'rainbow',
    name: 'Rainbow (สายรุ้งจิ๋ว)',
    emoji: '🌈',
    desc: 'โค้งสายรุ้งพาสเทลคู่ดวงดาว',
    category: 'cute',
    tileSize: '64px 64px',
  },
  {
    id: 'kitty',
    name: 'Kitty (น้องแมวมินิมอล)',
    emoji: '🐱',
    desc: 'หน้าแมวน่ารักเส้นมินิมอลและรอยเท้า',
    category: 'cute',
    tileSize: '60px 60px',
  },
  {
    id: 'cute-doodle',
    name: 'Cute Doodle (ดูเดิลรวม)',
    emoji: '🎨',
    desc: 'ดาว หัวใจ ดอกไม้ เมฆ ผสมผสาน',
    category: 'cute',
    tileSize: '72px 72px',
  },

  // ---------------- Cool 🖤 (10 patterns) ----------------
  {
    id: 'grid',
    name: 'Grid (ตารางจีโอเมตริก)',
    emoji: '▦',
    desc: 'ตาราง Geometric Blueprint ทรงโมเดิร์น',
    category: 'cool',
    tileSize: '40px 40px',
  },
  {
    id: 'cyber',
    name: 'Cyber (เส้นดิจิทัล)',
    emoji: '⚡',
    desc: 'เส้นสาย Digital Futuristic ล้ำยุค',
    category: 'cool',
    tileSize: '54px 54px',
  },
  {
    id: 'circuit',
    name: 'Circuit (แผงวงจร)',
    emoji: '💻',
    desc: 'ลายวงจรอิเล็กทรอนิกส์และ Node เชื่อมโยง',
    category: 'cool',
    tileSize: '64px 64px',
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid (นีออนกริด)',
    emoji: '🌐',
    desc: 'โครงร่างมิติแบบ Futuristic Neon Grid',
    category: 'cool',
    tileSize: '60px 60px',
  },
  {
    id: 'geometry',
    name: 'Geometry (เรขาคณิต)',
    emoji: '◇',
    desc: 'สามเหลี่ยม สี่เหลี่ยมข้าวหลามตัด และวงกลม',
    category: 'cool',
    tileSize: '56px 56px',
  },
  {
    id: 'diagonal',
    name: 'Diagonal (เส้นเฉียงโมเดิร์น)',
    emoji: '▞',
    desc: 'เส้นเฉียง Micro-stripe ทันสมัยคมชัด',
    category: 'cool',
    tileSize: '32px 32px',
  },
  {
    id: 'waves',
    name: 'Waves (คลื่นแอ็บสแตรกต์)',
    emoji: '〰️',
    desc: 'เส้นคลื่น Sine Wave เชิงนามธรรม',
    category: 'cool',
    tileSize: '64px 48px',
  },
  {
    id: 'dark-stars',
    name: 'Dark Stars (ดวงดาวอวกาศ)',
    emoji: '🌌',
    desc: 'ดาวระยิบระยับและกลุ่มดาวเรขาคณิต',
    category: 'cool',
    tileSize: '60px 60px',
  },
  {
    id: 'matrix',
    name: 'Matrix (พิกเซลสตรีม)',
    emoji: '📟',
    desc: 'ละอองจุด Matrix ดิจิทัลเรียบเท่ ไม่รกสายตา',
    category: 'cool',
    tileSize: '48px 48px',
  },
  {
    id: 'tech-dots',
    name: 'Tech Dots (จุดโครงข่าย)',
    emoji: '🔗',
    desc: 'จุดเชื่อมต่อสายข้อมูลแห่งโลกเทคโนโลยี',
    category: 'cool',
    tileSize: '64px 64px',
  },

  // ---------------- Aesthetic ✨ (8 patterns) ----------------
  {
    id: 'minimal',
    name: 'Minimal (จุดบางมินิมอล)',
    emoji: '▫️',
    desc: 'ลายจุดและเครื่องหมายกากบาทบางเบาสะอาดตา',
    category: 'aesthetic',
    tileSize: '36px 36px',
  },
  {
    id: 'soft-waves',
    name: 'Soft Waves (คลื่นนุ่มละมุน)',
    emoji: '🌊',
    desc: 'คลื่นลื่นไหลอ่อนโยน ผ่อนคลายสายตา',
    category: 'aesthetic',
    tileSize: '64px 48px',
  },
  {
    id: 'paper',
    name: 'Paper (เนื้อกระดาษโน้ต)',
    emoji: '📜',
    desc: 'สัมผัสสมุดจดบันทึก Grid Texture เบาสบาย',
    category: 'aesthetic',
    tileSize: '32px 32px',
  },
  {
    id: 'aurora',
    name: 'Aurora (แสงออโรร่า)',
    emoji: '✨',
    desc: 'เกลียวคลื่นแสงออโรร่าเรืองรองนุ่มนวล',
    category: 'aesthetic',
    tileSize: '72px 72px',
  },
  {
    id: 'glass-shine',
    name: 'Glass Shine (แสงสะท้อนกระจก)',
    emoji: '🫧',
    desc: 'ประกายแสงและเหลี่ยมสะท้อน Liquid Glass',
    category: 'aesthetic',
    tileSize: '64px 64px',
  },
  {
    id: 'moon-stars',
    name: 'Moon & Stars (จันทร์ & ดาว)',
    emoji: '🌙',
    desc: 'พระจันทร์เสี้ยวและหมู่ดาวประกายค่ำคืน',
    category: 'aesthetic',
    tileSize: '60px 60px',
  },
  {
    id: 'night-sky',
    name: 'Night Sky (ฟากฟ้าราตรี)',
    emoji: '🌠',
    desc: 'ท้องฟ้ายามค่ำคืนและทางช้างเผือกจิ๋ว',
    category: 'aesthetic',
    tileSize: '64px 64px',
  },
  {
    id: 'ocean',
    name: 'Ocean (เกลียวคลื่นมหาสมุทร)',
    emoji: '🪸',
    desc: 'ริ้วคลื่นน้ำและฟองอากาศใต้ท้องทะเลลึก',
    category: 'aesthetic',
    tileSize: '60px 48px',
  },

  // ---------------- Classic / Clean ----------------
  {
    id: 'gradient',
    name: 'Gradient Only (ไล่สีเนียนตา)',
    emoji: '🫧',
    desc: 'ไล่เฉดสีนุ่มนวลสไตล์ Liquid Glass ไร้ลวดลาย',
    category: 'classic',
    tileSize: 'auto',
  },
  {
    id: 'none',
    name: 'None (เรียบหรูคลีน)',
    emoji: '🤍',
    desc: 'มินิมอลกลาสคลีน สบายตาแบบบริสุทธิ์',
    category: 'classic',
    tileSize: 'auto',
  },
];

// Helper to convert hex to RGB
function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  if (isNaN(num)) return { r: 219, g: 39, b: 119 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to detect if a color or theme is dark
function isDarkColor(rgb: { r: number; g: number; b: number }): boolean {
  // Relative luminance calculation
  const l = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return l < 110;
}

/**
 * Generate an SVG background pattern data-uri tinted with the selected theme color.
 * Automatically handles dark mode contrast enhancement, custom color wheel shades,
 * and high-contrast stroke opacities so patterns are clearly visible under Liquid Glass.
 */
export function getPatternSvgDataUri(patternId: ThemePatternId, strokeColorHex: string = '#db2777'): string {
  if (patternId === 'none' || patternId === 'gradient') {
    return 'none';
  }

  const rgb = parseHex(strokeColorHex);
  const isDark = isDarkColor(rgb);

  // For dark themes: elevate luminosity so the pattern glows softly against the dark background
  let strokeHex = strokeColorHex;
  let strokeOp = '0.65';
  let fillOp = '0.30';
  let altStrokeOp = '0.45';

  if (isDark) {
    // Lighten and glow for dark background
    strokeHex = `rgb(${Math.min(255, rgb.r + 110)}, ${Math.min(255, rgb.g + 110)}, ${Math.min(255, rgb.b + 130)})`;
    strokeOp = '0.72';
    fillOp = '0.36';
    altStrokeOp = '0.52';
  } else {
    // For light theme, ensure rich vivid stroke
    strokeOp = '0.68';
    fillOp = '0.32';
    altStrokeOp = '0.48';
  }

  const stroke = strokeHex;
  let svg = '';

  switch (patternId) {
    // ================= Cute 💗 =================
    case 'hearts':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>
        <g fill='${stroke}' fill-opacity='${fillOp}' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.4' stroke-linecap='round'>
          <!-- Primary Sweet Heart -->
          <path d='M16 12 C13 7 6 9 6 15 C6 21 16 27 16 27 C16 27 26 21 26 15 C26 9 19 7 16 12 Z' />
          <!-- Small Floating Heart -->
          <path d='M44 38 C42 34 38 35 38 39 C38 43 44 47 44 47 C44 47 50 43 50 39 C50 35 46 34 44 38 Z' fill-opacity='${altStrokeOp}' />
          <!-- Twinkle sparkles -->
          <circle cx='42' cy='16' r='1.8' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='18' cy='44' r='1.4' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'flowers':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='none' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Flower 1 (Center + Petals) -->
          <circle cx='18' cy='18' r='3.5' fill='${stroke}' fill-opacity='${fillOp}' />
          <path d='M18 10 C15 12 15 15 18 15 C21 15 21 12 18 10 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <path d='M18 26 C15 24 15 21 18 21 C21 21 21 24 18 26 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <path d='M10 18 C12 15 15 15 15 18 C15 21 12 21 10 18 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <path d='M26 18 C24 15 21 15 21 18 C21 21 24 21 26 18 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Mini Flower 2 -->
          <circle cx='50' cy='48' r='2.5' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='50' cy='43' r='2' fill='${stroke}' fill-opacity='${fillOp}' stroke='none' />
          <circle cx='50' cy='53' r='2' fill='${stroke}' fill-opacity='${fillOp}' stroke='none' />
          <circle cx='45' cy='48' r='2' fill='${stroke}' fill-opacity='${fillOp}' stroke='none' />
          <circle cx='55' cy='48' r='2' fill='${stroke}' fill-opacity='${fillOp}' stroke='none' />
          <!-- Organic Leaf -->
          <path d='M36 34 C39 30 44 32 44 36 C40 36 36 37 36 34 Z' fill='${stroke}' fill-opacity='${fillOp}' />
        </g>
      </svg>`;
      break;

    case 'stars':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'>
        <g fill='${stroke}' fill-opacity='${fillOp}' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.2' stroke-linejoin='round'>
          <!-- 4-point sparkle star -->
          <path d='M18 6 Q18 16 8 16 Q18 16 18 26 Q18 16 28 16 Q18 16 18 6 Z' />
          <!-- Mini 4-point star -->
          <path d='M42 32 Q42 38 36 38 Q42 38 42 44 Q42 38 48 38 Q42 38 42 32 Z' fill-opacity='${altStrokeOp}' />
          <!-- Diamond dots -->
          <rect x='38' y='12' width='3.5' height='3.5' transform='rotate(45 39.75 13.75)' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <rect x='12' y='38' width='2.5' height='2.5' transform='rotate(45 13.25 39.25)' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'clouds':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='${stroke}' fill-opacity='${fillOp}' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.3' stroke-linejoin='round'>
          <!-- Fluffy Cloud 1 -->
          <path d='M12 28 A6 6 0 0 1 20 22 A8 8 0 0 1 34 24 A6 6 0 0 1 38 28 A5 5 0 0 1 36 33 L14 33 A5 5 0 0 1 12 28 Z' />
          <!-- Fluffy Cloud 2 -->
          <path d='M40 50 A4 4 0 0 1 46 46 A6 6 0 0 1 56 48 A4 4 0 0 1 58 52 A3 3 0 0 1 56 55 L42 55 A3 3 0 0 1 40 50 Z' fill-opacity='${altStrokeOp}' />
          <!-- Drops/sparkles -->
          <circle cx='24' cy='46' r='1.8' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='50' cy='20' r='1.6' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'bows':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='none' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Center Knot -->
          <circle cx='20' cy='20' r='3' fill='${stroke}' fill-opacity='${strokeOp}' />
          <!-- Left Ribbon Wing -->
          <path d='M20 20 Q12 12 10 18 Q8 24 20 20 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Right Ribbon Wing -->
          <path d='M20 20 Q28 12 30 18 Q32 24 20 20 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Ribbon Tails -->
          <path d='M18 22 Q14 30 12 34' stroke-width='1.3' />
          <path d='M22 22 Q26 30 28 34' stroke-width='1.3' />
          <!-- Sparkle Cross -->
          <path d='M46 12 L46 20 M42 16 L50 16' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <circle cx='48' cy='44' r='2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'sparkles':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
        <g fill='${stroke}' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.2'>
          <!-- Diamond ✦ Star 1 -->
          <path d='M16 6 L18 14 L26 16 L18 18 L16 26 L14 18 L6 16 L14 14 Z' fill-opacity='${fillOp}' />
          <!-- Mini ✧ Star 2 -->
          <path d='M38 28 L39.5 33 L44.5 34.5 L39.5 36 L38 41 L36.5 36 L31.5 34.5 L36.5 33 Z' fill-opacity='${altStrokeOp}' />
          <circle cx='38' cy='14' r='2.2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='14' cy='38' r='1.8' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'dots':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
        <g fill='${stroke}'>
          <circle cx='18' cy='18' r='3.6' fill-opacity='${strokeOp}' />
          <circle cx='0' cy='0' r='2.4' fill-opacity='${altStrokeOp}' />
          <circle cx='36' cy='0' r='2.4' fill-opacity='${altStrokeOp}' />
          <circle cx='0' cy='36' r='2.4' fill-opacity='${altStrokeOp}' />
          <circle cx='36' cy='36' r='2.4' fill-opacity='${altStrokeOp}' />
          <circle cx='18' cy='2' r='1.2' fill-opacity='${fillOp}' />
          <circle cx='2' cy='18' r='1.2' fill-opacity='${fillOp}' />
        </g>
      </svg>`;
      break;

    case 'rainbow':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round'>
          <!-- 3 Arcs of Rainbow -->
          <path d='M12 36 A16 16 0 0 1 44 36' stroke-width='2.2' stroke-opacity='${strokeOp}' />
          <path d='M16 36 A12 12 0 0 1 40 36' stroke-width='2' stroke-opacity='${altStrokeOp}' />
          <path d='M20 36 A8 8 0 0 1 36 36' stroke-width='1.8' stroke-opacity='${fillOp}' />
          <!-- Star sparkle -->
          <circle cx='52' cy='22' r='2.2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='20' cy='52' r='1.8' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'kitty':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='none' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Kitty Head Silhouette -->
          <path d='M12 24 L14 14 L22 18 C26 17 34 17 38 18 L46 14 L48 24 C52 30 50 38 42 42 C38 44 22 44 18 42 C10 38 8 30 12 24 Z' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Eyes -->
          <circle cx='23' cy='28' r='1.6' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='37' cy='28' r='1.6' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <!-- Nose & Whiskers -->
          <path d='M29 32 L31 32' />
          <path d='M17 29 L11 28 M17 33 L10 34' stroke-width='1.1' />
          <path d='M43 29 L49 28 M43 33 L50 34' stroke-width='1.1' />
          <!-- Mini Paw print -->
          <circle cx='48' cy='50' r='2.2' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
          <circle cx='45' cy='45' r='1' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
          <circle cx='48' cy='44' r='1' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
          <circle cx='51' cy='45' r='1' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'cute-doodle':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Doodle Heart -->
          <path d='M18 16 C15 12 10 13 10 17 C10 22 18 26 18 26 C18 26 26 22 26 17 C26 13 21 12 18 16 Z' stroke-width='1.4' stroke-opacity='${strokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Doodle 5-point Star -->
          <path d='M52 14 L53.5 19 L58.5 19 L54.5 22 L56 27 L52 24 L48 27 L49.5 22 L45.5 19 L50.5 19 Z' stroke-width='1.2' stroke-opacity='${strokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Doodle Cloud -->
          <path d='M14 52 A4 4 0 0 1 20 48 A6 6 0 0 1 30 50 A4 4 0 0 1 32 54 L14 54 Z' stroke-width='1.3' stroke-opacity='${altStrokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Sparkle Cross -->
          <path d='M54 48 L54 56 M50 52 L58 52' stroke-width='1.3' stroke-opacity='${strokeOp}' />
          <circle cx='42' cy='36' r='1.6' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    // ================= Cool 🖤 =================
    case 'grid':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'>
        <g stroke='${stroke}' stroke-width='1'>
          <path d='M40 0 L0 0 0 40' fill='none' stroke-opacity='${strokeOp}' />
          <!-- Subtle inner crosshair dots -->
          <circle cx='20' cy='20' r='1.2' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'cyber':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54'>
        <g fill='none' stroke='${stroke}' stroke-width='1.2' stroke-linecap='round'>
          <!-- Cyber tech tracks -->
          <path d='M0 12 L24 12 L36 24 L54 24' stroke-opacity='${strokeOp}' />
          <path d='M0 42 L18 42 L30 30 L54 30' stroke-opacity='${altStrokeOp}' />
          <!-- Tech nodes -->
          <circle cx='24' cy='12' r='2.2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='30' cy='30' r='2.2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='44' cy='24' r='1.5' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'circuit':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round' stroke-linejoin='round'>
          <!-- PCB Tracks -->
          <path d='M10 10 L26 10 L38 22 L38 36' stroke-width='1.4' stroke-opacity='${strokeOp}' />
          <path d='M54 54 L44 54 L32 42 L16 42' stroke-width='1.4' stroke-opacity='${altStrokeOp}' />
          <!-- Solder Pads -->
          <circle cx='10' cy='10' r='3' stroke-width='1.2' stroke-opacity='${strokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <circle cx='38' cy='36' r='2.5' stroke-width='1.2' stroke-opacity='${strokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <circle cx='54' cy='54' r='3' stroke-width='1.2' stroke-opacity='${altStrokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
          <circle cx='16' cy='42' r='2' stroke-width='1.2' stroke-opacity='${altStrokeOp}' fill='${stroke}' fill-opacity='${fillOp}' />
        </g>
      </svg>`;
      break;

    case 'neon-grid':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g stroke='${stroke}' fill='none'>
          <!-- Perspective Grid lines -->
          <path d='M0 30 L60 30' stroke-width='1.5' stroke-opacity='${strokeOp}' />
          <path d='M0 48 L60 48' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <path d='M0 12 L60 12' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <path d='M30 0 L30 60' stroke-width='1.5' stroke-opacity='${strokeOp}' />
          <path d='M12 0 L12 60' stroke-width='1' stroke-opacity='${fillOp}' />
          <path d='M48 0 L48 60' stroke-width='1' stroke-opacity='${fillOp}' />
          <!-- Intersection glow -->
          <circle cx='30' cy='30' r='2.5' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'geometry':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>
        <g fill='none' stroke='${stroke}' stroke-opacity='${strokeOp}' stroke-width='1.3'>
          <!-- Triangle -->
          <polygon points='28,8 46,40 10,40' fill='${stroke}' fill-opacity='${fillOp}' />
          <!-- Concentric Ring -->
          <circle cx='28' cy='28' r='7' stroke-opacity='${altStrokeOp}' />
          <!-- Diamond -->
          <polygon points='28,2 34,8 28,14 22,8' stroke-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'diagonal':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
        <g stroke='${stroke}' stroke-linecap='square'>
          <line x1='0' y1='32' x2='32' y2='0' stroke-width='1.5' stroke-opacity='${strokeOp}' />
          <line x1='0' y1='0' x2='0' y2='0' stroke-width='1' stroke-opacity='${altStrokeOp}' />
          <line x1='32' y1='32' x2='32' y2='32' stroke-width='1' stroke-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'waves':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48' viewBox='0 0 64 48'>
        <g fill='none' stroke='${stroke}' stroke-width='1.4' stroke-linecap='round'>
          <path d='M0 16 C16 6 16 26 32 16 C48 6 48 26 64 16' stroke-opacity='${strokeOp}' />
          <path d='M0 36 C16 26 16 46 32 36 C48 26 48 46 64 36' stroke-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'dark-stars':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='${stroke}'>
          <!-- Constellation Twinkles -->
          <polygon points='20,10 22,18 30,20 22,22 20,30 18,22 10,20 18,18' fill-opacity='${strokeOp}' />
          <polygon points='46,38 47.5,43 52.5,44.5 47.5,46 46,51 44.5,46 39.5,44.5 44.5,43' fill-opacity='${altStrokeOp}' />
          <circle cx='46' cy='14' r='2' fill-opacity='${strokeOp}' />
          <circle cx='14' cy='46' r='1.6' fill-opacity='${fillOp}' />
          <line x1='20' y1='20' x2='46' y2='14' stroke='${stroke}' stroke-width='0.8' stroke-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'matrix':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
        <g fill='${stroke}'>
          <!-- Digital Pixel Glyphs -->
          <rect x='10' y='6' width='3' height='8' rx='1' fill-opacity='${strokeOp}' />
          <rect x='10' y='18' width='3' height='4' rx='1' fill-opacity='${altStrokeOp}' />
          <rect x='24' y='14' width='3' height='12' rx='1' fill-opacity='${strokeOp}' />
          <rect x='24' y='30' width='3' height='6' rx='1' fill-opacity='${fillOp}' />
          <rect x='38' y='8' width='3' height='5' rx='1' fill-opacity='${altStrokeOp}' />
          <rect x='38' y='20' width='3' height='10' rx='1' fill-opacity='${strokeOp}' />
          <!-- Code square -->
          <rect x='10' y='36' width='4' height='4' fill-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'tech-dots':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g stroke='${stroke}' fill='none'>
          <!-- Connecting Nodes -->
          <line x1='16' y1='16' x2='48' y2='24' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <line x1='16' y1='16' x2='28' y2='48' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <line x1='48' y1='24' x2='40' y2='52' stroke-width='1.2' stroke-opacity='${fillOp}' />
          <!-- Dots with rings -->
          <circle cx='16' cy='16' r='3.5' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='48' cy='24' r='3' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='28' cy='48' r='2.5' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
          <circle cx='40' cy='52' r='2' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    // ================= Aesthetic ✨ =================
    case 'minimal':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
        <g fill='none' stroke='${stroke}' stroke-opacity='${strokeOp}'>
          <!-- Subtle Plus Signs -->
          <path d='M18 15 L18 21 M15 18 L21 18' stroke-width='1.2' />
          <circle cx='36' cy='0' r='1.4' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
          <circle cx='0' cy='36' r='1.4' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'soft-waves':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48' viewBox='0 0 64 48'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round'>
          <path d='M0 24 Q16 12 32 24 T64 24' stroke-width='1.5' stroke-opacity='${strokeOp}' />
          <path d='M0 40 Q16 28 32 40 T64 40' stroke-width='1.2' stroke-opacity='${altStrokeOp}' />
          <path d='M0 8 Q16 -4 32 8 T64 8' stroke-width='1.2' stroke-opacity='${fillOp}' />
        </g>
      </svg>`;
      break;

    case 'paper':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
        <g stroke='${stroke}'>
          <rect width='32' height='32' fill='none' stroke-width='0.9' stroke-opacity='${altStrokeOp}' />
          <!-- Notebook ruled micro dash -->
          <line x1='0' y1='16' x2='32' y2='16' stroke-width='0.6' stroke-dasharray='2,2' stroke-opacity='${fillOp}' />
        </g>
      </svg>`;
      break;

    case 'aurora':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round'>
          <!-- Fluid Aurora Ribbons -->
          <path d='M-10 24 C18 8 36 44 82 20' stroke-width='2.5' stroke-opacity='${strokeOp}' />
          <path d='M-10 40 C22 26 42 56 82 36' stroke-width='2' stroke-opacity='${altStrokeOp}' />
          <!-- Glow star -->
          <circle cx='36' cy='18' r='2' fill='${stroke}' fill-opacity='${strokeOp}' stroke='none' />
          <circle cx='60' cy='52' r='1.5' fill='${stroke}' fill-opacity='${altStrokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'glass-shine':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='${stroke}' stroke='${stroke}'>
          <!-- Glass Diamond Facet -->
          <polygon points='24,8 34,18 24,28 14,18' stroke-width='1.2' stroke-opacity='${strokeOp}' fill-opacity='${fillOp}' />
          <!-- Reflective Glint -->
          <path d='M44 36 L46 44 L54 46 L46 48 L44 56 L42 48 L34 46 L42 44 Z' stroke-width='1' stroke-opacity='${strokeOp}' fill-opacity='${altStrokeOp}' />
          <!-- Light ray -->
          <line x1='10' y1='54' x2='22' y2='42' stroke-width='1.4' stroke-opacity='${altStrokeOp}' stroke-linecap='round' />
          <circle cx='50' cy='16' r='1.8' fill-opacity='${strokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'moon-stars':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='${stroke}' stroke='${stroke}' stroke-linejoin='round'>
          <!-- Crescent Moon -->
          <path d='M14 10 A12 12 0 1 0 26 22 A9 9 0 0 1 14 10 Z' stroke-width='1.3' stroke-opacity='${strokeOp}' fill-opacity='${fillOp}' />
          <!-- Twinkle Star 1 -->
          <path d='M44 14 Q44 20 38 20 Q44 20 44 26 Q44 20 50 20 Q44 20 44 14 Z' stroke-width='1.1' stroke-opacity='${strokeOp}' fill-opacity='${altStrokeOp}' />
          <!-- Twinkle Star 2 -->
          <path d='M30 42 Q30 46 26 46 Q30 46 30 50 Q30 46 34 46 Q30 46 30 42 Z' stroke-width='1' stroke-opacity='${altStrokeOp}' fill-opacity='${fillOp}' />
          <circle cx='48' cy='46' r='1.8' fill-opacity='${strokeOp}' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'night-sky':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='${stroke}'>
          <!-- Shooting Star -->
          <path d='M12 14 L28 10' stroke='${stroke}' stroke-width='1.6' stroke-opacity='${strokeOp}' stroke-linecap='round' />
          <circle cx='28' cy='10' r='2.2' fill-opacity='${strokeOp}' />
          <!-- Star Cluster -->
          <polygon points='46,32 48,36 52,36 49,39 50,43 46,41 42,43 43,39 40,36 44,36' fill-opacity='${altStrokeOp}' />
          <circle cx='18' cy='46' r='1.8' fill-opacity='${strokeOp}' />
          <circle cx='38' cy='22' r='1.2' fill-opacity='${fillOp}' />
          <circle cx='54' cy='52' r='1.4' fill-opacity='${altStrokeOp}' />
        </g>
      </svg>`;
      break;

    case 'ocean':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='48' viewBox='0 0 60 48'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round'>
          <!-- Ocean Surface Waves -->
          <path d='M0 18 C10 12 20 24 30 18 C40 12 50 24 60 18' stroke-width='1.5' stroke-opacity='${strokeOp}' />
          <path d='M0 36 C10 30 20 42 30 36 C40 30 50 42 60 36' stroke-width='1.3' stroke-opacity='${altStrokeOp}' />
          <!-- Sea Bubbles -->
          <circle cx='16' cy='28' r='1.8' stroke-width='1.1' stroke-opacity='${strokeOp}' />
          <circle cx='46' cy='26' r='2.4' stroke-width='1.1' stroke-opacity='${strokeOp}' />
        </g>
      </svg>`;
      break;

    default:
      return 'none';
  }

  const cleanSvg = svg.replace(/\s+/g, ' ').trim();
  return `url("data:image/svg+xml,${encodeURIComponent(cleanSvg)}")`;
}
