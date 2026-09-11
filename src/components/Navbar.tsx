import React, { useState } from 'react';
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
  Timer,
  Menu,
  X,
  Settings,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { SemesterToggle } from './SemesterToggle';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import { AvatarDisplay } from './AvatarDisplay';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'study'
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Primary desktop & tablet nav items
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'หน้าหลัก', icon: Home },
    { id: 'subjects' as NavTab, label: 'วิชา', icon: BookOpen },
    { id: 'study' as NavTab, label: 'อ่านหนังสือ 📚', icon: Timer },
    { id: 'tasks' as NavTab, label: 'งาน', icon: CheckSquare },
    { id: 'exams' as NavTab, label: 'สอบ', icon: Calendar },
    { id: 'future' as NavTab, label: 'อนาคต & เป้าหมาย', icon: Target },
    { id: 'analytics' as NavTab, label: 'วิเคราะห์', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'โปรไฟล์', icon: User },
  ];

  // Mobile Bottom Navigation 5 essential tabs
  const mobileBottomTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
    { id: 'subjects', label: 'วิชา', icon: BookOpen },
    { id: 'study', label: 'อ่าน', icon: Timer },
    { id: 'future', label: 'เป้าหมาย', icon: Target },
    { id: 'profile', label: 'โปรไฟล์', icon: User },
  ];

  // Drawer complete navigation items
  const drawerItems = [
    { id: 'dashboard' as NavTab, label: 'หน้าหลัก (Dashboard)', icon: Home, desc: 'สรุปผลและภาพรวม' },
    { id: 'subjects' as NavTab, label: 'รายวิชา & คะแนนเก็บ', icon: BookOpen, desc: 'บันทึกคะแนน 100 ช่อง & คำนวณเกรด' },
    { id: 'study' as NavTab, label: 'ตัวจับเวลาอ่านหนังสือ', icon: Timer, desc: 'Pomodoro & สถิติรายวัน' },
    { id: 'tasks' as NavTab, label: 'งาน & การบ้าน', icon: CheckSquare, desc: 'ติดตามงานและกำหนดส่ง' },
    { id: 'exams' as NavTab, label: 'ตารางสอบ & หัวข้อ', icon: Calendar, desc: 'นับถอยหลังวันสอบและเนื้อหา' },
    { id: 'future' as NavTab, label: 'วางแผนอนาคต & มหาวิทยาลัย', icon: Target, desc: 'เป้าหมายเกรด อาชีพ และ Portfolio' },
    { id: 'analytics' as NavTab, label: 'วิเคราะห์สถิติผลการเรียน', icon: BarChart3, desc: 'กราฟ GPA และเกรดรวม' },
    { id: 'comparison' as NavTab, label: 'เปรียบเทียบผลการเรียน', icon: Scale, desc: 'เปรียบเทียบข้ามเทอม' },
    { id: 'profile' as NavTab, label: 'ข้อมูลนักเรียน & ประวัติ', icon: User, desc: 'สายการเรียนและโรงเรียน' },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Unified Header: Mobile Floating Pill / Desktop Seamless Bar */}
      <header className="sticky top-2 z-40 mx-2 md:mx-0 md:top-0 bg-white/95 backdrop-blur-xl border border-pink-200/80 md:border-b md:border-t-0 md:border-x-0 md:border-slate-200/80 rounded-2xl md:rounded-none shadow-lg shadow-pink-900/5 md:shadow-2xs transition-all box-border">
        {/* ========================================================================= */}
        {/* MOBILE COMPACT HEADER (< md: 320px - 767px) */}
        {/* Layout: [ ☰ Menu ]   🌸 MyGrade (Term)   [ 🔔 Bell ] [ 👤 Profile ] */}
        {/* ========================================================================= */}
        <div className="md:hidden flex items-center justify-between h-12 px-3 w-full box-border">
          {/* Left: ☰ Mobile Drawer Toggle */}
          <button
            type="button"
            id="mobile-drawer-toggle-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:text-pink-600 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer shrink-0"
            title="เปิดเมนูหลักและสลับภาคเรียน"
            aria-label="เปิดเมนูหลัก"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: 🌸 MyGrade Logo + Semester Pill */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform truncate px-1"
          >
            <span className="text-base select-none">🌸</span>
            <h1 className="font-black text-lg bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              MyGrade
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shrink-0">
              {currentSemester === 'term1' ? 'เทอม 1' : 'เทอม 2'}
            </span>
          </div>

          {/* Right: Notification Bell & Profile Avatar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              id="mobile-notification-btn"
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer"
              title="การแจ้งเตือน"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[8px] font-black flex items-center justify-center shadow-2xs animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              id="mobile-profile-btn"
              onClick={() => {
                if (onOpenEditProfile) {
                  onOpenEditProfile();
                } else {
                  setActiveTab('profile');
                }
              }}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-pink-200 bg-pink-50 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
              title="แก้ไขโปรไฟล์นักเรียน"
              aria-label="แก้ไขโปรไฟล์นักเรียน"
            >
              <AvatarDisplay avatar={userProfile.avatar || '🌸'} size="sm" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP & TABLET HEADER (>= md:) */}
        {/* ========================================================================= */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Year info */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 cursor-pointer"
                >
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
                  id="navbar-student-badge-btn"
                  onClick={() => {
                    if (onOpenEditProfile) {
                      onOpenEditProfile();
                    } else {
                      setActiveTab('profile');
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-pink-600 transition-colors text-left group cursor-pointer"
                  title="คลิกเพื่อดูและแก้ไขโปรไฟล์นักเรียน"
                >
                  <span className="font-medium text-slate-400">ปี {academicYear.year}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 group-hover:text-pink-600 truncate max-w-[120px] sm:max-w-[180px] underline decoration-dotted underline-offset-2">
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
                onClick={() => {
                  if (onOpenThemeModal) {
                    onOpenThemeModal();
                  } else {
                    openThemeModal();
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs group active:scale-95 shrink-0"
                title="เปลี่ยนสีธีมของแอป"
                aria-label="เปลี่ยนสีธีมของแอป"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: themeColor }}
                />
                <Palette className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800" />
                <span className="hidden sm:inline">สีธีม</span>
              </button>

              {/* Profile Avatar Button */}
              <button
                type="button"
                id="navbar-profile-btn"
                onClick={() => {
                  if (onOpenEditProfile) {
                    onOpenEditProfile();
                  } else {
                    setActiveTab('profile');
                  }
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-pink-600 bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="จัดการและสลับโปรไฟล์นักเรียน"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <AvatarDisplay avatar={userProfile.avatar || '🌸'} size="sm" />
                </div>
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

      {/* ========================================================================= */}
      {/* MOBILE DRAWER / SLIDE-OVER SHEET (☰ Menu) */}
      {/* Full access to all features, profile, semester switcher & settings */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-[310px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-in-right p-4 space-y-4">
            <div className="space-y-4">
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌸</span>
                  <span className="font-black text-slate-900 text-base">เมนูและการตั้งค่า</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Profile Card in Drawer */}
              <div
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (onOpenEditProfile) onOpenEditProfile();
                  else setActiveTab('profile');
                }}
                className="p-3 bg-gradient-to-br from-pink-50/80 to-purple-50/80 rounded-2xl border border-pink-200/80 flex items-center justify-between gap-3 cursor-pointer hover:border-pink-300 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-pink-200 bg-white shadow-2xs shrink-0">
                    <AvatarDisplay avatar={userProfile.avatar || '🌸'} size="md" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 text-xs truncate">
                      {userProfile.fullName || academicYear.studentName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">
                      {userProfile.schoolName || academicYear.schoolName} • ชั้น {userProfile.gradeLevel || 'ม.5'}
                    </div>
                  </div>
                </div>
                <Edit3 className="w-4 h-4 text-pink-600 shrink-0" />
              </div>

              {/* Semester Switcher in Drawer */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block px-1">ภาคเรียนปัจจุบัน:</span>
                <div className="w-full flex justify-center">
                  <SemesterToggle size="md" className="w-full justify-center" />
                </div>
              </div>

              {/* Complete Navigation List */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block px-1 uppercase tracking-wider">
                  หน้าทั้งหมด
                </span>
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-50 text-pink-700 font-black shadow-2xs border border-pink-200/70'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick System Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onOpenThemeModal) onOpenThemeModal();
                    else openThemeModal();
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-slate-200/70 transition-all text-center cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-pink-500 mb-1" />
                  <span className="text-[10px] font-bold">สีธีม</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onOpenNotifications) onOpenNotifications();
                  }}
                  className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-slate-200/70 transition-all text-center cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-indigo-500 mb-1" />
                  <span className="text-[10px] font-bold">แจ้งเตือน</span>
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-pink-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-slate-200/70 transition-all text-center cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-[10px] font-bold">ตั้งค่า</span>
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-medium pt-1">
                🌸 MyGrade • ออกแบบเพื่อความสะดวกบนมือถือ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE FLOATING BOTTOM NAVIGATION (Twin design with Header) */}
      {/* 5 Essential Tabs: 🏠 Home | 📚 วิชา | ⏱️ อ่าน | 🎯 เป้าหมาย | 👤 โปรไฟล์ */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 z-40 bg-white/95 backdrop-blur-xl border border-pink-200/80 rounded-2xl p-1.5 shadow-lg shadow-pink-900/5 transition-all box-border">
        <div className="grid grid-cols-5 gap-1">
          {mobileBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-bottom-tab-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-90 ${
                  isActive
                    ? 'bg-pink-50 text-pink-700 font-black shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mb-0.5 transition-transform ${
                    isActive ? 'scale-110 text-pink-600' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight text-center font-bold truncate w-full">
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

