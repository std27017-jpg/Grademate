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

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { themeColor, themePattern, setThemeColor, setThemePattern, resetThemeColor } = useTheme();

  // Working state in modal
  const [activeColor, setActiveColor] = useState(themeColor);
  const [activePattern, setActivePattern] = useState<ThemePatternId>(themePattern);
  const [hexInput, setHexInput] = useState(themeColor);
  const [isValidHex, setIsValidHex] = useState(true);
  const [activeTab, setActiveTab] = useState<'patterns' | 'wheel' | 'presets'>('patterns');
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

  // Draw color wheel on canvas
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

  // Handle color wheel interaction
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
    } catch (e) {
      // fallback
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] box-border relative shadow-2xl border"
        style={{
          background: 'var(--theme-glass, rgba(255, 255, 255, 0.88))',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderColor: 'var(--theme-glass-border, rgba(255, 255, 255, 0.85))',
          boxShadow: `0 20px 50px -10px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.25)`,
        }}
      >
        {/* Header with Liquid Glass aesthetic */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300 shrink-0"
              style={{
                backgroundColor: activeColor,
                boxShadow: `0 4px 14px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.4)`,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>ปรับแต่งธีม & ลวดลาย Liquid Glass</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                  style={{ backgroundColor: activeColor }}
                >
                  Theme Studio
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                เลือกทั้งสีธีมหลัก, วงล้อสี, และลวดลายพื้นหลังที่จะแสดงทั่วทั้งระบบ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Tabs: Patterns | Color Wheel | Presets */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/50 flex items-center gap-1.5 sm:gap-2 bg-white/30">
          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`flex-1 py-2 px-2.5 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'patterns'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white/60 text-slate-700 hover:bg-white/90 border border-white/60'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>ลวดลายพื้นหลัง ({THEME_PATTERNS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 py-2 px-2.5 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wheel'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white/60 text-slate-700 hover:bg-white/90 border border-white/60'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>วงล้อสี & รหัส HEX</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-2.5 sm:px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white/60 text-slate-700 hover:bg-white/90 border border-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ชุดสีสำเร็จรูป ({PRESET_THEME_COLORS.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: Patterns */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-pink-600" />
                    <span>เลือกลวดลายพื้นหลังของแอป (Pattern Background)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    ลวดลายจะปูทั่วทั้งหน้าจอของแอป ผสมผสานกับ Gradient และ Liquid Glass Card
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {THEME_PATTERNS.map((pattern) => {
                  const isSelected = activePattern === pattern.id;
                  const patternPreviewUri = getPatternSvgDataUri(pattern.id, activeColor);

                  return (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => handleSelectPattern(pattern.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all duration-200 cursor-pointer min-h-[96px] ${
                        isSelected
                          ? 'border-2 shadow-md scale-[1.02] bg-white'
                          : 'bg-white/60 hover:bg-white/90 border-white/70 hover:border-slate-300'
                      }`}
                      style={{
                        borderColor: isSelected ? activeColor : undefined,
                        boxShadow: isSelected
                          ? `0 8px 24px -4px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.25)`
                          : undefined,
                      }}
                    >
                      {/* Live Pattern Texture Preview inside button */}
                      {pattern.id !== 'none' && pattern.id !== 'gradient' && (
                        <div
                          className="absolute inset-0 pointer-events-none opacity-25"
                          style={{
                            backgroundImage: patternPreviewUri,
                            backgroundRepeat: 'repeat',
                            backgroundSize:
                              pattern.id === 'polka'
                                ? '24px 24px'
                                : pattern.id === 'sparkles'
                                ? '32px 32px'
                                : '40px 40px',
                          }}
                        />
                      )}

                      <div className="flex items-center justify-between w-full relative z-10">
                        <span className="text-xl">{pattern.emoji}</span>
                        {isSelected && (
                          <div
                            className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: activeColor }}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 mt-2">
                        <h5 className="font-extrabold text-xs text-slate-900 truncate">
                          {pattern.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
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
                  <div className="p-2 bg-white/80 rounded-full border border-white/80 shadow-md backdrop-blur-md">
                    <canvas
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
                  <span className="text-[11px] text-slate-600 mt-2 font-semibold">
                    คลิกหรือลากบนวงล้อสีเพื่อเลือกเฉดสี
                  </span>
                </div>

                {/* Color Information & Native Picker */}
                <div className="flex-1 w-full max-w-xs space-y-4">
                  {/* Big Color Preview Box */}
                  <div className="p-4 rounded-3xl border border-white/70 bg-white/70 shadow-xs backdrop-blur-md space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl shadow-md border-2 border-white flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: activeColor }}
                      >
                        <Check className="w-6 h-6 drop-shadow" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-slate-500 font-bold block">
                          สีที่เลือกปัจจุบัน
                        </span>
                        <span className="font-mono font-black text-slate-900 text-lg uppercase block">
                          {activeColor}
                        </span>
                        <span className="text-[11px] text-slate-600 font-semibold block truncate">
                          RGB({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                        </span>
                      </div>
                    </div>

                    {/* Native Pipette / HTML5 Color Input button */}
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white/90 hover:bg-white border border-white/80 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs">
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
                  <div className="space-y-1.5 p-3 rounded-2xl bg-white/60 border border-white/60">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-500" />
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
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Hex Code Input Section */}
              <div className="p-4 bg-white/70 rounded-3xl border border-white/80 space-y-2 backdrop-blur-md">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>ใส่โค้ดสีตามต้องการ (HEX Code):</span>
                  <span
                    className={`text-[11px] font-bold ${
                      isValidHex ? 'text-emerald-700' : 'text-rose-600'
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
                      className={`w-full pl-3 pr-9 py-2 rounded-2xl text-sm font-mono font-bold bg-white/90 border ${
                        isValidHex
                          ? 'border-slate-300 focus:border-pink-500'
                          : 'border-rose-400 focus:border-rose-500 text-rose-600'
                      } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
                    />
                    <div
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200 shadow-2xs"
                      style={{ backgroundColor: isValidHex ? activeColor : 'transparent' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="px-3.5 py-2 bg-white/90 hover:bg-white border border-white/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="คัดลอกโค้ดสี"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">คัดลอกแล้ว</span>
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
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    ชุดสีสำเร็จรูปตามสไตล์ Modern Teen ({PRESET_THEME_COLORS.length} ธีม)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    ผ่านการทดสอบอัตราส่วนความคมชัด (Contrast) และแมทช์กับ Liquid Glass
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_THEME_COLORS.map((preset) => {
                  const isSelected = activeColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.hex)}
                      className={`p-3.5 rounded-3xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]'
                          : 'bg-white/70 hover:bg-white text-slate-800 border-white/70 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 font-bold text-base relative"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected ? <Check className="w-5 h-5 drop-shadow" /> : preset.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-xs truncate">
                          {preset.name}
                        </h5>
                        <p
                          className={`text-[10px] font-medium truncate mt-0.5 ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {preset.description}
                        </p>
                        <span
                          className={`font-mono text-[10px] font-bold block mt-1 ${
                            isSelected ? 'text-pink-300' : 'text-slate-600'
                          }`}
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
          <div className="p-4 rounded-3xl border border-white/80 space-y-3 glass-secondary">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>ตัวอย่างการแสดงผลจริงบนพื้นหลัง (Live Liquid Glass Preview):</span>
            </div>

            <div
              className="p-4 rounded-2xl border border-white/80 shadow-md space-y-3 relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Fake top bar */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/60">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: activeColor }}
                  >
                    🌸
                  </div>
                  <span className="font-black text-sm text-slate-900">
                    MyGrade
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
                    เกรดเฉลี่ย 3.90 🌟
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    style={{ backgroundColor: activeColor }}
                  >
                    ปุ่มหลัก
                  </button>
                </div>
              </div>

              {/* Fake progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                  <span>คะแนนสะสมวิชาคณิตศาสตร์</span>
                  <span style={{ color: activeColor }}>88 / 100 คะแนน (เกรด 4.00)</span>
                </div>
                <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden border border-white/60">
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
        <div className="px-5 sm:px-6 py-4 border-t border-white/60 bg-white/50 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="คืนค่าสีเป็นซากุระหวานและลายดอกไม้เริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-2xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: activeColor,
                boxShadow: `0 4px 14px rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.35)`,
              }}
            >
              <Check className="w-4 h-4" />
              <span>ตกลง ใช้ธีม & ลวดลายนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
