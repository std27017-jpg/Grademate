import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Copy,
  CheckCheck,
  Eye,
  Pipette,
  Grid,
  Layers,
  Dices,
  Shuffle,
  Heart,
  Shield,
  Compass,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';
import {
  PRESET_THEME_COLORS,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_PATTERN,
  hexToRgb,
  rgbToHex,
  hslToRgb,
  rgbToHsl,
  getThemeBackgroundPalette,
} from '../utils/themeUtils';
import { THEME_PATTERNS, ThemePatternId, getPatternSvgDataUri } from '../utils/themePatterns';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PatternCategoryFilter = 'all' | 'cute' | 'cool' | 'aesthetic' | 'clean';

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const {
    themeColor,
    themePattern,
    setThemeColor,
    setThemePattern,
    resetThemeColor,
    randomTheme,
    randomPattern,
  } = useTheme();

  // Working state inside modal
  const [activeColor, setActiveColor] = useState(themeColor);
  const [activePattern, setActivePattern] = useState<ThemePatternId>(themePattern);
  const [hexInput, setHexInput] = useState(themeColor);
  const [isValidHex, setIsValidHex] = useState(true);
  const [activeTab, setActiveTab] = useState<'gallery' | 'wheel' | 'presets'>('gallery');
  const [patternCategory, setPatternCategory] = useState<PatternCategoryFilter>('all');
  const [copied, setCopied] = useState(false);
  const [lightness, setLightness] = useState(50);

  // Wheel canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  // Sync with current themeColor and themePattern when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveColor(themeColor);
      setActivePattern(themePattern);
      setHexInput(themeColor);
      setIsValidHex(true);

      const rgb = hexToRgb(themeColor);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setLightness(hsl.l);
      }
    }
  }, [isOpen, themeColor, themePattern]);

  // Color wheel drawing
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 4;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const index = (y * width + x) * 4;

        if (dist <= radius) {
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (angle < 0) angle += 360;

          const sat = (dist / radius) * 100;
          const rgb = hslToRgb(angle, sat, lightness);

          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 255;
        } else {
          data[index + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Indicator pointer
    const currentRgb = hexToRgb(activeColor);
    if (currentRgb) {
      const hsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);
      const angleRad = (hsl.h * Math.PI) / 180;
      const dist = (hsl.s / 100) * radius;
      const pointerX = centerX + dist * Math.cos(angleRad);
      const pointerY = centerY + dist * Math.sin(angleRad);

      ctx.beginPath();
      ctx.arc(pointerX, pointerY, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pointerX, pointerY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'wheel') {
      const timer = setTimeout(() => {
        drawWheel();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, lightness, activeColor]);

  // Color wheel interaction
  const handleWheelInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 4;

    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const sat = Math.min(100, Math.max(0, (dist / radius) * 100));
    const rgb = hslToRgb(angle, sat, lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    setActiveColor(hex);
    setHexInput(hex);
    setIsValidHex(true);
    setThemeColor(hex);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    handleWheelInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      handleWheelInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    if (e.touches[0]) {
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && e.touches[0]) {
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Custom Hex Input
  const handleHexInputChange = (value: string) => {
    let clean = value.trim();
    if (!clean.startsWith('#')) {
      clean = '#' + clean;
    }
    setHexInput(clean);

    const rgb = hexToRgb(clean);
    if (rgb) {
      setIsValidHex(true);
      setActiveColor(clean);
      setThemeColor(clean);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLightness(hsl.l);
    } else {
      setIsValidHex(false);
    }
  };

  // Native color pick
  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActiveColor(val);
    setHexInput(val);
    setIsValidHex(true);
    setThemeColor(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLightness(hsl.l);
    }
  };

  // Choose preset
  const handleSelectPreset = (hex: string) => {
    setActiveColor(hex);
    setHexInput(hex);
    setIsValidHex(true);
    setThemeColor(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLightness(hsl.l);
    }
  };

  // Choose pattern
  const handleSelectPattern = (patternId: ThemePatternId) => {
    setActivePattern(patternId);
    setThemePattern(patternId);
  };

  // Random theme (Color + Pattern)
  const handleRandomTheme = () => {
    const res = randomTheme();
    setActiveColor(res.color);
    setActivePattern(res.pattern);
    setHexInput(res.color);
    setIsValidHex(true);
    const rgb = hexToRgb(res.color);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLightness(hsl.l);
    }
  };

  // Random pattern only
  const handleRandomPattern = () => {
    const newPat = randomPattern();
    setActivePattern(newPat);
  };

  // Copy hex
  const handleCopyHex = () => {
    navigator.clipboard.writeText(activeColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply & Close
  const handleApply = () => {
    setThemeColor(activeColor);
    setThemePattern(activePattern);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }
    onClose();
  };

  // Reset
  const handleReset = () => {
    resetThemeColor();
    setActiveColor(DEFAULT_THEME_COLOR);
    setActivePattern(DEFAULT_THEME_PATTERN);
    setHexInput(DEFAULT_THEME_COLOR);
    setIsValidHex(true);
    setLightness(50);
  };

  if (!isOpen) return null;

  const currentRgb = hexToRgb(activeColor) || { r: 219, g: 39, b: 119 };
  const currentHsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);
  const palette = getThemeBackgroundPalette(currentRgb);

  // Filter patterns
  const filteredPatterns = THEME_PATTERNS.filter((pattern) => {
    if (patternCategory === 'all') return true;
    return pattern.category === patternCategory;
  });

  const activePatternObj = THEME_PATTERNS.find((p) => p.id === activePattern) || THEME_PATTERNS[0];

  return (
    <div
      id="theme-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      <div
        id="theme-modal-container"
        className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] box-border relative shadow-2xl border"
        style={{
          background: palette.isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: `0 20px 50px -10px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${palette.isDark ? '0.35' : '0.25'})`,
          color: palette.isDark ? '#f8fafc' : '#0f172a',
        }}
      >
        {/* Header with Liquid Glass aesthetic */}
        <div
          className="px-4 sm:px-6 py-3.5 border-b flex items-center justify-between backdrop-blur-md shrink-0"
          style={{
            borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)',
            backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300 shrink-0"
              style={{
                backgroundColor: activeColor,
                boxShadow: `0 4px 14px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.4)`,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 truncate">
                <span>Theme & Pattern Studio</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs shrink-0"
                  style={{ backgroundColor: activeColor }}
                >
                  28 ลวดลาย
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs opacity-75 font-medium truncate">
                ปรับแต่งทั้งสีธีม, ความสว่าง, และลวดลายพื้นหลัง Liquid Glass เต็มรูปแบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Random Theme button in header */}
            <button
              id="theme-quick-random-btn"
              type="button"
              onClick={handleRandomTheme}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
              style={{
                borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.8)',
                backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}
              title="สุ่มทั้งสีและลวดลายทันที"
            >
              <Dices className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">สุ่มธีม</span>
            </button>

            <button
              id="theme-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Main Tabs: Gallery (Patterns) | Wheel | Presets */}
        <div
          className="px-3 sm:px-6 pt-2.5 pb-2 border-b flex items-center gap-1.5 sm:gap-2 shrink-0"
          style={{
            borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
            backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <button
            id="theme-tab-patterns"
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2 px-2 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/60 dark:border-white/10'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="truncate">แกลเลอรีลวดลาย ({THEME_PATTERNS.length})</span>
          </button>

          <button
            id="theme-tab-wheel"
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 py-2 px-2 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wheel'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/60 dark:border-white/10'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span className="truncate">วงล้อสี & HEX</span>
          </button>

          <button
            id="theme-tab-presets"
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-2 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/60 dark:border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="truncate">ชุดสียอดนิยม ({PRESET_THEME_COLORS.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* TAB 1: Pattern Gallery */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Category Filter Pills & Random Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    id="filter-cat-all"
                    type="button"
                    onClick={() => setPatternCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      patternCategory === 'all'
                        ? 'text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80'
                    }`}
                    style={{
                      backgroundColor: patternCategory === 'all' ? activeColor : undefined,
                    }}
                  >
                    ทั้งหมด ({THEME_PATTERNS.length})
                  </button>

                  <button
                    id="filter-cat-cute"
                    type="button"
                    onClick={() => setPatternCategory('cute')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      patternCategory === 'cute'
                        ? 'text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80'
                    }`}
                    style={{
                      backgroundColor: patternCategory === 'cute' ? activeColor : undefined,
                    }}
                  >
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span>Cute น่ารัก (10)</span>
                  </button>

                  <button
                    id="filter-cat-cool"
                    type="button"
                    onClick={() => setPatternCategory('cool')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      patternCategory === 'cool'
                        ? 'text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80'
                    }`}
                    style={{
                      backgroundColor: patternCategory === 'cool' ? activeColor : undefined,
                    }}
                  >
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span>Cool เท่ / Dark (10)</span>
                  </button>

                  <button
                    id="filter-cat-aesthetic"
                    type="button"
                    onClick={() => setPatternCategory('aesthetic')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      patternCategory === 'aesthetic'
                        ? 'text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80'
                    }`}
                    style={{
                      backgroundColor: patternCategory === 'aesthetic' ? activeColor : undefined,
                    }}
                  >
                    <Sparkle className="w-3 h-3 text-amber-400" />
                    <span>Aesthetic มินิมอล (8)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-random-pattern"
                    type="button"
                    onClick={handleRandomPattern}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                    style={{
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                    title="สุ่มเปลี่ยนเฉพาะลวดลาย โดยใช้สีธีมเดิม"
                  >
                    <Shuffle className="w-3 h-3 text-indigo-500" />
                    <span>สุ่มเฉพาะลาย</span>
                  </button>

                  <button
                    id="btn-random-all"
                    type="button"
                    onClick={handleRandomTheme}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                    style={{
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                    title="สุ่มทั้งสีและลวดลาย"
                  >
                    <Dices className="w-3 h-3 text-pink-500" />
                    <span>สุ่มธีมทั้งชุด</span>
                  </button>
                </div>
              </div>

              {/* Grid of Patterns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {filteredPatterns.map((pattern) => {
                  const isSelected = activePattern === pattern.id;
                  const patternPreviewUri = getPatternSvgDataUri(pattern.id, activeColor);

                  return (
                    <button
                      id={`pattern-card-${pattern.id}`}
                      key={pattern.id}
                      type="button"
                      onClick={() => handleSelectPattern(pattern.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all duration-200 cursor-pointer min-h-[110px] group ${
                        isSelected
                          ? 'border-2 shadow-lg scale-[1.02]'
                          : 'hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{
                        backgroundColor: palette.isDark
                          ? isSelected
                            ? 'rgba(30, 41, 59, 0.95)'
                            : 'rgba(30, 41, 59, 0.6)'
                          : isSelected
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.65)',
                        borderColor: isSelected
                          ? activeColor
                          : palette.isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(255, 255, 255, 0.7)',
                        boxShadow: isSelected
                          ? `0 10px 25px -5px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${palette.isDark ? '0.45' : '0.3'})`
                          : undefined,
                      }}
                    >
                      {/* Realistic Live SVG Pattern texture preview inside card */}
                      {pattern.id !== 'none' && pattern.id !== 'gradient' && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                          style={{
                            backgroundImage: patternPreviewUri,
                            backgroundRepeat: 'repeat',
                            backgroundSize: pattern.tileSize || '40px 40px',
                            opacity: isSelected ? 0.35 : 0.2,
                          }}
                        />
                      )}

                      {/* Header in card: Emoji & Selection check */}
                      <div className="flex items-center justify-between w-full relative z-10">
                        <span className="text-2xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                          {pattern.emoji}
                        </span>
                        {isSelected ? (
                          <div
                            className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: activeColor }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase opacity-60"
                            style={{
                              backgroundColor: palette.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                            }}
                          >
                            {pattern.category}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div className="relative z-10 mt-2">
                        <h5 className="font-extrabold text-xs truncate">
                          {pattern.name}
                        </h5>
                        <p className="text-[10px] opacity-70 font-medium truncate mt-0.5">
                          {pattern.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Color Wheel */}
          {activeTab === 'wheel' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Canvas Color Wheel */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="p-2 rounded-full border shadow-md backdrop-blur-md"
                    style={{
                      backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <canvas
                      id="theme-color-wheel-canvas"
                      ref={canvasRef}
                      width={210}
                      height={210}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      className="cursor-crosshair rounded-full touch-none block"
                      title="คลิกหรือลากบนวงล้อสีเพื่อเลือกเฉดสีที่ต้องการ"
                    />
                  </div>
                  <span className="text-[11px] opacity-75 mt-2 font-semibold text-center">
                    คลิกหรือลากบนวงล้อเพื่อเลือกเฉดสี
                  </span>
                </div>

                {/* Color Information & Native Picker */}
                <div className="flex-1 w-full max-w-xs space-y-4">
                  {/* Big Color Preview Box */}
                  <div
                    className="p-4 rounded-3xl border shadow-xs backdrop-blur-md space-y-3"
                    style={{
                      backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl shadow-md border-2 border-white flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: activeColor }}
                      >
                        <Check className="w-6 h-6 drop-shadow" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] opacity-70 font-bold block">
                          สีที่เลือกปัจจุบัน
                        </span>
                        <span className="font-mono font-black text-lg uppercase block truncate">
                          {activeColor}
                        </span>
                        <span className="text-[11px] opacity-75 font-semibold block truncate">
                          RGB({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                        </span>
                      </div>
                    </div>

                    {/* Native Pipette / HTML5 Color Input button */}
                    <label
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border rounded-2xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      style={{
                        backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <input
                        type="color"
                        value={activeColor}
                        onChange={handleNativeColorPick}
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                      />
                      <span>ใช้ตัวดูดสี / กล่องเลือกสีระบบ</span>
                    </label>
                  </div>

                  {/* Lightness Slider */}
                  <div
                    className="space-y-1.5 p-3 rounded-2xl border"
                    style={{
                      backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 opacity-60" />
                        <span>ความสว่าง (Lightness):</span>
                      </span>
                      <span className="font-mono">{lightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={80}
                      value={lightness}
                      onChange={(e) => {
                        const newL = parseInt(e.target.value, 10);
                        setLightness(newL);
                        const newRgb = hslToRgb(currentHsl.h, currentHsl.s, newL);
                        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                        setActiveColor(newHex);
                        setHexInput(newHex);
                        setThemeColor(newHex);
                      }}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Hex Code Input Section */}
              <div
                className="p-4 rounded-3xl border space-y-2 backdrop-blur-md"
                style={{
                  backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <label className="text-xs font-bold flex items-center justify-between">
                  <span>ใส่โค้ดสีตามต้องการ (HEX Code):</span>
                  <span
                    className={`text-[11px] font-bold ${
                      isValidHex ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {isValidHex ? '✓ โค้ดสีถูกต้อง' : '⚠️ รูปแบบ Hex ไม่ถูกต้อง (เช่น #DB2777)'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#DB2777"
                      className={`w-full pl-3 pr-9 py-2 rounded-2xl text-sm font-mono font-bold bg-white/90 dark:bg-slate-900/90 border ${
                        isValidHex
                          ? 'border-slate-300 dark:border-slate-700 focus:border-pink-500'
                          : 'border-rose-400 focus:border-rose-500 text-rose-500'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
                    />
                    <div
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs"
                      style={{ backgroundColor: isValidHex ? activeColor : 'transparent' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="px-3.5 py-2 border rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    style={{
                      backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                    title="คัดลอกโค้ดสี"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">
                    ชุดสีสำเร็จรูปยอดนิยม ({PRESET_THEME_COLORS.length} โทนสี)
                  </h4>
                  <p className="text-[11px] opacity-75">
                    ผ่านการทดสอบคอนทราสต์และความคมชัดมาตรฐาน Liquid Glass
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_THEME_COLORS.map((preset) => {
                  const isSelected = activeColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      id={`preset-color-${preset.id}`}
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.hex)}
                      className={`p-3.5 rounded-3xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 shadow-lg scale-[1.02]'
                          : 'hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{
                        backgroundColor: palette.isDark
                          ? isSelected
                            ? 'rgba(30, 41, 59, 0.95)'
                            : 'rgba(30, 41, 59, 0.6)'
                          : isSelected
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.7)',
                        borderColor: isSelected
                          ? activeColor
                          : palette.isDark
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 font-bold text-base relative"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected ? <Check className="w-5 h-5 drop-shadow stroke-[3]" /> : preset.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-xs truncate">
                          {preset.name}
                        </h5>
                        <p className="text-[10px] opacity-70 font-medium truncate mt-0.5">
                          {preset.description}
                        </p>
                        <span
                          className="font-mono text-[10px] font-bold block mt-1"
                          style={{ color: isSelected ? activeColor : undefined }}
                        >
                          {preset.hex.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Liquid Glass Component Preview Section */}
          <div
            className="p-4 rounded-3xl border space-y-3"
            style={{
              backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 opacity-70" />
                <span>ตัวอย่างการแสดงผลจริงบนพื้นหลัง (Live Liquid Glass Preview)</span>
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.15)`,
                  color: activeColor,
                }}
              >
                ลาย: {activePatternObj.emoji} {activePatternObj.name}
              </span>
            </div>

            {/* Mockup Card with Pattern embedded behind translucent glass */}
            <div
              className="p-4 rounded-2xl border shadow-md space-y-3 relative overflow-hidden"
              style={{
                backgroundColor: palette.isDark ? 'rgba(30, 41, 59, 0.78)' : 'rgba(255, 255, 255, 0.76)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.82)',
              }}
            >
              {/* Mockup top bar */}
              <div
                className="flex items-center justify-between gap-3 pb-3 border-b"
                style={{
                  borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: activeColor }}
                  >
                    {activePatternObj.emoji}
                  </div>
                  <span className="font-black text-sm">
                    MyGrade Demo Card
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.15)`,
                      color: activeColor,
                    }}
                  >
                    GPA 3.90 🌟
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: activeColor }}
                  >
                    ปุ่มหลัก
                  </button>
                </div>
              </div>

              {/* Mockup progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>คะแนนสะสมวิชาคณิตศาสตร์</span>
                  <span style={{ color: activeColor }}>88 / 100 คะแนน (เกรด 4.00)</span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden border"
                  style={{
                    backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 0, 0, 0.08)',
                    borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: '88%', backgroundColor: activeColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="px-4 sm:px-6 py-3.5 border-t backdrop-blur-md flex items-center justify-between gap-3 shrink-0"
          style={{
            borderColor: palette.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)',
            backgroundColor: palette.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <button
            id="theme-reset-btn"
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
            title="คืนค่าสีเป็นซากุระหวานและลายดอกไม้เริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">คืนค่าเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="theme-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer opacity-80 hover:opacity-100"
            >
              ยกเลิก
            </button>
            <button
              id="theme-apply-btn"
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-2xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: activeColor,
                boxShadow: `0 4px 14px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.35)`,
              }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>ตกลง ใช้ธีม & ลวดลายนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
