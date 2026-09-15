export type ThemePatternId =
  | 'none'
  | 'gradient'
  | 'flowers'
  | 'hearts'
  | 'stars'
  | 'clouds'
  | 'ribbons'
  | 'leaves'
  | 'moon-stars'
  | 'polka'
  | 'sparkles'
  | 'rainbow'
  | 'doodle';

export interface ThemePatternOption {
  id: ThemePatternId;
  name: string;
  emoji: string;
  desc: string;
}

export const THEME_PATTERNS: ThemePatternOption[] = [
  { id: 'flowers', name: 'ลายดอกไม้', emoji: '🌷', desc: 'ดอกซากุระและดอกไม้น่ารัก' },
  { id: 'hearts', name: 'ลายหัวใจ', emoji: '♡', desc: 'หัวใจฟุ้งฟริ้งอบอุ่น' },
  { id: 'stars', name: 'ลายดวงดาว', emoji: '✦', desc: 'ดาวเปล่งประกายระยิบระยับ' },
  { id: 'clouds', name: 'ลายก้อนเมฆ', emoji: '☁', desc: 'ปุยเมฆนุ่มละมุนตา' },
  { id: 'ribbons', name: 'ลายโบว์ริบบิ้น', emoji: '🎀', desc: 'โบว์หวานน่ารักสไตล์วัยรุ่น' },
  { id: 'leaves', name: 'ลายใบโคลเวอร์', emoji: '🍀', desc: 'ใบไม้และใบโคลเวอร์นำโชค' },
  { id: 'moon-stars', name: 'พระจันทร์ & ดาว', emoji: '🌙', desc: 'จันทร์เสี้ยวและหมู่ดาว' },
  { id: 'sparkles', name: 'ประกายวิบวับ', emoji: '✨', desc: 'ประกายเพชรและแสงวิบวับ' },
  { id: 'polka', name: 'ลายจุด Polka Dot', emoji: '○', desc: 'จุดกลมนุ่มนวลคลาสสิก' },
  { id: 'rainbow', name: 'ลายสายรุ้ง', emoji: '🌈', desc: 'สายรุ้งสดใสพาสเทล' },
  { id: 'doodle', name: 'ลายดูเดิลรวม', emoji: '🎨', desc: 'หัวใจ ดาว ดอกไม้คละลาย' },
  { id: 'gradient', name: 'สีพื้น + Gradient', emoji: '🫧', desc: 'ไล่เฉดสีนุ่มนวลแบบไม่มีลาย' },
  { id: 'none', name: 'ไม่มีลาย (เรียบหรู)', emoji: '✨', desc: 'กลาสคลีนมินิมอล' },
];

/**
 * Generate an SVG background pattern data-uri tinted with given color
 */
export function getPatternSvgDataUri(patternId: ThemePatternId, strokeColorHex: string = '#db2777'): string {
  if (patternId === 'none' || patternId === 'gradient') {
    return 'none';
  }

  // We use clean SVG strings and encodeURIComponent
  const stroke = encodeURIComponent(strokeColorHex);
  let svg = '';

  switch (patternId) {
    case 'flowers':
      // 5-petal flower + mini flower
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='none' stroke='${stroke}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Flower 1 -->
          <circle cx='18' cy='18' r='3' fill='${stroke}' fill-opacity='0.25' />
          <path d='M18 10 C15 12 15 15 18 15 C21 15 21 12 18 10 Z' fill='${stroke}' fill-opacity='0.15' />
          <path d='M18 26 C15 24 15 21 18 21 C21 21 21 24 18 26 Z' fill='${stroke}' fill-opacity='0.15' />
          <path d='M10 18 C12 15 15 15 15 18 C15 21 12 21 10 18 Z' fill='${stroke}' fill-opacity='0.15' />
          <path d='M26 18 C24 15 21 15 21 18 C21 21 24 21 26 18 Z' fill='${stroke}' fill-opacity='0.15' />
          <!-- Mini Flower 2 -->
          <circle cx='50' cy='48' r='2' fill='${stroke}' />
          <circle cx='50' cy='43' r='2' fill='${stroke}' fill-opacity='0.2' />
          <circle cx='50' cy='53' r='2' fill='${stroke}' fill-opacity='0.2' />
          <circle cx='45' cy='48' r='2' fill='${stroke}' fill-opacity='0.2' />
          <circle cx='55' cy='48' r='2' fill='${stroke}' fill-opacity='0.2' />
          <!-- Leaf -->
          <path d='M36 34 C39 30 44 32 44 36 C40 36 36 37 36 34 Z' fill='${stroke}' fill-opacity='0.2' />
        </g>
      </svg>`;
      break;

    case 'hearts':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>
        <g fill='${stroke}' fill-opacity='0.22' stroke='${stroke}' stroke-width='1.2' stroke-linecap='round'>
          <!-- Big Heart -->
          <path d='M16 12 C13 7 6 9 6 15 C6 21 16 27 16 27 C16 27 26 21 26 15 C26 9 19 7 16 12 Z' />
          <!-- Small Heart -->
          <path d='M44 38 C42 34 38 35 38 39 C38 43 44 47 44 47 C44 47 50 43 50 39 C50 35 46 34 44 38 Z' fill-opacity='0.15' />
          <!-- Sparkle dot -->
          <circle cx='42' cy='16' r='1.5' fill='${stroke}' fill-opacity='0.3' />
          <circle cx='18' cy='44' r='1' fill='${stroke}' fill-opacity='0.25' />
        </g>
      </svg>`;
      break;

    case 'stars':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'>
        <g fill='${stroke}' fill-opacity='0.22' stroke='${stroke}' stroke-width='1' stroke-linejoin='round'>
          <!-- 4-point sparkle star -->
          <path d='M18 6 Q18 16 8 16 Q18 16 18 26 Q18 16 28 16 Q18 16 18 6 Z' />
          <!-- Small 4-point star -->
          <path d='M42 32 Q42 38 36 38 Q42 38 42 44 Q42 38 48 38 Q42 38 42 32 Z' fill-opacity='0.18' />
          <!-- Diamond dots -->
          <rect x='38' y='12' width='3' height='3' transform='rotate(45 39.5 13.5)' fill='${stroke}' fill-opacity='0.3' />
          <rect x='12' y='38' width='2.5' height='2.5' transform='rotate(45 13.25 39.25)' fill='${stroke}' fill-opacity='0.25' />
        </g>
      </svg>`;
      break;

    case 'clouds':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='${stroke}' fill-opacity='0.16' stroke='${stroke}' stroke-width='1.2' stroke-linejoin='round'>
          <!-- Fluffy Cloud 1 -->
          <path d='M12 28 A6 6 0 0 1 20 22 A8 8 0 0 1 34 24 A6 6 0 0 1 38 28 A5 5 0 0 1 36 33 L14 33 A5 5 0 0 1 12 28 Z' />
          <!-- Fluffy Cloud 2 -->
          <path d='M40 50 A4 4 0 0 1 46 46 A6 6 0 0 1 56 48 A4 4 0 0 1 58 52 A3 3 0 0 1 56 55 L42 55 A3 3 0 0 1 40 50 Z' fill-opacity='0.12' />
          <!-- Drops/sparkles -->
          <circle cx='24' cy='46' r='1.5' fill='${stroke}' fill-opacity='0.25' />
          <circle cx='50' cy='20' r='1.5' fill='${stroke}' fill-opacity='0.2' />
        </g>
      </svg>`;
      break;

    case 'ribbons':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='none' stroke='${stroke}' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Bow Ribbon -->
          <circle cx='20' cy='20' r='2.5' fill='${stroke}' fill-opacity='0.3' />
          <path d='M20 20 Q12 12 10 18 Q8 24 20 20 Z' fill='${stroke}' fill-opacity='0.16' />
          <path d='M20 20 Q28 12 30 18 Q32 24 20 20 Z' fill='${stroke}' fill-opacity='0.16' />
          <path d='M18 22 Q14 30 12 34' />
          <path d='M22 22 Q26 30 28 34' />
          <!-- Mini sparkle -->
          <circle cx='48' cy='44' r='1.5' fill='${stroke}' fill-opacity='0.25' />
          <path d='M44 16 L48 16 M46 14 L46 18' stroke-width='1' />
        </g>
      </svg>`;
      break;

    case 'leaves':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>
        <g fill='${stroke}' fill-opacity='0.18' stroke='${stroke}' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'>
          <!-- 4-leaf clover -->
          <path d='M18 18 C14 12 8 16 13 20 C8 24 14 28 18 22 C22 28 28 24 23 20 C28 16 22 12 18 18 Z' />
          <path d='M18 22 Q20 28 24 30' fill='none' stroke-width='1.2' />
          <!-- Mini sprout -->
          <path d='M42 42 C40 38 44 36 46 38 C48 36 52 38 50 42 C48 46 44 46 42 42 Z' fill-opacity='0.14' />
          <path d='M46 42 L46 48' fill='none' />
        </g>
      </svg>`;
      break;

    case 'moon-stars':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>
        <g fill='${stroke}' fill-opacity='0.2' stroke='${stroke}' stroke-width='1.2' stroke-linejoin='round'>
          <!-- Crescent Moon -->
          <path d='M14 10 A12 12 0 1 0 26 22 A9 9 0 0 1 14 10 Z' />
          <!-- Twinkle Star 1 -->
          <path d='M44 14 Q44 20 38 20 Q44 20 44 26 Q44 20 50 20 Q44 20 44 14 Z' fill-opacity='0.22' />
          <!-- Twinkle Star 2 -->
          <path d='M30 42 Q30 46 26 46 Q30 46 30 50 Q30 46 34 46 Q30 46 30 42 Z' fill-opacity='0.16' />
          <circle cx='48' cy='46' r='1.5' fill='${stroke}' fill-opacity='0.25' />
        </g>
      </svg>`;
      break;

    case 'polka':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
        <g fill='${stroke}'>
          <circle cx='18' cy='18' r='3' fill-opacity='0.22' />
          <circle cx='0' cy='0' r='2' fill-opacity='0.16' />
          <circle cx='36' cy='0' r='2' fill-opacity='0.16' />
          <circle cx='0' cy='36' r='2' fill-opacity='0.16' />
          <circle cx='36' cy='36' r='2' fill-opacity='0.16' />
        </g>
      </svg>`;
      break;

    case 'sparkles':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
        <g fill='${stroke}' stroke='${stroke}' stroke-width='1'>
          <path d='M16 6 L18 14 L26 16 L18 18 L16 26 L14 18 L6 16 L14 14 Z' fill-opacity='0.25' />
          <path d='M38 28 L39.5 33 L44.5 34.5 L39.5 36 L38 41 L36.5 36 L31.5 34.5 L36.5 33 Z' fill-opacity='0.20' />
          <circle cx='38' cy='14' r='2' fill='${stroke}' fill-opacity='0.25' stroke='none' />
          <circle cx='14' cy='38' r='1.5' fill='${stroke}' fill-opacity='0.2' stroke='none' />
        </g>
      </svg>`;
      break;

    case 'rainbow':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round'>
          <!-- Rainbow arch -->
          <path d='M12 36 A16 16 0 0 1 44 36' stroke-width='2' stroke-opacity='0.24' />
          <path d='M16 36 A12 12 0 0 1 40 36' stroke-width='2' stroke-opacity='0.18' />
          <path d='M20 36 A8 8 0 0 1 36 36' stroke-width='2' stroke-opacity='0.14' />
          <!-- Star sparkle -->
          <circle cx='52' cy='22' r='2' fill='${stroke}' fill-opacity='0.25' />
          <circle cx='20' cy='52' r='1.5' fill='${stroke}' fill-opacity='0.2' />
        </g>
      </svg>`;
      break;

    case 'doodle':
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
        <g fill='none' stroke='${stroke}' stroke-linecap='round' stroke-linejoin='round'>
          <!-- Heart -->
          <path d='M18 16 C15 12 10 13 10 17 C10 22 18 26 18 26 C18 26 26 22 26 17 C26 13 21 12 18 16 Z' stroke-width='1.2' fill='${stroke}' fill-opacity='0.16' />
          <!-- Star -->
          <path d='M52 14 L53 19 L58 19 L54 22 L55.5 27 L52 24 L48.5 27 L50 22 L46 19 L51 19 Z' stroke-width='1' fill='${stroke}' fill-opacity='0.2' />
          <!-- Smile -->
          <circle cx='22' cy='52' r='8' stroke-width='1.2' fill='${stroke}' fill-opacity='0.08' />
          <circle cx='19' cy='50' r='1' fill='${stroke}' />
          <circle cx='25' cy='50' r='1' fill='${stroke}' />
          <path d='M19 54 Q22 57 25 54' stroke-width='1.2' />
          <!-- Sparkle -->
          <path d='M54 48 L54 56 M50 52 L58 52' stroke-width='1.2' />
        </g>
      </svg>`;
      break;

    default:
      return 'none';
  }

  const cleanSvg = svg.replace(/\s+/g, ' ').trim();
  return `url("data:image/svg+xml,${encodeURIComponent(cleanSvg)}")`;
}
