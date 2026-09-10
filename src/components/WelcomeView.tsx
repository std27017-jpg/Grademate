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
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';

interface WelcomeViewProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onOpenRegister, onOpenLogin }) => {
  const { loginAsDemo } = useGrade();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 via-purple-50/40 to-indigo-50/60 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              MyGrade
            </span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
              Student Planner
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLogin}
          className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white/90 hover:bg-white border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
        >
          เข้าสู่ระบบ
        </button>
      </div>

      {/* Main Content Hero */}
      <main className="max-w-xl mx-auto w-full my-auto text-center space-y-6 py-6">
        {/* Cute Mascot & Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-pink-200/90 shadow-xs text-pink-600 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>เพื่อนคู่คิดวางแผนการเรียน & แฟ้มสะสมผลงาน</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
        </div>

        {/* Big Slogan and App Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            วางแผนเกรดวันนี้ <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              เพื่ออนาคตที่อยากเป็น 💗
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            แอปช่วยคำนวณคะแนนตามจริง วางแผนเกรดเป้าหมาย เตรียมความพร้อมสู่มหาวิทยาลัยและอาชีพในฝัน
          </p>
        </div>

        {/* Feature Cards Grid (Cute & Rounded) */}
        <div className="grid grid-cols-2 gap-3 text-left pt-2">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-pink-100 shadow-xs hover:border-pink-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">คำนวณคะแนนตามจริง</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">แบ่งเก็บ 30/สอบ 20 ทั้งกลางภาคและปลายภาค</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-purple-100 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">เป้าหมาย & มหาวิทยาลัย</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">บันทึกคณะและอาชีพในฝัน วิเคราะห์วิชาที่ต้องเน้น</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-indigo-100 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
              <FolderHeart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Portfolio Planner</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">เก็บเกียรติบัตร กิจกรรม และโครงงานเป็นระบบ</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-teal-100 shadow-xs hover:border-teal-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">งานและตารางสอบ</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">แจ้งเตือนงานใกล้กำหนดส่งและนับถอยหลังวันสอบ</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
          <button
            type="button"
            id="welcome-register-btn"
            onClick={onOpenRegister}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>สมัครบัญชีผู้ใช้ใหม่</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="welcome-login-btn"
            onClick={onOpenLogin}
            className="w-full py-3 px-6 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200/90 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>เข้าสู่ระบบด้วยบัญชีเดิม</span>
          </button>

          {/* Quick Demo Access */}
          <div className="pt-2">
            <button
              type="button"
              id="welcome-demo-btn"
              onClick={loginAsDemo}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full border border-indigo-200/80 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>เข้าใช้งานบัญชีทดลอง (ชญาภา สุขสมบูรณ์) 🌸</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-400 font-medium">
        MyGrade • แอปช่วยวางแผนการเรียนและอนาคตของนักเรียนมัธยม
      </footer>
    </div>
  );
};
