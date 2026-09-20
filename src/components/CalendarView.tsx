import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Plus,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ListFilter,
  Check,
  Layers,
  MapPin,
  X,
  Target,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarItem,
  CalendarItemType,
  DayStudyStats,
  THAI_MONTHS_FULL,
  THAI_DAYS_WEEK_FULL,
  THAI_DAYS_WEEK_SHORT,
  formatThaiBuddhistDate,
  toDateKey,
  getMonthDaysGrid,
  getWeekDays,
  aggregateCalendarItems,
  generateSmartRecommendations,
} from '../utils/calendarUtils';
import { AddCalendarItemModal } from './calendar/AddCalendarItemModal';
import { DayDetailModal } from './calendar/DayDetailModal';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewProps {
  initialDate?: string | null;
  onNavigateToExams?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToStudy?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  initialDate,
  onNavigateToExams,
  onNavigateToTasks,
  onNavigateToStudy,
}) => {
  const {
    tasks,
    exams,
    studySessions,
    futureTodos,
    personalEvents,
    subjects,
    studyGoal,
    updateTask,
    deletePersonalEvent,
  } = useGrade();
  const { themeColor } = useTheme();

  // Current view mode
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Currently viewed month/reference date
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  // Selected date for day view and detail modal
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    if (initialDate) return initialDate;
    return toDateKey(new Date());
  });

  // Handle external initialDate change
  useEffect(() => {
    if (initialDate) {
      setSelectedDateKey(initialDate);
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    }
  }, [initialDate]);

  // Filters & Search
  const [activeTypeFilter, setActiveTypeFilter] = useState<CalendarItemType | 'all'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultDate, setAddModalDefaultDate] = useState<string>(toDateKey(new Date()));
  const [addModalDefaultType, setAddModalDefaultType] = useState<CalendarItemType>('task');
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

  // Today string key
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  // Aggregate unified calendar items & study statistics
  const { items: allItems, studyStatsByDate } = useMemo(() => {
    return aggregateCalendarItems({
      tasks,
      exams,
      studySessions,
      futureTodos,
      personalEvents,
      subjects,
    });
  }, [tasks, exams, studySessions, futureTodos, personalEvents, subjects]);

  // Filtered items based on activeTypeFilter, subject, and search query
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Type filter
      if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) {
        return false;
      }
      // Subject filter
      if (selectedSubjectFilter !== 'all' && item.subjectId !== selectedSubjectFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subjectName?.toLowerCase().includes(q) || false;
        const matchNotes = item.notes?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchSub && !matchNotes) return false;
      }
      return true;
    });
  }, [allItems, activeTypeFilter, selectedSubjectFilter, searchQuery]);

  // Items grouped by date for fast lookup in month & week views
  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [filteredItems]);

  // Today's summary statistics
  const todayItems = useMemo(() => {
    return allItems.filter((i) => i.date === todayKey);
  }, [allItems, todayKey]);

  const todayTasks = useMemo(() => todayItems.filter((i) => i.type === 'task'), [todayItems]);
  const todayExams = useMemo(() => todayItems.filter((i) => i.type === 'exam'), [todayItems]);
  const todayStudyMins = studyStatsByDate[todayKey]?.totalMinutes || 0;

  // Smart recommendations based on real data
  const recommendation = useMemo(() => {
    return generateSmartRecommendations({
      todayStr: todayKey,
      items: allItems,
      studyStatsByDate,
      dailyStudyGoal: studyGoal.dailyMinutes,
    });
  }, [todayKey, allItems, studyStatsByDate, studyGoal.dailyMinutes]);

  // Upcoming items within next 14 days
  const upcomingItems = useMemo(() => {
    const today = new Date(todayKey);
    return allItems
      .filter((i) => {
        if (!i.date) return false;
        const d = new Date(i.date);
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 14;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [allItems, todayKey]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day') {
        next.setDate(next.getDate() - 1);
        setSelectedDateKey(toDateKey(next));
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setMonth(next.getMonth() - 1);
      }
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day') {
        next.setDate(next.getDate() + 1);
        setSelectedDateKey(toDateKey(next));
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      return next;
    });
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateKey(toDateKey(today));
  };

  const handleDayClick = (dateKey: string) => {
    setSelectedDateKey(dateKey);
  };

  const handleToggleTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const isDone = task.status === 'completed' || task.status === 'submitted';
    const nextStatus = isDone ? 'todo' : 'completed';
    updateTask({ ...task, status: nextStatus });
    if (!isDone) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const selectedDayItems = useMemo(() => {
    return allItems.filter((i) => i.date === selectedDateKey);
  }, [allItems, selectedDateKey]);

  const selectedDayStudyStats = studyStatsByDate[selectedDateKey];

  const handleOpenAddModal = (dateStr?: string, type?: CalendarItemType) => {
    setAddModalDefaultDate(dateStr || selectedDateKey || toDateKey(new Date()));
    setAddModalDefaultType(type || 'task');
    setIsAddModalOpen(true);
  };

  // Month header text in Thai Buddhist
  const currentMonthName = THAI_MONTHS_FULL[currentDate.getMonth()];
  const currentBuddhistYear = currentDate.getFullYear() + 543;

  // Month days grid for month view
  const monthGridDays = useMemo(() => {
    return getMonthDaysGrid(currentDate);
  }, [currentDate]);

  // Week days for week view
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate);
  }, [currentDate]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span>ปฏิทินของฉัน</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            วางแผนงาน การสอบ และเวลาอ่านหนังสือในที่เดียว
          </p>
        </div>

        {/* Quick Add Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenAddModal(selectedDateKey)}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* 1. 📅 ปฏิทิน (CALENDAR SECTION - Controls, Filters, & Views) */}
      {/* 1.1 Controls & Navigation Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Month Navigator & Today Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-slate-800 px-2 min-w-[130px] text-center">
              {viewMode === 'day'
                ? formatThaiBuddhistDate(currentDate)
                : `${currentMonthName} ${currentBuddhistYear}`}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition-colors"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToday}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 transition-colors"
          >
            วันนี้
          </button>
        </div>

        {/* Right: View Mode Segmented Control */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'month'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เดือน
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'week'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัปดาห์
          </button>
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'day'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            วัน
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'agenda'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายการ
          </button>
        </div>
      </div>

      {/* 5. Filters & Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/70 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filter Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('task')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'task'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🔵 งาน ({allItems.filter((i) => i.type === 'task').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('exam')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'exam'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            🟣 สอบ ({allItems.filter((i) => i.type === 'exam').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('study')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'study'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🟢 อ่าน ({allItems.filter((i) => i.type === 'study').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('goal')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'goal'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            🟠 เป้าหมาย ({allItems.filter((i) => i.type === 'goal').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTypeFilter('personal')}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              activeTypeFilter === 'personal'
                ? 'bg-pink-600 text-white font-bold'
                : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
            }`}
          >
            🌸 กิจกรรม ({allItems.filter((i) => i.type === 'personal').length})
          </button>
        </div>

        {/* Subject Filter Dropdown & Search Input */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 shrink-0 max-w-[140px] sm:max-w-none"
          >
            <option value="all">ทุกวิชา</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 lg:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารายการ..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6. MAIN CALENDAR VIEWS */}

      {/* VIEW A: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-md overflow-hidden">
          {/* Day of Week Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/75 text-center text-xs font-bold text-slate-600">
            {THAI_DAYS_WEEK_FULL.map((dName, idx) => (
              <div
                key={dName}
                className={`py-2.5 sm:py-3 ${
                  idx >= 5 ? 'text-amber-600' : 'text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">{dName}</span>
                <span className="sm:hidden">{THAI_DAYS_WEEK_SHORT[idx]}</span>
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {monthGridDays.map(({ date, dateKey, isCurrentMonth }) => {
              const dayItems = itemsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;
              const studyStats = studyStatsByDate[dateKey];
              const heatLevel = studyStats?.heatLevel || 0;

              // Heatmap background tint class
              let heatmapClass = '';
              if (heatLevel === 1) heatmapClass = 'bg-emerald-500/10';
              else if (heatLevel === 2) heatmapClass = 'bg-emerald-500/20';
              else if (heatLevel === 3) heatmapClass = 'bg-emerald-500/35';
              else if (heatLevel === 4) heatmapClass = 'bg-emerald-500/50';

              return (
                <div
                  key={dateKey}
                  onClick={() => handleDayClick(dateKey)}
                  className={`min-h-[85px] sm:min-h-[120px] p-1 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                    !isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'hover:bg-blue-50/40'
                  } ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''} ${heatmapClass}`}
                >
                  {/* Top: Day Number & Study Heat Dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-xl transition-all ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-800 group-hover:text-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {studyStats && studyStats.totalMinutes > 0 && (
                      <span
                        className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-0.5"
                        title={`อ่านหนังสือ ${studyStats.totalMinutes} นาที`}
                      >
                        <Flame className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{studyStats.totalMinutes}น.</span>
                      </span>
                    )}
                  </div>

                  {/* Badges / Items preview */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {/* Desktop View: Mini pills */}
                    <div className="hidden sm:block space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${
                            item.type === 'task'
                              ? item.isCompleted
                                ? 'bg-slate-100 text-slate-400 line-through'
                                : 'bg-blue-100/80 text-blue-800'
                              : item.type === 'exam'
                              ? 'bg-purple-100/90 text-purple-900 font-bold'
                              : item.type === 'study'
                              ? 'bg-emerald-100/80 text-emerald-800'
                              : item.type === 'goal'
                              ? 'bg-amber-100/80 text-amber-800'
                              : 'bg-pink-100/80 text-pink-800'
                          }`}
                        >
                          <span className="text-[9px]">
                            {item.type === 'task'
                              ? '🔵'
                              : item.type === 'exam'
                              ? '🟣'
                              : item.type === 'study'
                              ? '🟢'
                              : item.type === 'goal'
                              ? '🟠'
                              : '🌸'}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <div className="text-[10px] font-bold text-slate-400 px-1">
                          +{dayItems.length - 3} รายการ
                        </div>
                      )}
                    </div>

                    {/* Mobile View: Compact colored dots */}
                    <div className="sm:hidden flex flex-wrap gap-1 items-center pt-1">
                      {dayItems.slice(0, 4).map((item) => (
                        <span
                          key={item.id}
                          className={`w-2 h-2 rounded-full ${
                            item.type === 'task'
                              ? 'bg-blue-500'
                              : item.type === 'exam'
                              ? 'bg-purple-600'
                              : item.type === 'study'
                              ? 'bg-emerald-500'
                              : item.type === 'goal'
                              ? 'bg-amber-500'
                              : 'bg-pink-500'
                          }`}
                        />
                      ))}
                      {dayItems.length > 4 && (
                        <span className="text-[9px] font-bold text-slate-500">
                          +{dayItems.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Study Heat Level Indicator bar on cell bottom */}
                  {heatLevel > 0 && (
                    <div
                      className={`h-1 w-full rounded-full mt-auto ${
                        heatLevel === 1
                          ? 'bg-emerald-300'
                          : heatLevel === 2
                          ? 'bg-emerald-400'
                          : heatLevel === 3
                          ? 'bg-emerald-500'
                          : 'bg-emerald-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Month View Legend */}
          <div className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-700">ประเภท:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>งาน</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>สอบ</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>อ่านหนังสือ</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>เป้าหมาย</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>กิจกรรม</span>
              </span>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Heatmap อ่านหนังสือ:</span>
              <span className="text-[11px] text-slate-400">น้อย</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-emerald-500/10 border border-emerald-200" title="1-30 นาที" />
                <span className="w-3 h-3 rounded-xs bg-emerald-500/25 border border-emerald-300" title="31-60 นาที" />
                <span className="w-3 h-3 rounded-xs bg-emerald-500/50 border border-emerald-400" title="61-120 นาที" />
                <span className="w-3 h-3 rounded-xs bg-emerald-500/80" title=">120 นาที" />
              </div>
              <span className="text-[11px] text-slate-400">มาก</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-md overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center">
              {weekDays.map(({ date, dateKey, dayName, dayNumber }) => {
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDateKey;
                return (
                  <div
                    key={dateKey}
                    onClick={() => handleDayClick(dateKey)}
                    className={`py-3 px-2 cursor-pointer transition-colors border-r last:border-r-0 border-slate-100 ${
                      isToday ? 'bg-blue-50/80' : isSelected ? 'bg-slate-100/70' : 'hover:bg-slate-100/50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-500">{dayName}</p>
                    <p
                      className={`text-base font-black mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        isToday ? 'bg-blue-600 text-white' : 'text-slate-800'
                      }`}
                    >
                      {dayNumber}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Week Columns */}
            <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[400px]">
              {weekDays.map(({ dateKey }) => {
                const dayItems = itemsByDate[dateKey] || [];
                const studyStats = studyStatsByDate[dateKey];
                return (
                  <div key={dateKey} className="p-2 space-y-2">
                    {studyStats && studyStats.totalMinutes > 0 && (
                      <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-bold text-center">
                        📖 {studyStats.totalMinutes} นาที
                      </div>
                    )}

                    {dayItems.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-300 text-xs py-8">
                        -
                      </div>
                    ) : (
                      dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleDayClick(dateKey)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                            item.type === 'task'
                              ? 'bg-blue-50/90 border-blue-200 text-blue-900'
                              : item.type === 'exam'
                              ? 'bg-purple-50/90 border-purple-200 text-purple-900'
                              : item.type === 'study'
                              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                              : item.type === 'goal'
                              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                              : 'bg-pink-50/90 border-pink-200 text-pink-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                            <span>
                              {item.type === 'task'
                                ? '🔵 งาน'
                                : item.type === 'exam'
                                ? '🟣 สอบ'
                                : item.type === 'study'
                                ? '🟢 อ่าน'
                                : item.type === 'goal'
                                ? '🟠 เป้าหมาย'
                                : '🌸 กิจกรรม'}
                            </span>
                            {item.time && <span>{item.time}</span>}
                          </div>
                          <p className="font-bold line-clamp-2">{item.title}</p>
                          {item.subjectName && (
                            <p className="text-[10px] mt-0.5 opacity-85 truncate">
                              {item.subjectName}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {formatThaiBuddhistDate(currentDate)}
              </h3>
              <p className="text-xs text-slate-500">
                มี {itemsByDate[selectedDateKey]?.length || 0} รายการในวันนี้
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddModal(selectedDateKey)}
              className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มในวันนี้</span>
            </button>
          </div>

          {/* Items for this specific day */}
          <div className="space-y-2.5">
            {!itemsByDate[selectedDateKey] || itemsByDate[selectedDateKey].length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  📅
                </div>
                <p className="text-sm font-bold text-slate-700">ยังไม่มีรายการในวันนี้</p>
                <p className="text-xs text-slate-400 mt-1">
                  คลิก "+ เพิ่มรายการ" เพื่อเริ่มวางแผนวันนี้นะ ✨
                </p>
              </div>
            ) : (
              itemsByDate[selectedDateKey].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleDayClick(selectedDateKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    item.type === 'task'
                      ? 'bg-blue-50/70 border-blue-100 hover:border-blue-200'
                      : item.type === 'exam'
                      ? 'bg-purple-50/70 border-purple-100 hover:border-purple-200'
                      : item.type === 'study'
                      ? 'bg-emerald-50/70 border-emerald-100 hover:border-emerald-200'
                      : item.type === 'goal'
                      ? 'bg-amber-50/70 border-amber-100 hover:border-amber-200'
                      : 'bg-pink-50/70 border-pink-100 hover:border-pink-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold">
                        {item.type === 'task'
                          ? '🔵 งาน'
                          : item.type === 'exam'
                          ? '🟣 สอบ'
                          : item.type === 'study'
                          ? '🟢 อ่านหนังสือ'
                          : item.type === 'goal'
                          ? '🟠 เป้าหมาย'
                          : '🌸 กิจกรรม'}
                      </span>
                      {item.subjectName && (
                        <span className="text-xs text-slate-600 font-semibold">
                          • {item.subjectName}
                        </span>
                      )}
                      {item.time && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    {item.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.notes}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 shrink-0">
                    {item.statusText || 'ดูรายละเอียด'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW D: AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-md p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span>รายการตามลำดับเวลา (Agenda)</span>
            </h3>
            <span className="text-xs text-slate-500">{filteredItems.length} รายการ</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                📋
              </div>
              <p className="text-sm font-bold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-slate-400 mt-1">
                ลองปรับตัวกรอง หรือเพิ่มรายการใหม่ลงในปฏิทิน
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(Object.entries(itemsByDate) as [string, CalendarItem[]][])
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([dateKey, dayItems]) => {
                  const isToday = dateKey === todayKey;
                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className="flex items-center gap-2 pt-2">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatThaiBuddhistDate(new Date(dateKey))}
                        </span>
                        {isToday && (
                          <span className="text-[11px] font-bold text-blue-600">★ วันนี้</span>
                        )}
                      </div>

                      <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                        {dayItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleDayClick(dateKey)}
                            className="p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span>
                                  {item.type === 'task'
                                    ? '🔵 งาน'
                                    : item.type === 'exam'
                                    ? '🟣 สอบ'
                                    : item.type === 'study'
                                    ? '🟢 อ่านหนังสือ'
                                    : item.type === 'goal'
                                    ? '🟠 เป้าหมาย'
                                    : '🌸 กิจกรรม'}
                                </span>
                                {item.subjectName && (
                                  <span className="font-semibold text-slate-700">
                                    • {item.subjectName}
                                  </span>
                                )}
                                {item.time && (
                                  <span className="text-slate-400 flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {item.time}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-slate-800 mt-0.5">{item.title}</p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0">
                              {item.statusText || 'ดู'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 🔔 กำลังจะมาถึง (Upcoming Strip)                                       */}
      {/* ========================================================================= */}
      {upcomingItems.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <span>🔔</span>
              <span>กำลังจะมาถึงใน 14 วัน</span>
            </h4>
            <span className="text-[11px] text-slate-400">{upcomingItems.length} รายการ</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {upcomingItems.map((item) => {
              const itemDate = new Date(item.date);
              const today = new Date(todayKey);
              const diffDays = Math.ceil((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const badgeText =
                diffDays === 0 ? 'วันนี้' : diffDays === 1 ? 'พรุ่งนี้' : `อีก ${diffDays} วัน`;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDayClick(item.date)}
                  className="shrink-0 p-2.5 rounded-2xl bg-slate-50/90 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 text-left transition-all active:scale-95 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        diffDays <= 1
                          ? 'bg-red-100 text-red-700'
                          : diffDays <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {badgeText}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.type === 'task'
                        ? '🔵 งาน'
                        : item.type === 'exam'
                        ? '🟣 สอบ'
                        : item.type === 'study'
                        ? '🟢 อ่าน'
                        : item.type === 'goal'
                        ? '🟠 เป้าหมาย'
                        : '🌸 กิจกรรม'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 max-w-[140px] truncate">
                    {item.title}
                  </p>
                  {item.subjectName && (
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {item.subjectName}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 📋 รายละเอียดของวันที่เลือก & 4. 📚 รายละเอียดงาน / สอบ / อ่านหนังสือ     */}
      {/* ========================================================================= */}
      <div
        id="selected-day-details"
        className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-md space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-800">
                  รายละเอียด: {formatThaiBuddhistDate(new Date(selectedDateKey))}
                </h3>
                {selectedDateKey === todayKey && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                    วันนี้
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                มี {selectedDayItems.length} รายการที่บันทึกไว้ในวันนี้
                {selectedDayStudyStats && selectedDayStudyStats.totalMinutes > 0 && (
                  <span className="ml-1.5 text-emerald-600 font-bold inline-flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-emerald-500 inline" />
                    อ่านแล้ว {selectedDayStudyStats.totalMinutes} นาที
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAddModal(selectedDateKey)}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายการวันนี้</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDayDetailOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              title="เปิดดูแบบหน้าต่างป๊อปอัป"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>เปิดป๊อปอัป</span>
            </button>
          </div>
        </div>

        {/* Selected Day Items List */}
        {selectedDayItems.length === 0 ? (
          <div className="py-7 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-2xs">
              📝
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">ไม่มีรายการงาน การสอบ หรือกิจกรรมในวันที่เลือก</p>
            <p className="text-xs text-slate-400 mt-0.5">
              คุณสามารถกดปุ่ม "เพิ่มรายการวันนี้" เพื่อบันทึกกำหนดส่งงานหรือตารางสอบ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDayItems.map((item) => {
              const isTask = item.type === 'task';
              const isExam = item.type === 'exam';
              const isStudy = item.type === 'study';
              const isGoal = item.type === 'goal';
              const isPersonal = item.type === 'personal';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isTask
                      ? item.isCompleted
                        ? 'bg-slate-50/80 border-slate-200 opacity-75'
                        : 'bg-blue-50/40 border-blue-200/70 hover:border-blue-300'
                      : isExam
                      ? 'bg-purple-50/40 border-purple-200/80 hover:border-purple-300'
                      : isStudy
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                      : isGoal
                      ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                      : 'bg-pink-50/40 border-pink-200/80 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isTask && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleTask(item.rawId, e)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            item.isCompleted
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'border-2 border-slate-300 hover:border-blue-500 text-transparent bg-white'
                          }`}
                          title={item.isCompleted ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                        >
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </button>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              isTask
                                ? 'bg-blue-100 text-blue-800'
                                : isExam
                                ? 'bg-purple-100 text-purple-800'
                                : isStudy
                                ? 'bg-emerald-100 text-emerald-800'
                                : isGoal
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {isTask
                              ? '🔵 งาน/การบ้าน'
                              : isExam
                              ? '🟣 การสอบ'
                              : isStudy
                              ? '🟢 อ่านหนังสือ'
                              : isGoal
                              ? '🟠 เป้าหมาย'
                              : '🌸 กิจกรรมส่วนตัว'}
                          </span>

                          {item.subjectName && (
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {item.subjectName}
                            </span>
                          )}

                          {item.time && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-0.5 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.time}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-sm font-bold text-slate-900 mt-1 truncate ${
                            item.isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isExam && onNavigateToExams && (
                        <button
                          type="button"
                          onClick={onNavigateToExams}
                          className="p-1.5 rounded-xl hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors cursor-pointer"
                          title="ดูในหน้ารายการสอบ"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isTask && onNavigateToTasks && (
                        <button
                          type="button"
                          onClick={onNavigateToTasks}
                          className="p-1.5 rounded-xl hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                          title="ดูในหน้ารายการงาน"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isPersonal && (
                        <button
                          type="button"
                          onClick={() => deletePersonalEvent(item.rawId)}
                          className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="ลบกิจกรรม"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Extra bottom tags (room, status, topics) */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/80">
                    <span className="text-[11px] text-slate-500">
                      {item.location ? `📍 ${item.location}` : item.statusText || ''}
                    </span>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ➕ ปุ่มเพิ่มรายการ / Quick Add                                          */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <span>➕</span>
            <span>เพิ่มรายการด่วน (Quick Add)</span>
          </h4>
          <span className="text-xs text-slate-400">เลือกประเภทที่ต้องการบันทึก</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddModal(selectedDateKey, 'task')}
            className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 text-blue-700 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="text-base">🔵</span>
            <span>+ การบ้าน/งาน</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal(selectedDateKey, 'exam')}
            className="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200/70 text-purple-700 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="text-base">🟣</span>
            <span>+ ตารางสอบ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onNavigateToStudy) onNavigateToStudy();
              else handleOpenAddModal(selectedDateKey, 'study');
            }}
            className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-700 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="text-base">🟢</span>
            <span>+ อ่านหนังสือ</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal(selectedDateKey, 'goal')}
            className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200/70 text-amber-700 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="text-base">🟠</span>
            <span>+ เป้าหมาย</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal(selectedDateKey, 'personal')}
            className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-pink-50/80 hover:bg-pink-100 border border-pink-200/70 text-pink-700 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="text-base">🌸</span>
            <span>+ กิจกรรม</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ส่วนรายละเอียดหรือสรุปอื่น ๆ ที่มีอยู่เดิม (Today Summary & Smart Advice) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Today Stats Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-xl border border-blue-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                สรุปข้อมูลวันนี้
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200/80 text-blue-800">
                {formatThaiBuddhistDate(new Date())}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1.5">
              {todayItems.length > 0 ? `มี ${todayItems.length} รายการวันนี้` : 'วันนี้ไม่มีนัดหมาย'}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-blue-100 text-xs font-medium text-slate-600 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>งาน {todayTasks.length}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>สอบ {todayExams.length}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>อ่าน {todayStudyMins}น.</span>
            </span>
          </div>
        </div>

        {/* Smart Recommendation Card */}
        <div className="md:col-span-2 p-4 rounded-3xl bg-linear-to-br from-amber-50/80 via-white/90 to-amber-50/60 backdrop-blur-xl border border-amber-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <span className="p-1 rounded-lg bg-amber-200/70 text-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span>แนะนำสำหรับวันนี้ (Smart Recommendation)</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-2 leading-relaxed">
            {recommendation.text}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-amber-100/60">
            <span className="text-[11px]">คำนวณจากงาน สอบ และเวลาอ่านหนังสือจริงในบัญชีคุณ</span>
            <button
              type="button"
              onClick={() => handleDayClick(todayKey)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>เลือกวันปัจจุบัน</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Modals */}
      <AddCalendarItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultDate={addModalDefaultDate}
        defaultType={addModalDefaultType}
      />

      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        dateKey={selectedDateKey}
        items={allItems}
        studyStats={studyStatsByDate[selectedDateKey]}
        onOpenAddItem={(d) => {
          setIsDayDetailOpen(false);
          handleOpenAddModal(d);
        }}
        onNavigateToExams={onNavigateToExams}
      />
    </div>
  );
};
