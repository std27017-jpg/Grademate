import React, { useState, useEffect, useRef, useId } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';
import {
  PRESET_THEME_COLORS,
  DEFAULT_THEME_COLOR,
  hexToRgb,
  rgbToHex,
  hslToRgb,
  rgbToHsl,
} from '../utils/themeUtils';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { themeColor, setThemeColor, resetThemeColor } = useTheme();

  // Working color state in modal
  const [activeColor, setActiveColor] = useState(themeColor);
  const [hexInput, setHexInput] = useState(themeColor);
  const [isValidHex, setIsValidHex] = useState(true);
  const [activeTab, setActiveTab] = useState<'wheel' | 'presets'>('wheel');
  const [copied, setCopied] = useState(false);
  const [lightness, setLightness] = useState(50);

  // Wheel canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  // Sync with current themeColor when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveColor(themeColor);
      setHexInput(themeColor);
      setIsValidHex(true);

      const rgb = hexToRgb(themeColor);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setLightness(hsl.l);
      }
    }
  }, [isOpen, themeColor]);

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

    // Draw hue / saturation circle
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const index = (y * width + x) * 4;

        if (dist <= radius) {
          // Calculate angle (0 - 360)
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (angle < 0) angle += 360;

          // Saturation (0 - 100)
          const sat = (dist / radius) * 100;
          const rgb = hslToRgb(angle, sat, lightness);

          data[index] = rgb.r;
          data[index + 1] = rgb.g;
          data[index + 2] = rgb.b;
          data[index + 3] = 255;
        } else {
          data[index + 3] = 0; // transparent outside wheel
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw active color indicator pointer
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

  // Redraw wheel whenever activeColor or lightness changes
  useEffect(() => {
    if (isOpen && activeTab === 'wheel') {
      // Delay slightly to ensure canvas is attached to DOM
      const timer = setTimeout(() => {
        drawWheel();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, lightness, activeColor]);

  // Handle click or drag on color wheel
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

  // Handle custom Hex code text input
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

  // Handle native color picker change
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

  // Handle Preset Click
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

  // Copy hex code to clipboard
  const handleCopyHex = () => {
    navigator.clipboard.writeText(activeColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply & Close with celebration
  const handleApply = () => {
    setThemeColor(activeColor);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // Confetti fallback
    }
    onClose();
  };

  // Reset to default
  const handleReset = () => {
    resetThemeColor();
    setActiveColor(DEFAULT_THEME_COLOR);
    setHexInput(DEFAULT_THEME_COLOR);
    setIsValidHex(true);
    setLightness(50);
  };

  if (!isOpen) return null;

  const currentRgb = hexToRgb(activeColor) || { r: 99, g: 102, b: 241 };
  const currentHsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-300"
              style={{ backgroundColor: activeColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <span>ปรับแต่งสีธีมของแอป</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Theme Customizer
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                เลือกจากวงล้อสี, จิ้มสี, กรอกโค้ดสี HEX หรือเลือกจากชุดสีแนะนำ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Wheel vs Presets */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'wheel'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>วงล้อสี & ใส่โค้ดสี (Color Wheel & Hex)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ชุดสีสำเร็จรูป ({PRESET_THEME_COLORS.length} ธีม)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'wheel' ? (
            <div className="space-y-5">
              {/* Color Wheel + Preview Row */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Canvas Color Wheel */}
                <div className="relative flex flex-col items-center">
                  <div className="p-2 bg-slate-50 rounded-full border border-slate-200 shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={210}
                      height={210}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      className="cursor-crosshair rounded-full touch-none block"
                      title="คลิกหรือลากบนวงล้อสีเพื่อเลือกสีที่ต้องการ"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 font-medium">
                    คลิกหรือลากบนวงล้อสีเพื่อเลือกเฉดสี
                  </span>
                </div>

                {/* Color Information & Native Picker */}
                <div className="flex-1 w-full max-w-xs space-y-4">
                  {/* Big Color Preview Box */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl shadow-md border-2 border-white ring-1 ring-slate-200 flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: activeColor }}
                      >
                        <Check className="w-6 h-6 drop-shadow" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          สีที่เลือกปัจจุบัน
                        </span>
                        <span className="font-mono font-black text-slate-900 text-lg uppercase block">
                          {activeColor}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          RGB({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                        </span>
                      </div>
                    </div>

                    {/* Native Pipette / HTML5 Color Input button */}
                    <label className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs">
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
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>ความสว่างของสี (Lightness):</span>
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
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Hex Code Input Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>ใส่โค้ดสีตามต้องการ (HEX Code):</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isValidHex ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {isValidHex ? '✓ โค้ดสีถูกต้อง' : '⚠️ รูปแบบ Hex ไม่ถูกต้อง (เช่น #6366F1)'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#6366F1 หรือ 6366F1"
                      className={`w-full pl-3 pr-9 py-2 rounded-xl text-sm font-mono font-bold bg-white border ${
                        isValidHex
                          ? 'border-slate-300 focus:border-indigo-500'
                          : 'border-rose-400 focus:border-rose-500 text-rose-600'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                    <div
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: isValidHex ? activeColor : 'transparent' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                <p className="text-[11px] text-slate-500">
                  ตัวอย่างโค้ดสียอดนิยม: <code className="text-slate-700 font-bold">#6366F1</code>,{' '}
                  <code className="text-slate-700 font-bold">#0EA5E9</code>,{' '}
                  <code className="text-slate-700 font-bold">#10B981</code>,{' '}
                  <code className="text-slate-700 font-bold">#F43F5E</code>,{' '}
                  <code className="text-slate-700 font-bold">#8B5CF6</code>
                </p>
              </div>
            </div>
          ) : (
            /* Presets Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  คลิกเพื่อเลือกธีมสีสำเร็จรูปที่ผ่านการปรับแต่งความคมชัดมาแล้ว:
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_THEME_COLORS.map((preset) => {
                  const isSelected = activeColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.hex)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 font-bold text-sm relative"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected ? <Check className="w-4 h-4 drop-shadow" /> : preset.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs truncate">
                          {preset.name}
                        </h5>
                        <span
                          className={`font-mono text-[10px] block ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
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

          {/* Live Component Preview Section */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>ตัวอย่างการแสดงผลส่วนต่างๆ ในแอป (Live Preview):</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              {/* Fake top bar */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: activeColor }}
                  >
                    MG
                  </div>
                  <span className="font-extrabold text-sm" style={{ color: activeColor }}>
                    🎓 MyGrade
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0.12)`,
                      color: activeColor,
                    }}
                  >
                    เกรดเฉลี่ย 3.85
                  </span>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: activeColor }}
                  >
                    ปุ่มหลัก
                  </button>
                </div>
              </div>

              {/* Fake progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>คะแนนสะสมวิชาคณิตศาสตร์</span>
                  <span style={{ color: activeColor }}>85 / 100 คะแนน</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: '85%', backgroundColor: activeColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="คืนค่าสีเป็นสีม่วงครามเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าสีเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: activeColor }}
            >
              <Check className="w-4 h-4" />
              <span>ตกลง ใช้สีนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
