import React, { useState } from 'react';
import { AppIcon, Icon, IconName } from './icons';
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

  // Primary desktop & tablet nav items using centralized icon system
  const navItems: { id: NavTab; label: string; iconName: IconName }[] = [
    { id: 'dashboard', label: 'หน้าหลัก', iconName: 'home' },
    { id: 'subjects', label: 'วิชา', iconName: 'subjects' },
    { id: 'study', label: 'อ่านหนังสือ', iconName: 'study' },
    { id: 'tasks', label: 'งาน', iconName: 'tasks' },
    { id: 'exams', label: 'สอบ', iconName: 'exams' },
    { id: 'future', label: 'อนาคต & เป้าหมาย', iconName: 'goals' },
    { id: 'analytics', label: 'วิเคราะห์', iconName: 'analytics' },
    { id: 'profile', label: 'โปรไฟล์', iconName: 'profile' },
  ];

  // Mobile Bottom Navigation 5 essential tabs
  const mobileBottomTabs: { id: NavTab; label: string; iconName: IconName }[] = [
    { id: 'dashboard', label: 'หน้าหลัก', iconName: 'home' },
    { id: 'subjects', label: 'วิชา', iconName: 'subjects' },
    { id: 'study', label: 'อ่านหนังสือ', iconName: 'study' },
    { id: 'future', label: 'เป้าหมาย', iconName: 'goals' },
    { id: 'profile', label: 'โปรไฟล์', iconName: 'profile' },
  ];

  // Drawer complete navigation items
  const drawerItems: { id: NavTab; label: string; iconName: IconName; desc: string }[] = [
    { id: 'dashboard', label: 'หน้าหลัก (Dashboard)', iconName: 'home', desc: 'สรุปผลและภาพรวมการเรียน' },
    { id: 'subjects', label: 'รายวิชา & คะแนนเก็บ', iconName: 'subjects', desc: 'บันทึกคะแนน 100 ช่อง & คำนวณเกรด' },
    { id: 'study', label: 'ตัวจับเวลาอ่านหนังสือ', iconName: 'study', desc: 'Pomodoro & สถิติเวลาอ่าน' },
    { id: 'tasks', label: 'งาน & การบ้าน', iconName: 'tasks', desc: 'ติดตามงานและกำหนดส่ง' },
    { id: 'exams', label: 'ตารางสอบ & หัวข้อ', iconName: 'exams', desc: 'นับถอยหลังวันสอบและเนื้อหา' },
    { id: 'future', label: 'วางแผนอนาคต & มหาวิทยาลัย', iconName: 'goals', desc: 'เป้าหมายเกรด อาชีพ และ Portfolio' },
    { id: 'analytics', label: 'วิเคราะห์สถิติผลการเรียน', iconName: 'analytics', desc: 'กราฟ GPA และเกรดรวม' },
    { id: 'comparison', label: 'เปรียบเทียบผลการเรียน', iconName: 'scale', desc: 'เปรียบเทียบข้ามเทอม' },
    { id: 'profile', label: 'ข้อมูลนักเรียน & ประวัติ', iconName: 'profile', desc: 'สายการเรียนและโรงเรียน' },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* HEADER: Fixed width 100%, Stable Height (56px mobile / 64px desktop)       */}
      {/* Guaranteed Zero Layout Shift, Zero Wobbly Motion                         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-colors box-border">
        {/* MOBILE HEADER (< md: 320px - 767px) */}
        <div className="md:hidden flex items-center justify-between h-14 px-3 w-full box-border">
          {/* Left: Menu Toggle Button with touch area >= 44px */}
          <button
            type="button"
            id="mobile-drawer-toggle-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-pink-600 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer shrink-0"
            title="เปิดเมนูหลัก"
            aria-label="เปิดเมนูหลัก"
          >
            <AppIcon name="menu" size={22} className="text-slate-800" />
          </button>

          {/* Center: Brand Logo & Semester badge */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform truncate px-1"
          >
            <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <AppIcon name="graduation" size={16} className="text-pink-600" />
            </div>
            <h1 className="font-black text-lg bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              MyGrade
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shrink-0">
              {currentSemester === 'term1' ? 'เทอม 1' : 'เทอม 2'}
            </span>
          </div>

          {/* Right: Notification Bell & Profile */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="mobile-notification-btn"
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-pink-600 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
              title="การแจ้งเตือน"
              aria-label="การแจ้งเตือน"
            >
              <AppIcon name="notification" size={18} className="text-slate-700" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

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
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-pink-200 bg-pink-50 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0 ml-0.5"
              title="แก้ไขโปรไฟล์นักเรียน"
              aria-label="แก้ไขโปรไฟล์นักเรียน"
            >
              <AvatarDisplay avatar={userProfile.avatar || '🌸'} size="sm" />
            </button>
          </div>
        </div>

        {/* TABLET & DESKTOP HEADER (>= md: 768px+) */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Student Summary */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <AppIcon name="graduation" size={22} className="text-white" />
              </div>
              <div>
                <div
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <h1 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      MyGrade
                    </span>
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 hidden lg:inline-block">
                    Student Grade Planner
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
                  <span className="font-semibold text-slate-700 group-hover:text-pink-600 truncate max-w-[140px] sm:max-w-[200px] underline decoration-dotted underline-offset-2">
                    {userProfile.fullName || academicYear.studentName} ({academicYear.studentClass})
                  </span>
                  <AppIcon name="edit" size={13} className="text-slate-400 group-hover:text-pink-600 opacity-70 shrink-0" />
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
                    <AppIcon
                      name={item.iconName}
                      size={15}
                      className={isActive ? 'text-pink-500' : 'text-slate-400'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Notifications, Theme & Profile buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                id="notification-bell-btn"
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-full text-slate-600 hover:text-pink-600 hover:bg-pink-50 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                title="ศูนย์แจ้งเตือน"
                aria-label="ศูนย์แจ้งเตือน"
              >
                <AppIcon name="notification" size={17} className="text-slate-700" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-bounce">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

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
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs group active:scale-95 shrink-0"
                title="เปลี่ยนสีธีมของแอป"
                aria-label="เปลี่ยนสีธีมของแอป"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs group-hover:scale-110 transition-transform shrink-0"
                  style={{ backgroundColor: themeColor }}
                />
                <AppIcon name="palette" size={15} className="text-slate-500 group-hover:text-slate-800" />
                <span className="hidden sm:inline">สีธีม</span>
              </button>

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
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-pink-600 bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="จัดการและสลับโปรไฟล์นักเรียน"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <AvatarDisplay avatar={userProfile.avatar || '🌸'} size="sm" />
                </div>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {userProfile.nickname || userProfile.fullName.split(' ')[0] || 'โปรไฟล์'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Row for Tablet View (md: to lg:) */}
        <div className="hidden md:flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1.5 scrollbar-none justify-center">
          {navItems.map((item) => {
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
                <AppIcon name={item.iconName} size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER / SLIDE-OVER SHEET (☰ Menu) */}
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
                  <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                    <AppIcon name="graduation" size={16} className="text-pink-600" />
                  </div>
                  <span className="font-black text-slate-900 text-base">เมนูทั้งหมด</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="ปิดเมนู"
                >
                  <AppIcon name="close" size={20} className="text-slate-500" />
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
                <AppIcon name="edit" size={16} className="text-pink-600 shrink-0" />
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <AppIcon
                            name={item.iconName}
                            size={16}
                            className={isActive ? 'text-white' : 'text-slate-600'}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
                        </div>
                      </div>
                      <AppIcon name="chevronRight" size={16} className="text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Buttons in Drawer */}
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
                  <AppIcon name="palette" size={18} className="text-pink-500 mb-1" />
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
                  <AppIcon name="notification" size={18} className="text-indigo-500 mb-1" />
                  <span className="text-[10px] font-bold">แจ้งเตือน</span>
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-pink-500" />
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
                  <AppIcon name="settings" size={18} className="text-slate-500 mb-1" />
                  <span className="text-[10px] font-bold">ตั้งค่า</span>
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-medium pt-1">
                MyGrade • Student Grade & Study Planner
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE FIXED BOTTOM NAVIGATION: 100% width, Safe Area, Zero Overflow       */}
      {/* 5 Essential Tabs: 🏠 Home | 📚 วิชา | ⏱️ อ่าน | 🎯 เป้าหมาย | 👤 โปรไฟล์ */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-[env(safe-area-inset-bottom,0px)] box-border"
      >
        <div className="max-w-md mx-auto w-full px-2 py-1">
          <div className="grid grid-cols-5 gap-1">
            {mobileBottomTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-bottom-tab-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
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
                    <AppIcon
                      name={item.iconName}
                      size={18}
                      className={isActive ? 'text-pink-600' : 'text-slate-400'}
                    />
                  </div>
                  <span className="text-[10px] leading-none text-center font-bold truncate w-full">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
