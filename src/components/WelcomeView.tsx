import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Heart,
  Target,
  BookOpen,
  FolderHeart,
  Calendar,
  ArrowRight,
  UserCheck,
  Award,
  Star,
  Palette,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeBackground } from './ThemeBackground';

interface WelcomeViewProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onOpenRegister, onOpenLogin }) => {
  const { loginAsDemo } = useGrade();
  const { openThemeModal } = useTheme();

  return (
    <ThemeBackground className="min-h-screen flex flex-col justify-between p-3.5 sm:p-6 lg:p-8">
      {/* Top Floating Glass Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2.5 px-4 sm:px-6 rounded-3xl border border-white/80 shadow-md backdrop-blur-xl bg-white/70">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--app-primary, #db2777) 0%, var(--app-primary-gradient-end, #c084fc) 100%)',
              boxShadow: '0 6px 18px rgba(var(--app-primary-rgb, 219, 39, 119), 0.35)',
            }}
          >
            <GraduationCap className="w-5 h-5 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                MyGrade
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full text-white font-extrabold shadow-2xs"
                style={{ backgroundColor: 'var(--app-primary, #db2777)' }}
              >
                Liquid Edition
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme customizer button even on welcome screen */}
          <button
            type="button"
            onClick={openThemeModal}
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-white/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="เปลี่ยนธีมสี & ลวดลาย"
          >
            <Palette className="w-4 h-4 text-pink-600" />
            <span className="hidden sm:inline">แต่งธีม</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-white/80 shadow-2xs transition-all cursor-pointer"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </header>

      {/* Center Main Liquid Glass Hero */}
      <main className="max-w-2xl mx-auto w-full my-auto text-center space-y-6 py-8 px-2 sm:px-4">
        {/* Floating Cute Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white/80 shadow-sm backdrop-blur-md text-xs font-extrabold text-slate-800 animate-pulse">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>แอปวางแผนการเรียน & แฟ้มสะสมผลงานสำหรับวัยรุ่น</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
        </div>

        {/* Hero Title with Depth and Soft Glow */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            วางแผนเกรดวันนี้ <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--app-primary, #db2777) 0%, #9333ea 50%, #4f46e5 100%)',
              }}
            >
              เพื่ออนาคตที่อยากเป็น 🫧✨
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-lg mx-auto leading-relaxed">
            คำนวณเกรดจริงแบบ 70/30 หรือ 80/20 วางแผนคณะในฝัน จัดการงานส่ง และสะสมผลงาน Portfolio ในดีไซน์ Liquid Glass สดใส
          </p>
        </div>

        {/* Liquid Glass Feature Cards Grid (Transparent, Frosted, No Flat Gray) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-left pt-2">
          {/* Card 1 */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 10px 30px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-2.5 shadow-sm"
              style={{
                backgroundColor: 'var(--app-primary, #db2777)',
                boxShadow: '0 4px 12px rgba(var(--app-primary-rgb, 219, 39, 119), 0.35)',
              }}
            >
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">คำนวณเกรดตามจริง</h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium leading-normal">
              แยกเก็บระหว่างภาคและปลายภาค วิเคราะห์คะแนนที่ต้องทำได้
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 10px 30px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-purple-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">เป้าหมายมหาวิทยาลัย</h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium leading-normal">
              บันทึกคณะและอาชีพที่อยากเป็น เพื่อดูเกรดเป้าหมายที่แท้จริง
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 10px 30px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-rose-500/30">
              <FolderHeart className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Portfolio แฟ้มผลงาน</h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium leading-normal">
              เก็บเกียรติบัตร กิจกรรม และโครงงานพร้อมส่ง TCAS รอบพอร์ต
            </p>
          </div>

          {/* Card 4 */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-white/80 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 10px 30px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-teal-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">งาน & นับถอยหลังสอบ</h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-medium leading-normal">
              แจ้งเตือนกำหนดส่งการบ้าน และนับถอยหลังวันสอบกลาง/ปลายภาค
            </p>
          </div>
        </div>

        {/* Action Buttons with Liquid Glass Styling */}
        <div className="space-y-3 pt-3 max-w-sm mx-auto">
          <button
            type="button"
            id="welcome-register-btn"
            onClick={onOpenRegister}
            className="w-full py-4 px-6 rounded-3xl text-white font-extrabold text-sm shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
            style={{
              background: 'linear-gradient(135deg, var(--app-primary, #db2777) 0%, var(--app-primary-gradient-end, #c084fc) 100%)',
              boxShadow: '0 8px 24px -2px rgba(var(--app-primary-rgb, 219, 39, 119), 0.45)',
            }}
          >
            <span>เริ่มต้นใช้งาน — สมัครบัญชีใหม่</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="welcome-login-btn"
            onClick={onOpenLogin}
            className="w-full py-3.5 px-6 rounded-3xl text-slate-800 font-extrabold text-sm border border-white/90 shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-white"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>เข้าสู่ระบบด้วยบัญชีเดิม</span>
          </button>

          {/* Quick Demo Access */}
          <div className="pt-2">
            <button
              type="button"
              id="welcome-demo-btn"
              onClick={loginAsDemo}
              className="inline-flex items-center gap-2 text-xs text-slate-800 font-extrabold px-4 py-2 rounded-2xl border border-white/80 shadow-xs transition-all cursor-pointer hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <UserCheck className="w-4 h-4 text-pink-600" />
              <span>ทดลองใช้งานระบบทันที (Guest Mode นักเรียนทดสอบ) 🌸</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-500 font-semibold">
        MyGrade • Liquid Glass Edition สำหรับนักเรียนมัธยม
      </footer>
    </ThemeBackground>
  );
};
