import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NavTab } from './Navbar';

interface DevelopersViewProps {
  onNavigate?: (tab: NavTab) => void;
}

interface DeveloperItem {
  id: number;
  name: string;
  studentNo: number;
}

const DEVELOPERS: DeveloperItem[] = [
  {
    id: 1,
    name: 'นางสาวชญาภา จัทร์ส่อง',
    studentNo: 23,
  },
  {
    id: 2,
    name: 'นางสาวฑิฆัมพร รอดภัย',
    studentNo: 24,
  },
  {
    id: 3,
    name: 'นางสาวสุพรรณษา แผ้วเกษม',
    studentNo: 29,
  },
  {
    id: 4,
    name: 'นางสาวสุภัสสรา เขียวอ่อน',
    studentNo: 30,
  },
  {
    id: 5,
    name: 'นางสาวหนึ่งธิดา ภิญโญกุล',
    studentNo: 31,
  },
];

export const DevelopersView: React.FC<DevelopersViewProps> = ({ onNavigate }) => {
  const { themeColor } = useTheme();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Bar: Simple back button */}
      {onNavigate && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-white/80 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 app-theme-text" />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      )}

      {/* Header: Clean, Simple */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/80 shadow-xs text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <span>👩‍💻</span>
          <span>ผู้พัฒนา MyGrade</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          รายชื่อคณะผู้จัดทำโครงงานและพัฒนาแอปพลิเคชัน
        </p>
      </div>

      {/* Developers List: Simple, Clean Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Users className="w-4 h-4 app-theme-text" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            รายชื่อผู้พัฒนา
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            (5 คน)
          </span>
        </div>

        {/* Responsive List: 1 col on mobile, 2 cols on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEVELOPERS.map((dev) => (
            <div
              key={dev.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-white/80 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                    style={{ backgroundColor: themeColor }}
                  >
                    {dev.id}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {dev.name}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass-secondary border border-white/70 text-xs font-bold app-theme-text">
                  <span>เลขที่</span>
                  <span className="text-sm font-black">{dev.studentNo}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info: ครูที่ปรึกษา, รายวิชา, ระดับชั้น */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-4 h-4 app-theme-text" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            ข้อมูลเพิ่มเติม
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* ครูที่ปรึกษา */}
          <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 app-theme-text" />
              <span>ครูที่ปรึกษา</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
              ว่าที่ร.ต.หญิงอมลณดา วาริสสอน
            </p>
          </div>

          {/* รายวิชา */}
          <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 app-theme-text" />
              <span>รายวิชา</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
              วิทยาการคำนวณ
            </p>
          </div>

          {/* ระดับชั้น */}
          <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 app-theme-text" />
              <span>ระดับชั้น</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
              มัธยมศึกษาปีที่ 4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
