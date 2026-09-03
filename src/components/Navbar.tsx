import React from 'react';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Sparkles,
  User,
  Edit3,
} from 'lucide-react';
import { SemesterToggle } from './SemesterToggle';
import { useGrade } from '../context/GradeContext';

export type NavTab = 'dashboard' | 'subjects' | 'tasks' | 'exams' | 'analytics' | 'comparison';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettings?: () => void;
  onOpenEditProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenEditProfile,
}) => {
  const { academicYear, currentSemester } = useGrade();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'หน้าหลัก', icon: Home },
    { id: 'subjects' as NavTab, label: 'วิชา', icon: BookOpen },
    { id: 'tasks' as NavTab, label: 'งาน', icon: CheckSquare },
    { id: 'exams' as NavTab, label: 'ตารางสอบ', icon: Calendar },
    { id: 'analytics' as NavTab, label: 'วิเคราะห์', icon: BarChart3 },
    { id: 'comparison' as NavTab, label: 'เปรียบเทียบเทอม / ภาพรวม', icon: TrendingUp },
  ];

  return (
    <>
      {/* Top Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Year info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent tracking-tight">
                    GradeMate
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    2 ภาคเรียน
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenEditProfile || onOpenSettings}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors text-left group cursor-pointer"
                  title="คลิกเพื่อแก้ไขชื่อนักเรียนหรือห้องเรียน"
                >
                  <span className="font-medium text-slate-400">ปี {academicYear.year}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 group-hover:text-indigo-600 truncate max-w-[120px] sm:max-w-[190px] underline decoration-dotted underline-offset-2">
                    {academicYear.studentName} ({academicYear.studentClass})
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-70 shrink-0" />
                </button>
              </div>
            </div>

            {/* Middle: Prominent Semester Switcher */}
            <div className="flex items-center">
              <SemesterToggle size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side Profile & Settings buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenEditProfile || onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="คลิกเพื่อแก้ไขชื่อนักเรียน"
              >
                <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline truncate max-w-[120px]">{academicYear.studentName}</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md text-indigo-600 font-bold border border-indigo-200/70">
                  แก้ชื่อ
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
                title="ตั้งค่าปีการศึกษาและข้อมูล"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xl:inline">ตั้งค่า / สำรองข้อมูล</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-nav for Tablet */}
        <div className="hidden md:flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? currentSemester === 'term1'
                      ? 'text-blue-600 font-semibold'
                      : 'text-rose-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] leading-tight text-center line-clamp-1">
                  {item.id === 'comparison' ? 'เปรียบเทียบ' : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
