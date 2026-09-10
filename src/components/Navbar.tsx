import React from 'react';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  GraduationCap,
  Sparkles,
  User,
  Edit3,
  Palette,
  Target,
  Bell,
} from 'lucide-react';
import { SemesterToggle } from './SemesterToggle';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'tasks'
  | 'exams'
  | 'future'
  | 'analytics'
  | 'profile'
  | 'comparison';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettings?: () => void;
  onOpenEditProfile?: () => void;
  onOpenThemeModal?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenEditProfile,
  onOpenThemeModal,
  onOpenNotifications,
}) => {
  const {
    academicYear,
    currentSemester,
    userProfile,
    unreadNotificationCount,
  } = useGrade();
  const { themeColor, openThemeModal } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'หน้าหลัก', icon: Home },
    { id: 'subjects' as NavTab, label: 'วิชา', icon: BookOpen },
    { id: 'tasks' as NavTab, label: 'งาน', icon: CheckSquare },
    { id: 'exams' as NavTab, label: 'สอบ', icon: Calendar },
    { id: 'future' as NavTab, label: 'อนาคต & เป้าหมาย', icon: Target },
    { id: 'analytics' as NavTab, label: 'วิเคราะห์', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'โปรไฟล์', icon: User },
  ];

  return (
    <>
      {/* Top Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Year info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>🌸</span>
                    <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      MyGrade
                    </span>
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 hidden lg:inline-block">
                    Student Planner
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-pink-600 transition-colors text-left group cursor-pointer"
                  title="คลิกเพื่อดูและแก้ไขโปรไฟล์นักเรียน"
                >
                  <span className="font-medium text-slate-400">ปี {academicYear.year}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 group-hover:text-pink-600 truncate max-w-[120px] sm:max-w-[190px] underline decoration-dotted underline-offset-2">
                    {userProfile.fullName || academicYear.studentName} ({academicYear.studentClass})
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-pink-600 opacity-70 shrink-0" />
                </button>
              </div>
            </div>

            {/* Middle: Prominent Semester Switcher */}
            <div className="flex items-center">
              <SemesterToggle size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-white text-pink-600 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-pink-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side Notification Bell, Theme & Profile buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Notification Bell */}
              <button
                type="button"
                id="notification-bell-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full text-slate-600 hover:text-pink-600 hover:bg-pink-50 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                title="ศูนย์แจ้งเตือน"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-bounce">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Theme Color Switcher Button */}
              <button
                type="button"
                id="theme-color-button"
                onClick={onOpenThemeModal || openThemeModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs group active:scale-95"
                title="เปลี่ยนสีธีมของแอป"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: themeColor }}
                />
                <Palette className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800" />
                <span className="hidden md:inline">สีธีม</span>
              </button>

              {/* Profile Avatar Button */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-pink-600 bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95"
                title="ไปที่โปรไฟล์"
              >
                <span className="text-base">{userProfile.avatar || '🌸'}</span>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {userProfile.nickname || userProfile.fullName.split(' ')[0] || 'โปรไฟล์'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-nav for Tablet */}
        <div className="hidden md:flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1.5 scrollbar-none justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-xs'
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

      {/* Mobile Floating Bottom Navigation Bar (Cute, Rounded, Modern) */}
      <nav className="md:hidden fixed bottom-3 left-2 right-2 z-40 bg-white/95 backdrop-blur-xl border border-pink-200/80 rounded-3xl p-1 shadow-lg shadow-pink-900/5">
        <div className="grid grid-cols-6 gap-0.5">
          {navItems.filter((i) => i.id !== 'analytics').map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all cursor-pointer select-none active:scale-90 ${
                  isActive
                    ? 'bg-pink-50 text-pink-700 font-black shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mb-0.5 transition-transform ${
                    isActive ? 'scale-110 text-pink-600' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] leading-tight text-center truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
