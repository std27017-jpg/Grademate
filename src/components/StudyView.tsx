import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  Flame,
  CheckCircle,
  Trophy,
  BookOpen,
  Clock,
  Calendar,
  BarChart2,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Coffee,
  Sparkles,
  Filter,
  ChevronRight,
  Award,
  Target,
  Search,
  Check,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { StudyTimerMode, StudySession, Subject, SubjectCategory } from '../types';
import { getSubjectColor } from '../utils/colorUtils';

type StudySubTab = 'timer' | 'analytics' | 'history' | 'categories';

const PRESET_MINUTES = [15, 25, 30, 45, 60, 90];

const QUICK_TOPIC_SUGGESTIONS = [
  'ทบทวนบทเรียน',
  'ทำโจทย์และแบบฝึกหัด',
  'สรุปเนื้อหาลงสมุด',
  'ติวข้อสอบกลางภาค',
  'ติวข้อสอบปลายภาค',
  'อ่านเตรียมตัวสอบย่อย',
  'จำสูตรและคำศัพท์',
];

export const StudyView: React.FC = () => {
  const {
    subjects,
    currentSemester,
    subjectCategories,
    addSubjectCategory,
    updateSubjectCategory,
    deleteSubjectCategory,
    studySessions,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    studyGoal,
    updateStudyGoal,
    selectedStudySubjectId,
    setSelectedStudySubjectId,
    todayStudyMinutes,
    weeklyStudyMinutes,
    studyStreakDays,
    topStudySubject,
    topStudyCategory,
    getCategoryForSubject,
    updateSubject,
  } = useGrade();

  const [activeSubTab, setActiveSubTab] = useState<StudySubTab>('timer');

  // Filter subjects for current semester
  const semesterSubjects = useMemo(() => {
    return subjects.filter((s) => s.semesterId === currentSemester);
  }, [subjects, currentSemester]);

  // Selected subject for study
  const [selectedSubjectId, setSelectedSubjectIdState] = useState<string>(() => {
    if (selectedStudySubjectId && semesterSubjects.some((s) => s.id === selectedStudySubjectId)) {
      return selectedStudySubjectId;
    }
    return semesterSubjects[0]?.id || '';
  });

  // Sync with context selectedStudySubjectId if set from outside
  useEffect(() => {
    if (selectedStudySubjectId) {
      setSelectedSubjectIdState(selectedStudySubjectId);
      setActiveSubTab('timer');
      setSelectedStudySubjectId(null);
    }
  }, [selectedStudySubjectId, setSelectedStudySubjectId]);

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || semesterSubjects[0] || null;
  }, [subjects, selectedSubjectId, semesterSubjects]);

  // Timer configuration
  const [timerMode, setTimerMode] = useState<StudyTimerMode>('pomodoro');
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('25');
  const [topic, setTopic] = useState<string>('');
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer runtime state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0); // For stopwatch
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60); // For countdown / pomodoro
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  // Post-session completion celebration modal
  const [completedSessionData, setCompletedSessionData] = useState<{
    subjectName: string;
    category: string;
    topic: string;
    minutes: number;
    notes: string;
  } | null>(null);

  // Category management modal / edit state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<SubjectCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    icon: string;
    color: string;
    description: string;
  }>({
    name: '',
    icon: '📚',
    color: 'pink',
    description: '',
  });

  // History filters
  const [historySubjectFilter, setHistorySubjectFilter] = useState<string>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // Web Audio Synth Chime
  const playChimeSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05 + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8 + idx * 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + 1.2 + idx * 0.1);
      });
    } catch {
      // Audio playback fails gracefully if browser blocks autoplay
    }
  };

  // Sync countdown target when mode or preset changes and timer is stopped
  const handleSelectPresetMinutes = (min: number) => {
    setTargetMinutes(min);
    setCustomMinutesInput(min.toString());
    if (!isRunning) {
      setSecondsRemaining(min * 60);
      setSecondsElapsed(0);
    }
  };

  const handleSelectTimerMode = (mode: StudyTimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    setIsPaused(false);
    setSecondsElapsed(0);
    if (mode === 'pomodoro') {
      setPomodoroPhase('work');
      setTargetMinutes(25);
      setSecondsRemaining(25 * 60);
    } else if (mode === 'custom' || mode === 'normal') {
      const min = parseInt(customMinutesInput) || 30;
      setTargetMinutes(min);
      setSecondsRemaining(min * 60);
    } else if (mode === 'short') {
      setTargetMinutes(15);
      setSecondsRemaining(15 * 60);
    } else if (mode === 'long') {
      setTargetMinutes(60);
      setSecondsRemaining(60 * 60);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (timerMode === 'normal' && targetMinutes === 0) {
          // Pure stopwatch (count up)
          setSecondsElapsed((prev) => prev + 1);
        } else {
          // Count down
          setSecondsElapsed((prev) => prev + 1);
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Timer finished!
              playChimeSound();
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timerMode, targetMinutes, pomodoroPhase]);

  // Handle auto completion when countdown reaches 0
  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);

    if (timerMode === 'pomodoro') {
      if (pomodoroPhase === 'work') {
        // Work phase finished -> prompt to log work, then switch to break
        finishAndSaveSession(targetMinutes);
        setPomodoroPhase('break');
        setTargetMinutes(5);
        setSecondsRemaining(5 * 60);
      } else {
        // Break phase finished -> switch back to work
        setPomodoroPhase('work');
        setTargetMinutes(25);
        setSecondsRemaining(25 * 60);
      }
    } else {
      finishAndSaveSession(Math.max(1, Math.round(targetMinutes)));
    }
  };

  // Start / Resume Timer
  const handleStartTimer = () => {
    if (!isRunning) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSessionStartTime(timeStr);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pause Timer
  const handlePauseTimer = () => {
    setIsPaused(true);
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSecondsElapsed(0);
    if (timerMode === 'pomodoro') {
      setPomodoroPhase('work');
      setTargetMinutes(25);
      setSecondsRemaining(25 * 60);
    } else {
      setSecondsRemaining(targetMinutes * 60);
    }
  };

  // Stop & Save Session
  const handleFinishEarly = () => {
    const minutesStudied = Math.max(1, Math.round(secondsElapsed / 60));
    finishAndSaveSession(minutesStudied);
    handleResetTimer();
  };

  // Common Save Session Routine
  const finishAndSaveSession = (durationMin: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const endTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const startTimeStr = sessionStartTime || endTimeStr;

    const subName = selectedSubject?.name || 'วิชาทั่วไป';
    const subCode = selectedSubject?.code;
    const cat = selectedSubject ? getCategoryForSubject(selectedSubject).name : 'ทั่วไป';

    const cleanTopic = topic.trim() || 'ทบทวนเนื้อหาประจำวัน';

    addStudySession({
      subjectId: selectedSubject?.id || 'other',
      subjectName: subName,
      subjectCode: subCode,
      category: cat,
      topic: cleanTopic,
      date: todayStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMinutes: durationMin,
      mode: timerMode,
      notes: studyNotes.trim() || undefined,
    });

    setCompletedSessionData({
      subjectName: subName,
      category: cat,
      topic: cleanTopic,
      minutes: durationMin,
      notes: studyNotes.trim(),
    });

    // Reset notes and topic for next session
    setStudyNotes('');
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTimeDisplay = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    if (hours > 0) {
      const h = String(hours).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  // Filtered Study History
  const filteredSessions = useMemo(() => {
    return studySessions.filter((s) => {
      if (historySubjectFilter !== 'all' && s.subjectId !== historySubjectFilter) return false;
      if (historyCategoryFilter !== 'all' && s.category !== historyCategoryFilter) return false;
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const matchTopic = s.topic.toLowerCase().includes(q);
        const matchName = s.subjectName.toLowerCase().includes(q);
        const matchNotes = s.notes ? s.notes.toLowerCase().includes(q) : false;
        if (!matchTopic && !matchName && !matchNotes) return false;
      }
      return true;
    });
  }, [studySessions, historySubjectFilter, historyCategoryFilter, historySearchQuery]);

  // Analytics breakdown by category
  const categoryStudyStats = useMemo(() => {
    const map: Record<string, { minutes: number; count: number }> = {};
    studySessions.forEach((s) => {
      const cat = s.category || 'ทั่วไป';
      if (!map[cat]) map[cat] = { minutes: 0, count: 0 };
      map[cat].minutes += s.durationMinutes;
      map[cat].count += 1;
    });

    const totalMin = Object.values(map).reduce((sum, item) => sum + item.minutes, 0);

    return Object.entries(map).map(([name, data]) => {
      const catObj = subjectCategories.find((c) => c.name === name);
      const percentage = totalMin > 0 ? Math.round((data.minutes / totalMin) * 100) : 0;
      return {
        categoryName: name,
        icon: catObj?.icon || '📚',
        color: catObj?.color || 'pink',
        minutes: data.minutes,
        count: data.count,
        percentage,
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [studySessions, subjectCategories]);

  // Last 7 days distribution
  const last7DaysData = useMemo(() => {
    const days: { dateStr: string; label: string; minutes: number }[] = [];
    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
      const minutes = studySessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      days.push({ dateStr, label, minutes });
    }
    return days;
  }, [studySessions]);

  const maxDayMinutes = Math.max(60, ...last7DaysData.map((d) => d.minutes));

  // Category modal handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      icon: '📚',
      color: 'pink',
      description: '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: SubjectCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      icon: cat.icon,
      color: cat.color || 'pink',
      description: cat.description || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      updateSubjectCategory({
        ...editingCategory,
        name: categoryForm.name.trim(),
        icon: categoryForm.icon.trim() || '📚',
        color: categoryForm.color,
        description: categoryForm.description.trim() || undefined,
      });
    } else {
      addSubjectCategory({
        name: categoryForm.name.trim(),
        icon: categoryForm.icon.trim() || '📚',
        color: categoryForm.color,
        description: categoryForm.description.trim() || undefined,
      });
    }

    setIsCategoryModalOpen(false);
  };

  // Progress percentage against daily goal
  const dailyProgressPercent = Math.min(100, Math.round((todayStudyMinutes / (studyGoal.dailyMinutes || 120)) * 100));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Quick Highlights */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหมดอ่านหนังสือ • พิชิตเกรดเป้าหมาย</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ตัวจับเวลาอ่านหนังสือ 📚
            </h1>
            <p className="text-pink-100 text-sm mt-1 max-w-xl">
              สร้างสมาธิ บันทึกเวลาอ่านจริงทุกวิชา และติดตามสถิติการเรียนเพื่อพัฒนาตัวเองอย่างต่อเนื่อง
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="text-center px-2">
              <span className="block text-[11px] text-pink-100 font-medium">วันนี้</span>
              <span className="text-xl sm:text-2xl font-black text-white">{todayStudyMinutes}</span>
              <span className="text-[10px] text-pink-200 block">นาที</span>
            </div>
            <div className="text-center px-2 border-x border-white/20">
              <span className="block text-[11px] text-pink-100 font-medium">สัปดาห์นี้</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {(weeklyStudyMinutes / 60).toFixed(1)}
              </span>
              <span className="text-[10px] text-pink-200 block">ชั่วโมง</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] text-pink-100 font-medium">Streak 🔥</span>
              <span className="text-xl sm:text-2xl font-black text-amber-200">{studyStreakDays}</span>
              <span className="text-[10px] text-pink-200 block">วันติด</span>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress Bar inside banner */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Target className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              เป้าหมายวันนี้: <strong>{todayStudyMinutes} / {studyGoal.dailyMinutes} นาที</strong> ({dailyProgressPercent}%)
            </span>
          </div>
          <div className="w-full sm:w-64 bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center justify-start overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('timer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeSubTab === 'timer'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>⏱️ ตัวจับเวลาอ่าน</span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeSubTab === 'analytics'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>📊 สถิติ & กราฟวิเคราะห์</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeSubTab === 'history'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 ประวัติการอ่าน ({studySessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            activeSubTab === 'categories'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>🏷️ จัดการหมวดหมู่วิชา ({subjectCategories.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTIVE STUDY TIMER TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Timer Display Card (Left Column) */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* Top Toolbar: Mode Badge & Sound Toggle */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
                  {timerMode === 'pomodoro'
                    ? pomodoroPhase === 'work'
                      ? '🍅 Pomodoro: ช่วงโฟกัสอ่าน'
                      : '☕ Pomodoro: ช่วงพักสายตา'
                    : timerMode === 'normal' && targetMinutes === 0
                    ? '⏱️ นาฬิกาจับเวลาทั่วไป'
                    : `⏳ นับถอยหลัง ${targetMinutes} นาที`}
                </span>
                {isRunning && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    กำลังจับเวลา
                  </span>
                )}
                {isPaused && (
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                    ⏸️ หยุดชั่วคราว
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  soundEnabled ? 'text-pink-600 bg-pink-50' : 'text-slate-400 bg-slate-100'
                }`}
                title={soundEnabled ? 'เปิดเสียงเตือน' : 'ปิดเสียงเตือน'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'เสียงเปิด' : 'เสียงปิด'}</span>
              </button>
            </div>

            {/* Selected Subject Banner in Timer */}
            {selectedSubject ? (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-xs"
                    style={{ backgroundColor: getSubjectColor(selectedSubject.color) }}
                  >
                    {getCategoryForSubject(selectedSubject).icon || '📚'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 text-base">
                        {selectedSubject.name}
                      </span>
                      {selectedSubject.code && (
                        <span className="text-xs text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {selectedSubject.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>🏷️ {getCategoryForSubject(selectedSubject).name}</span>
                      <span>•</span>
                      <span>🎯 เป้าหมาย: เกรด {selectedSubject.targetGrade}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const selectorEl = document.getElementById('subject-selector-card');
                    if (selectorEl) selectorEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-pink-600 font-bold hover:underline px-2 py-1 rounded-lg"
                >
                  เปลี่ยนวิชา
                </button>
              </div>
            ) : (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 text-xs text-amber-800 text-center font-medium">
                💡 กรุณาเลือกวิชาที่ต้องการอ่านจากรายการด้านขวาเพื่อเริ่มจับเวลา
              </div>
            )}

            {/* Reading Topic Input */}
            <div className="w-full max-w-md mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
                📖 หัวข้อที่อ่านในรอบนี้:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น แคลคูลัสบทที่ 3, ทบทวนศัพท์อังกฤษ, ตะลุยโจทย์ฟิสิกส์"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-pink-500 text-sm font-medium bg-white"
              />
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_TOPIC_SUGGESTIONS.slice(0, 4).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-600 transition-all"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Giant Circular Digital Timer Display */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer Circular Glow */}
              <div
                className={`w-56 h-56 sm:w-72 sm:h-72 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-500 relative ${
                  isRunning && !isPaused
                    ? 'border-pink-500 shadow-xl shadow-pink-500/20 animate-pulse'
                    : isPaused
                    ? 'border-amber-400 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                  {timerMode === 'normal' && targetMinutes === 0
                    ? formatTimeDisplay(secondsElapsed)
                    : formatTimeDisplay(secondsRemaining)}
                </div>

                <span className="text-xs text-slate-500 mt-2 font-medium">
                  {timerMode === 'pomodoro'
                    ? pomodoroPhase === 'work'
                      ? '⏱️ กำลังโฟกัส'
                      : '☕ พักผ่อน 5 นาที'
                    : isRunning
                    ? 'อ่านไปแล้ว ' + Math.floor(secondsElapsed / 60) + ' นาที'
                    : 'กดเริ่มเพื่อจับเวลา'}
                </span>
              </div>
            </div>

            {/* Timer Control Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-base shadow-lg shadow-pink-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>เริ่มจับเวลา</span>
                </button>
              ) : isPaused ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>อ่านต่อ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>พักชั่วคราว</span>
                </button>
              )}

              {/* Finish & Save Session Button */}
              {secondsElapsed > 0 && (
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>สิ้นสุดและบันทึก ({Math.max(1, Math.round(secondsElapsed / 60))} น.)</span>
                </button>
              )}

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetTimer}
                disabled={!isRunning && secondsElapsed === 0}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all disabled:opacity-40 cursor-pointer"
                title="รีเซ็ตเวลา"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">รีเซ็ต</span>
              </button>
            </div>

            {/* Study Reflection Notes (Optional) */}
            <div className="w-full max-w-md mt-6 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-600 mb-1 text-left">
                📝 โน้ตย่อ / สิ่งที่ได้เรียนรู้ (บันทึกลงประวัติ):
              </label>
              <textarea
                value={studyNotes}
                onChange={(e) => setStudyNotes(e.target.value)}
                placeholder="สรุปสั้นๆ เช่น ได้สูตรดิฟผลคูณ-ผลหาร, ท่องคำศัพท์ Unit 4 ครบ 20 คำ..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Right Configuration Column (Subject picker, Modes, Goals) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subject Selector Card */}
            <div id="subject-selector-card" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-pink-600" />
                  <span>เลือกวิชาที่ต้องการอ่าน</span>
                </h3>
                <span className="text-xs text-slate-400">เทอม {currentSemester === 'term1' ? '1' : '2'}</span>
              </div>

              {/* List of subjects in current semester */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {semesterSubjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  const cat = getCategoryForSubject(sub);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectIdState(sub.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <div className="truncate">
                          <p className={`text-xs truncate ${isSelected ? 'font-black text-pink-900' : 'font-bold text-slate-800'}`}>
                            {sub.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {sub.code || ''} • หมวด{cat.name}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                          เป้า {sub.targetGrade}
                        </span>
                      )}
                    </button>
                  );
                })}

                {semesterSubjects.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    ยังไม่มีวิชาในเทอมนี้ กรุณาเพิ่มวิชาในแท็บ "วิชา"
                  </p>
                )}
              </div>
            </div>

            {/* Mode & Duration Preset Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-600" />
                <span>โหมดการจับเวลา</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTimerMode('pomodoro')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    timerMode === 'pomodoro'
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg block mb-1">🍅</span>
                  <span className="text-xs block font-bold">Pomodoro</span>
                  <span className="text-[10px] text-slate-500 block">25 น. โฟกัส / 5 น. พัก</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTimerMode('normal')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    timerMode === 'normal'
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg block mb-1">⏱️</span>
                  <span className="text-xs block font-bold">นับถอยหลัง</span>
                  <span className="text-[10px] text-slate-500 block">กำหนดระยะเวลาเอง</span>
                </button>
              </div>

              {/* Preset Duration Buttons (if countdown mode) */}
              {timerMode !== 'pomodoro' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    เลือกระยะเวลา (นาที):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_MINUTES.map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => handleSelectPresetMinutes(min)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          targetMinutes === min
                            ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {min} นาที
                      </button>
                    ))}
                  </div>

                  {/* Custom minutes input */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutesInput}
                      onChange={(e) => {
                        setCustomMinutesInput(e.target.value);
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          handleSelectPresetMinutes(val);
                        }
                      }}
                      className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-center"
                      placeholder="เช่น 40"
                    />
                    <span className="text-xs text-slate-500">นาที หรือระบุเอง</span>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Goal Settings Card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-5 border border-pink-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-pink-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-pink-600" />
                  <span>เป้าหมายอ่านหนังสือประจำวัน</span>
                </h4>
                <span className="text-xs font-black text-pink-700">{studyGoal.dailyMinutes} นาที</span>
              </div>

              <div className="flex items-center gap-2">
                {[60, 90, 120, 150, 180].map((goalMin) => (
                  <button
                    key={goalMin}
                    type="button"
                    onClick={() => updateStudyGoal({ dailyMinutes: goalMin })}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      studyGoal.dailyMinutes === goalMin
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-white border-pink-200 text-pink-900 hover:bg-pink-100'
                    }`}
                  >
                    {goalMin / 60} ชม.
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDY ANALYTICS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">อ่านวันนี้</span>
                <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {todayStudyMinutes} <span className="text-sm font-semibold text-slate-500">นาที</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                เป้าหมาย {studyGoal.dailyMinutes} นาที ({dailyProgressPercent}%)
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">สัปดาห์นี้</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {(weeklyStudyMinutes / 60).toFixed(1)} <span className="text-sm font-semibold text-slate-500">ชั่วโมง</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                รวมทั้งหมด {studySessions.length} รอบอ่าน
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Streak ติดต่อกัน</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600">
                {studyStreakDays} <span className="text-sm font-semibold text-slate-500">วัน</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {studyStreakDays >= 3 ? '🔥 ไฟแรงมาก ทำต่อไปนะ!' : 'อ่านหนังสือทุกวันเพื่อสะสมสถิติ'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">วิชาที่อ่านมากสุด</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Trophy className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-black text-slate-900 truncate">
                {topStudySubject?.subjectName || 'ยังไม่มีข้อมูล'}
              </p>
              <p className="text-xs text-emerald-600 font-bold mt-1">
                {topStudySubject ? `${topStudySubject.minutes} นาที` : 'เริ่มอ่านเลย!'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Last 7 Days Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>เวลาอ่านหนังสือ 7 วันย้อนหลัง</span>
              </h3>

              <div className="space-y-3">
                {last7DaysData.map((d) => {
                  const percent = Math.min(100, Math.round((d.minutes / maxDayMinutes) * 100));
                  return (
                    <div key={d.dateStr} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{d.label}</span>
                        <span className="font-black text-slate-900">{d.minutes} นาที</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Time Breakdown by Category */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-600" />
                <span>สัดส่วนเวลาอ่านแยกตามหมวดหมู่วิชา</span>
              </h3>

              <div className="space-y-3">
                {categoryStudyStats.map((item) => (
                  <div key={item.categoryName} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span>{item.icon}</span>
                        <span>{item.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-pink-600">{item.minutes} นาที</span>
                        <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-pink-500 h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {categoryStudyStats.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-8">
                    ยังไม่มีสถิติการอ่านหนังสือ บันทึกเวลาอ่านรอบแรกเพื่อเริ่มดูการวิเคราะห์!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDY HISTORY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาหัวข้อ หรือวิชา..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full sm:w-56 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={historyCategoryFilter}
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {subjectCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              <select
                value={historySubjectFilter}
                onChange={(e) => setHistorySubjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="all">ทุกวิชา</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg shrink-0">
                    ⏱️
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-800 text-sm">
                        {sess.topic || 'ทบทวนเนื้อหา'}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {sess.subjectName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-semibold">
                        🏷️ {sess.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>📅 {sess.date}</span>
                      <span>⏰ {sess.startTime} - {sess.endTime || 'เสร็จสิ้น'}</span>
                      <span className="text-slate-600 font-medium">โหมด: {sess.mode}</span>
                    </div>

                    {sess.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100 italic">
                        "{sess.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-base font-black text-pink-600 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200">
                    +{sess.durationMinutes} นาที
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteStudySession(sess.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">ไม่พบประวัติการอ่านหนังสือ</p>
                <p className="text-xs text-slate-400 mt-1">เริ่มจับเวลาอ่านหนังสือในแท็บตัวจับเวลาได้เลย!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBJECT CATEGORIES MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                ระบบจัดการหมวดหมู่วิชา 🏷️
              </h3>
              <p className="text-xs text-slate-500">
                แบ่งกลุ่มวิชา ช่วยให้ค้นหาและจัดระเบียบตารางเรียนและเวลาอ่านหนังสือได้อย่างมีประสิทธิภาพ
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มหมวดหมู่ใหม่</span>
            </button>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectCategories.map((cat) => {
              // Count subjects in this category
              const countInCat = subjects.filter((s) => (s.category || '').toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!cat.isDefault && (
                          <button
                            type="button"
                            onClick={() => deleteSubjectCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-black text-slate-900 text-base">{cat.name}</h4>
                    {cat.description && (
                      <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">จำนวนวิชาในหมวดนี้</span>
                    <span className="font-black text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                      {countInCat} วิชา
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLETION CELEBRATION MODAL */}
      {/* ========================================================================= */}
      {completedSessionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4 max-h-[92vh] overflow-y-auto box-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-pink-500/30 animate-bounce">
              🎉
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ยอดเยี่ยมมาก! อ่านหนังสือสำเร็จ
              </h3>
              <p className="text-pink-600 text-sm font-bold mt-1">
                คุณอ่าน {completedSessionData.subjectName} ไปแล้ว {completedSessionData.minutes} นาที
              </p>
              <p className="text-xs text-slate-500 mt-2">
                หมวดหมู่: {completedSessionData.category} • หัวข้อ: {completedSessionData.topic}
              </p>
            </div>

            {completedSessionData.notes && (
              <div className="bg-slate-50 p-3 rounded-2xl text-left border border-slate-200 text-xs text-slate-700">
                <span className="font-bold block text-slate-900 mb-0.5">บันทึกของคุณ:</span>
                "{completedSessionData.notes}"
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCompletedSessionData(null)}
                className="w-full py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                เย้! บันทึกเรียบร้อย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto box-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? 'แก้ไขหมวดหมู่วิชา' : 'เพิ่มหมวดหมู่วิชาใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อหมวดหมู่วิชา *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วิทยาการคำนวณและหุ่นยนต์"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ไอคอน (Emoji หรือสัญลักษณ์)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 🤖, 🧪, 🎨"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['🧮', '🔬', '🌐', '🇹🇭', '🏛️', '💻', '🎨', '🏃', '💼', '📦', '🤖', '📐', '🧠'].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: ico })}
                      className="p-1.5 text-base rounded-lg bg-slate-100 hover:bg-pink-100"
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำอธิบายเพิ่มเติม
                </label>
                <input
                  type="text"
                  placeholder="เช่น รวมกลุ่มวิชาสายเทคโนโลยีและนวัตกรรม"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-sm"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
