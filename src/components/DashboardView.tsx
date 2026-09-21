import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Calendar as CalendarIcon,
  Target,
  BookOpen,
  Sparkles,
  Edit3,
  Flame,
  CheckSquare,
  Square,
  Timer,
  CheckCircle2,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { useAiQuickFill } from '../context/AiQuickFillContext';
import { SemesterToggle } from './SemesterToggle';
import { NavTab } from './Navbar';
import { getDaysRemaining, formatShortThaiDate } from '../utils/gradeCalculations';
import { Task, Subject, Exam } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddScore: (subjectId?: string) => void;
  onOpenAddTask: () => void;
  onOpenAddExam: () => void;
  onOpenAddSubject: () => void;
  onOpenEditProfile?: () => void;
  onSelectSubjectDetail?: (subject: Subject) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddScore,
  onOpenAddTask,
  onOpenAddExam,
  onOpenAddSubject,
  onOpenEditProfile,
  onSelectSubjectDetail,
}) => {
  const {
    currentSemester,
    academicYear,
    activeSemesterSummary,
    subjects,
    tasks,
    exams,
    userProfile,
    todayStudyMinutes,
    studyGoal,
    studyStreakDays,
    updateTask,
    updateStudentName,
  } = useGrade();
  const { openAiQuickFill } = useAiQuickFill();

  // Inline name editing state
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [inlineName, setInlineName] = useState(userProfile.fullName || academicYear.studentName);

  // Current semester tasks & exams
  const currentSemesterTasks = useMemo(
    () => tasks.filter((t) => t.semesterId === currentSemester),
    [tasks, currentSemester]
  );
  const currentSemesterExams = useMemo(
    () => exams.filter((e) => e.semesterId === currentSemester),
    [exams, currentSemester]
  );

  // Pending tasks sorted by due date
  const pendingTasks = useMemo(
    () =>
      [...currentSemesterTasks]
        .filter((t) => t.status !== 'submitted' && t.status !== 'graded')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [currentSemesterTasks]
  );

  // Most urgent task
  const mostUrgentTask = pendingTasks[0] || null;
  const mostUrgentTaskDays = mostUrgentTask ? getDaysRemaining(mostUrgentTask.dueDate) : null;
  const mostUrgentTaskSubject = mostUrgentTask
    ? subjects.find((s) => s.id === mostUrgentTask.subjectId)
    : null;

  // Next closest exam
  const closestExam = useMemo(() => {
    const futureExams = [...currentSemesterExams]
      .filter((e) => getDaysRemaining(e.examDate) >= 0)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    return futureExams[0] || currentSemesterExams[0] || null;
  }, [currentSemesterExams]);

  const closestExamDays = closestExam ? getDaysRemaining(closestExam.examDate) : null;
  const closestExamSubject = closestExam
    ? subjects.find((s) => s.id === closestExam.subjectId)
    : null;

  // Focus / reading subject
  const topFocusSubject = activeSemesterSummary.focusAdvice[0]?.subject || subjects[0] || null;

  // GPA calculations
  const hasTargetGpa = typeof userProfile?.targetGpa === 'number' && userProfile.targetGpa > 0;
  const currentGpa = activeSemesterSummary.gpa || 0;
  const targetGpa = hasTargetGpa ? userProfile.targetGpa : 0;

  // Task check toggle with celebration
  const handleTaskCheckToggle = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDone = task.status === 'submitted' || task.status === 'graded';
    updateTask({
      ...task,
      status: isDone ? 'todo' : 'submitted',
    });
    if (!isDone) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.75 },
        });
      } catch (err) {
        // Fallback
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-8 text-left">
      {/* ========================================================================= */}
      {/* 1. HEADER: สวัสดี 👋 ชื่อผู้ใช้ + AI & Semester Switcher                   */}
      {/* ========================================================================= */}
      <div
        className="rounded-2xl p-4 border border-white/80 shadow-md flex items-center justify-between gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.75) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 24px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.10)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Profile shortcut */}
          <div
            onClick={() => {
              if (onOpenEditProfile) onOpenEditProfile();
              else onNavigate('profile');
            }}
            className="w-12 h-12 rounded-xl backdrop-blur-md border border-white/90 ring-1 ring-pink-500/25 shadow-xs flex items-center justify-center shrink-0 overflow-hidden cursor-pointer active:scale-95 transition-transform group relative"
            title="แก้ไขโปรไฟล์"
          >
            <AvatarDisplay
              avatar={userProfile.avatar || '🌸'}
              avatarUrl={userProfile.avatarUrl}
              size="full"
              shape="inherit"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Edit3 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Greeting & Name */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-slate-800">สวัสดี 👋</span>
              {isEditingNameInline ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inlineName.trim()) updateStudentName(inlineName.trim());
                    setIsEditingNameInline(false);
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={inlineName}
                    onChange={(e) => setInlineName(e.target.value)}
                    autoFocus
                    className="px-2 py-0.5 rounded-lg bg-white text-slate-900 font-bold text-xs sm:text-sm border-2 border-pink-400 focus:outline-none w-28"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded-lg bg-pink-600 text-white text-[10px] font-bold shadow-xs cursor-pointer"
                  >
                    บันทึก
                  </button>
                </form>
              ) : (
                <div className="inline-flex items-center gap-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
                    {userProfile.fullName || academicYear.studentName || 'เพื่อนนักเรียน'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setInlineName(userProfile.fullName || academicYear.studentName);
                      setIsEditingNameInline(true);
                    }}
                    className="p-1 text-slate-400 hover:text-pink-600 rounded-md transition-colors cursor-pointer"
                    title="แก้ไขชื่อ"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium truncate">
              {userProfile.studentClass
                ? `ชั้น ${userProfile.studentClass}`
                : userProfile.gradeLevel
                ? `ชั้น ${userProfile.gradeLevel}${userProfile.room ? `/${userProfile.room}` : ''}`
                : 'มัธยมศึกษา'}
              {userProfile.studentNumber ? ` เลขที่ ${userProfile.studentNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Action buttons: AI Quick Fill & Semester Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => openAiQuickFill({ scope: 'all' })}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-transform"
            style={{
              backgroundColor: 'var(--theme-primary, #db2777)',
              color: 'var(--theme-primary-foreground, #ffffff)',
            }}
            title="AI ช่วยกรอกข้อมูลด่วน"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">AI กรอกด่วน</span>
          </button>
          <SemesterToggle size="sm" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS 2x2 GRID:                                                        */}
      {/* [ GPA ]     [ เป้าหมาย GPA ]                                              */}
      {/* [ งาน ]     [ สอบใกล้ถึง ]                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* [ GPA ] */}
        <div
          onClick={() => onNavigate('analytics')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-white/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600">GPA</span>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: 'var(--theme-primary-soft, #fce7f3)',
                color: 'var(--theme-primary, #db2777)',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentGpa.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {activeSemesterSummary.totalCredits} หน่วยกิต
          </div>
        </div>

        {/* [ เป้าหมาย GPA ] */}
        <div
          onClick={() => onNavigate('future')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-bold text-purple-800">เป้าหมาย GPA</span>
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Target className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 tracking-tight">
            {hasTargetGpa ? targetGpa.toFixed(2) : '-.--'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-purple-700 font-bold truncate mt-0.5">
            {hasTargetGpa
              ? currentGpa >= targetGpa
                ? '✓ ถึงเป้าหมายแล้ว'
                : `ขาดอีก ${(targetGpa - currentGpa).toFixed(2)}`
              : 'แตะเพื่อตั้งเป้า'}
          </div>
        </div>

        {/* [ งาน ] */}
        <div
          onClick={() => onNavigate('tasks')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-bold text-amber-800">งาน</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
            {pendingTasks.length}{' '}
            <span className="text-xs sm:text-sm font-bold text-slate-600">งาน</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold truncate mt-0.5">
            {pendingTasks.length === 0 ? (
              <span className="text-emerald-700">ไม่มีงานค้าง</span>
            ) : mostUrgentTaskDays !== null && mostUrgentTaskDays <= 2 ? (
              <span className="text-rose-600 font-black">
                {mostUrgentTaskDays <= 0 ? 'ส่งวันนี้/เลยกำหนด' : `อีก ${mostUrgentTaskDays} วัน`}
              </span>
            ) : (
              <span className="text-amber-700">กำลังดำเนินการ</span>
            )}
          </div>
        </div>

        {/* [ สอบใกล้ถึง ] */}
        <div
          onClick={() => onNavigate('exams')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-indigo-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-bold text-indigo-800">สอบใกล้ถึง</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-900 tracking-tight truncate">
            {closestExamSubject?.name || 'ไม่มีสอบ'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-indigo-700 font-bold truncate mt-0.5">
            {closestExamDays !== null
              ? closestExamDays === 0
                ? 'สอบวันนี้!'
                : closestExamDays > 0
                ? `อีก ${closestExamDays} วัน (${formatShortThaiDate(closestExam.examDate)})`
                : 'สอบแล้ว'
              : 'ยังไม่มีกำหนดสอบ'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ✨ วันนี้ควรทำอะไร?                                                     */}
      {/* • งานที่ด่วนที่สุด                                                          */}
      {/* • สอบที่ใกล้ที่สุด                                                          */}
      {/* • สิ่งที่ควรอ่าน                                                           */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              วันนี้ควรทำอะไร?
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
            3 รายการหลัก
          </span>
        </div>

        <div className="space-y-2.5">
          {/* • 1. งานที่ด่วนที่สุด */}
          <div
            onClick={() => onNavigate('tasks')}
            className="p-3 rounded-xl bg-white/85 border border-amber-200/80 shadow-2xs hover:border-amber-300 transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] group"
          >
            {mostUrgentTask ? (
              <button
                type="button"
                onClick={(e) => handleTaskCheckToggle(mostUrgentTask, e)}
                className="text-slate-400 hover:text-emerald-600 mt-0.5 cursor-pointer shrink-0 transition-colors"
                title="กดเมื่อส่งงานแล้ว"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-slate-900 truncate">
                  {mostUrgentTask ? mostUrgentTask.title : 'ไม่มีงานค้างส่งในขณะนี้ 🎉'}
                </span>
                {mostUrgentTaskDays !== null && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                      mostUrgentTaskDays <= 0
                        ? 'bg-rose-500 text-white'
                        : mostUrgentTaskDays <= 2
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mostUrgentTaskDays <= 0
                      ? 'ส่งวันนี้/ด่วน'
                      : `อีก ${mostUrgentTaskDays} วัน`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {mostUrgentTask
                  ? `${mostUrgentTaskSubject?.name || 'รายวิชา'} • กำหนดส่ง ${formatShortThaiDate(
                      mostUrgentTask.dueDate
                    )}`
                  : 'การบ้านและงานทุกวิชาเรียบร้อยดี'}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
          </div>

          {/* • 2. สอบที่ใกล้ที่สุด */}
          <div
            onClick={() => onNavigate('exams')}
            className="p-3 rounded-xl bg-white/85 border border-indigo-200/80 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] group"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <CalendarIcon className="w-2.5 h-2.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-slate-900 truncate">
                  {closestExam
                    ? `สอบ: ${closestExamSubject?.name || 'รายวิชา'}`
                    : 'ไม่มีกำหนดการสอบเร็ว ๆ นี้ 📖'}
                </span>
                {closestExamDays !== null && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 shrink-0">
                    {closestExamDays === 0 ? 'สอบวันนี้!' : `อีก ${closestExamDays} วัน`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {closestExam
                  ? `${
                      closestExam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'
                    } • ${formatShortThaiDate(closestExam.examDate)} เวลา ${
                      closestExam.startTime || '09:00'
                    } น.`
                  : 'สามารถทบทวนบทเรียนล่วงหน้าได้เลย'}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
          </div>

          {/* • 3. สิ่งที่ควรอ่าน */}
          <div
            onClick={() => onNavigate('study')}
            className="p-3 rounded-xl bg-white/85 border border-emerald-200/80 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] group"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Timer className="w-2.5 h-2.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-slate-900 truncate">
                  อ่านหนังสือ: {topFocusSubject?.name || 'ทบทวนวิชาที่ควรเน้น'}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                  <span>{studyStreakDays} วัน</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                วันนี้อ่านแล้ว {todayStudyMinutes}/{studyGoal.dailyTargetMinutes} นาที •{' '}
                {todayStudyMinutes >= studyGoal.dailyTargetMinutes
                  ? 'ครบตามเป้าหมายแล้ว 🌟'
                  : `ขาดอีก ${Math.max(
                      0,
                      studyGoal.dailyTargetMinutes - todayStudyMinutes
                    )} นาที`}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. QUICK ACTIONS: 2x2 GRID                                                */}
      {/* [ 📚 วิชา ] [ 📝 งาน ]                                                    */}
      {/* [ 📅 สอบ  ] [ 📖 อ่าน ]                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* [ 📚 วิชา ] */}
        <button
          type="button"
          onClick={() => onNavigate('subjects')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-pink-100 shadow-xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              📚 วิชา
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {subjects.length} วิชา • คะแนนเก็บ
            </span>
          </div>
        </button>

        {/* [ 📝 งาน ] */}
        <button
          type="button"
          onClick={() => onNavigate('tasks')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-amber-100 shadow-xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              📝 งาน
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {pendingTasks.length} ค้าง • ส่งการบ้าน
            </span>
          </div>
        </button>

        {/* [ 📅 สอบ ] */}
        <button
          type="button"
          onClick={() => onNavigate('exams')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-indigo-100 shadow-xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              📅 สอบ
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {currentSemesterExams.length} สอบ • ตารางสอบ
            </span>
          </div>
        </button>

        {/* [ 📖 อ่าน ] */}
        <button
          type="button"
          onClick={() => onNavigate('study')}
          className="glass-card p-3 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Timer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
              📖 อ่าน
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              Pomodoro • บันทึกเวลา
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. จบหน้า Dashboard                                                       */}
      {/* ========================================================================= */}
    </div>
  );
};
