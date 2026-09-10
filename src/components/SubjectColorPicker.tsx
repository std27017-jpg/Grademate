import React, { useState, useRef, useEffect } from 'react';
import {
  PASTEL_COLOR_PRESETS,
  PastelColorPreset,
  getSubjectColor,
  hexToRgb,
  rgbToHex,
  hslToRgb,
  rgbToHsl,
  makeColorPastel,
  getContrastTextColor,
} from '../utils/colorUtils';
import { Palette, Sparkles, Check, Pipette, RefreshCw, Copy, CheckCheck } from 'lucide-react';

interface SubjectColorPickerProps {
  selectedColor: string;
  onChange: (hexColor: string) => void;
  subjectName?: string;
}

export const SubjectColorPicker: React.FC<SubjectColorPickerProps> = ({
  selectedColor,
  onChange,
  subjectName = 'วิชาตัวอย่าง',
}) => {
  const [activeTab, setActiveTab] = useState<'pastel' | 'wheel'>('pastel');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightness, setLightness] = useState<number>(75); // default soft/pastel lightness

  const currentColor = getSubjectColor(selectedColor);
  const [hexInput, setHexInput] = useState(currentColor);

  useEffect(() => {
    setHexInput(currentColor);
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLightness(hsl.l);
    }
  }, [currentColor]);

  // Draw the color wheel
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

    // Draw active color indicator pointer
    const currentRgb = hexToRgb(currentColor);
    if (currentRgb) {
      const hsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);
      const angleRad = (hsl.h * Math.PI) / 180;
      const dist = (hsl.s / 100) * radius;
      const pointerX = centerX + dist * Math.cos(angleRad);
      const pointerY = centerY + dist * Math.sin(angleRad);

      ctx.beginPath();
      ctx.arc(pointerX, pointerY, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pointerX, pointerY, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (activeTab === 'wheel') {
      const timer = setTimeout(() => {
        drawWheel();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [activeTab, lightness, currentColor]);

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

    onChange(hex);
    setHexInput(hex);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleWheelInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleWheelInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length > 0) {
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleLightnessChange = (newLight: number) => {
    setLightness(newLight);
    const rgb = hexToRgb(currentColor);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const newRgb = hslToRgb(hsl.h, hsl.s, newLight);
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChange(hex);
      setHexInput(hex);
    }
  };

  const handleMakePastel = () => {
    const pastelHex = makeColorPastel(currentColor);
    onChange(pastelHex);
    setHexInput(pastelHex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      onChange(val.startsWith('#') ? val : `#${val}`);
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(currentColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'ขนมหวาน', label: '🍰 ขนมหวาน' },
    { id: 'ธรรมชาติ', label: '🍃 ธรรมชาติ' },
    { id: 'ผลไม้ & เครื่องดื่ม', label: '🫐 ผลไม้/เครื่องดื่ม' },
    { id: 'ละมุนแฟนตาซี', label: '🦄 ละมุนแฟนตาซี' },
  ];

  const filteredPresets =
    activeCategory === 'all'
      ? PASTEL_COLOR_PRESETS
      : PASTEL_COLOR_PRESETS.filter((p) => p.category === activeCategory);

  const contrastText = getContrastTextColor(currentColor);

  return (
    <div className="space-y-4">
      {/* Tab Switcher: Pastel vs Color Wheel */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('pastel')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'pastel'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span>🌸 สีพาสเทลน่ารัก</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-600 font-bold">
            {PASTEL_COLOR_PRESETS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'wheel'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>วงล้อสีอิสระ</span>
        </button>
      </div>

      {/* TAB 1: Pastel Presets */}
      {activeTab === 'pastel' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1 p-1">
            {filteredPresets.map((preset) => {
              const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(preset.hex)}
                  title={`${preset.name} (${preset.hex})`}
                  className={`group relative flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-400/30 bg-indigo-50/40 shadow-xs scale-102'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-xs transition-transform group-hover:scale-110 shrink-0 relative"
                    style={{ backgroundColor: preset.hex }}
                  >
                    <span>{preset.emoji}</span>
                    {isSelected && (
                      <div className="absolute inset-0 rounded-xl bg-black/15 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-sm stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full block leading-tight">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Color Wheel */}
      {activeTab === 'wheel' && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {/* Interactive Canvas Wheel */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={190}
                height={190}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="rounded-full shadow-md border-2 border-white cursor-crosshair touch-none"
              />
              <div className="absolute -bottom-2 -right-2">
                <button
                  type="button"
                  onClick={handleMakePastel}
                  className="p-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-600 shadow-xs text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="ปรับความสว่างและความอิ่มตัวให้เป็นพาสเทลน่ารักอัตโนมัติ"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>เป็นพาสเทล</span>
                </button>
              </div>
            </div>

            {/* Slider & Quick Controls */}
            <div className="w-full sm:w-48 space-y-3">
              {/* Lightness Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>ความสว่าง / พาสเทล</span>
                  <span>{lightness}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="92"
                  value={lightness}
                  onChange={(e) => handleLightnessChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
                  <span>สีสดเข้ม</span>
                  <span>พาสเทลละมุน ✨</span>
                </div>
              </div>

              {/* Native Eyedropper / Color Picker button */}
              <div className="pt-1">
                <label className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <Pipette className="w-3.5 h-3.5 text-indigo-600" />
                  <span>เลือกด้วยหลอดดูดสีระบบ</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      onChange(e.target.value);
                      setHexInput(e.target.value);
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Hex Input & Copy */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <div
              className="w-7 h-7 rounded-lg shadow-2xs shrink-0 border border-black/10"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-xs font-bold text-slate-400">HEX:</span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#F472B6"
              maxLength={7}
              className="flex-1 bg-white px-2 py-1 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase text-slate-800 focus:outline-indigo-500"
            />
            <button
              type="button"
              onClick={handleCopyHex}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 text-[10px]">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">คัดลอก</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Bar */}
      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-xs shrink-0 transition-colors"
            style={{
              backgroundColor: currentColor,
              color: contrastText,
            }}
          >
            {subjectName ? subjectName.charAt(0) : 'ว'}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">
              ตัวอย่างสีที่แสดง
            </span>
            <span className="text-xs font-extrabold text-slate-800 truncate block">
              {subjectName || 'วิชาตัวอย่าง'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="px-2.5 py-0.5 rounded-lg text-xs font-black shadow-2xs"
            style={{
              backgroundColor: currentColor,
              color: contrastText,
            }}
          >
            {currentColor.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
