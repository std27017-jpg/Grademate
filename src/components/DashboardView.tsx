import React, { useState } from 'react';
import {
  Trophy,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Target,
  Plus,
  BookOpen,
  ArrowRight,
  Sparkles,
  Edit3,
  Check,
  User,
  Flame,
  CheckSquare,
  Square,
  FolderHeart,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { NavTab } from './Navbar';
import { getDaysRemaining, formatShortThaiDate } from '../utils/gradeCalculations';
import { Task, Subject } from '../types';
import { getSubjectColor } from '../utils/colorUtils';

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
    tasks,
    exams,
    userProfile,
    targetGpaAnalysis,
    futureChecklist,
    portfolioItems,
    todayStudyMinutes,
    studyGoal,
    studyStreakDays,
    topSubjectToday,
    topCategoryToday,
    updateTask,
    updateStudentName,
  } = useGrade();

  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [inlineName, setInlineName] = useState(userProfile.fullName || academicYear.studentName);

  // Filter tasks & exams for current semester
  const currentSemesterTasks = tasks.filter((t) => t.semesterId === currentSemester);
  const currentSemesterExams = exams.filter((e) => e.semesterId === currentSemester);

  // Active / pending tasks (sorted by due date, max 3)
  const pendingTasks = [...currentSemesterTasks]
    .filter((t) => t.status !== 'submitted' && t.status !== 'graded')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const topPendingTasks = pendingTasks.slice(0, 3);

  // Upcoming exams (sorted by date, max 2)
  const upcomingExams = [...currentSemesterExams]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 2);

  // Top focus recommendation from activeSemesterSummary
  const topFocusItem = activeSemesterSummary.focusAdvice[0];

  // Quick stats calculations
  const totalSubjects = activeSemesterSummary.subjectSummaries.length;
  const achievedTargets = activeSemesterSummary.subjectSummaries.filter(
    (s) => s.targetAchieved
  ).length;

  // Future checklist & portfolio stats
  const totalChecklist = futureChecklist.length;
  const completedChecklist = futureChecklist.filter((i) => i.isCompleted).length;
  const readinessPercent =
    totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const inPortfolioCount = portfolioItems.filter((i) => i.inPortfolio).length;

  // Smart daily suggestion message
  const getDailySuggestion = () => {
    if (topPendingTasks.length > 0) {
      const urgentTask = topPendingTasks[0];
      const days = getDaysRemaining(urgentTask.dueDate);
      if (days <= 2 && days >= 0) {
        return `มีงาน “${urgentTask.title}” ต้องส่ง${days === 0 ? 'วันนี้แล้ว!' : `ในอีก ${days} วัน`} รีบเคลียร์ให้เสร็จเพื่อไม่ให้เสียคะแนนเก็บ 30 แต้มนะคะ 🌸`;
      }
    }
    if (upcomingExams.length > 0) {
      const exam = upcomingExams[0];
      const days = getDaysRemaining(exam.examDate);
      if (days <= 7 && days >= 0) {
        return `ใกล้สอบ “${exam.subjectName} (${exam.title})” ในอีก ${days} วัน ทบทวนเนื้อหาและฝึกทำข้อสอบเก่าล่วงหน้านะคะ 📚`;
      }
    }
    if (topFocusItem) {
      return `วิชา “${topFocusItem.subject.name}” ยังขาดอีก ${topFocusItem.gapToTarget} คะแนนเพื่อพิชิตเกรด ${topFocusItem.subject.targetGrade} วางแผนเก็บคะแนนสอบรอบต่อไปนะคะ ✨`;
    }
    return `คุณกำลังทำผลงานได้ดีมาก! มีความพร้อมสู่เป้าหมาย ${readinessPercent}% รักษาความสม่ำเสมอนี้ไว้นะคะ 💖`;
  };

  const handleTaskCheckToggle = (task: Task) => {
    const isDone = task.status === 'submitted' || task.status === 'graded';
    updateTask({
      ...task,
      status: isDone ? 'todo' : 'submitted',
    });
    if (!isDone) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  const handleOpenSubjectPlan = (subject: Subject) => {
    if (onSelectSubjectDetail) {
      onSelectSubjectDetail(subject);
    } else {
      onNavigate('subjects');
    }
  };

  return (
    <div className="space-y-6 pb-6 text-left">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-indigo-50/50 rounded-3xl p-5 sm:p-6 border border-pink-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-pink-200 flex items-center justify-center text-2xl select-none shrink-0">
              {userProfile.avatar || '🌸'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingNameInline ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inlineName.trim()) {
                        updateStudentName(inlineName.trim());
                      }
                      setIsEditingNameInline(false);
                    }}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <span className="text-xl font-black text-slate-900">สวัสดี,</span>
                    <input
                      type="text"
                      value={inlineName}
                      onChange={(e) => setInlineName(e.target.value)}
                      autoFocus
                      className="px-3 py-1 rounded-xl bg-white text-slate-900 font-bold text-base border-2 border-pink-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingNameInline(false)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      สวัสดี, {userProfile.fullName || academicYear.studentName} 💗
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineName(userProfile.fullName || academicYear.studentName);
                        setIsEditingNameInline(true);
                      }}
                      className="p-1 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-100/50 transition-colors cursor-pointer"
                      title="แก้ไขชื่อ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {userProfile.schoolName || academicYear.schoolName} • ชั้น {userProfile.gradeLevel || 'ม.5'}/{userProfile.room || '1'} (เลขที่ {userProfile.studentNumber || '17'}) • ปี {academicYear.year}
              </p>
            </div>
          </div>

          {/* Cute Goal Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              onClick={() => onNavigate('future')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-100/90 text-pink-700 border border-pink-200 cursor-pointer hover:bg-pink-200/80 transition-colors shadow-2xs"
              title="คลิกเพื่อดูและปรับเกรดเป้าหมาย"
            >
              <Target className="w-3.5 h-3.5 text-pink-600" />
              <span>เป้าหมายเกรด {userProfile.targetGpa.toFixed(2)}</span>
            </span>

            {userProfile.dreamCareer && (
              <span
                onClick={() => onNavigate('future')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100/90 text-purple-700 border border-purple-200 cursor-pointer hover:bg-purple-200/80 transition-colors shadow-2xs"
                title="คลิกเพื่อดูเส้นทางสู่อาชีพในฝัน"
              >
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                <span>{userProfile.dreamCareer}</span>
              </span>
            )}

            {userProfile.dreamUniversities?.[0] && (
              <span
                onClick={() => onNavigate('future')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100/90 text-indigo-700 border border-indigo-200 cursor-pointer hover:bg-indigo-200/80 transition-colors shadow-2xs hidden sm:inline-flex"
                title="คลิกเพื่อดูเป้าหมายมหาวิทยาลัย"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{userProfile.dreamUniversities[0].faculty} ({userProfile.dreamUniversities[0].universityName})</span>
              </span>
            )}
          </div>
        </div>

        {/* Term 1 & Term 2 Toggle */}
        <div className="flex items-center justify-start md:justify-end shrink-0">
          <SemesterToggle size="md" />
        </div>
      </div>

      {/* Daily Suggestion Banner: "วันนี้ควรทำอะไรดี? 💡" */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50/90 via-pink-50/50 to-purple-50/40 border border-amber-200/80 shadow-2xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 flex-1">
          <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
            <span>วันนี้ควรทำอะไรดี? 💡</span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
              คำแนะนำประจำวัน
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {getDailySuggestion()}
          </p>
        </div>
      </div>

      {/* Today's Study Timer & Goal Progress Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                อ่านหนังสือวันนี้ 📚
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span>Streak {studyStreakDays} วัน</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {todayStudyMinutes > 0 ? (
                <span>
                  อ่านไปแล้ว <strong className="text-pink-600 font-black">{todayStudyMinutes} นาที</strong> จากเป้าหมาย {studyGoal.dailyTargetMinutes} นาที/วัน
                  {topSubjectToday && (
                    <span className="text-slate-400 ml-1">
                      (เน้นวิชา: <strong className="text-slate-700 font-bold">{topSubjectToday.name}</strong>)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  ยังไม่ได้เริ่มอ่านหนังสือวันนี้ • ตั้งเป้าหมายไว้ {studyGoal.dailyTargetMinutes} นาที/วัน
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar & Quick Action */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md justify-between md:justify-end">
          <div className="flex-1 space-y-1.5 hidden sm:block">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>ความคืบหน้า</span>
              <span>{Math.min(100, Math.round((todayStudyMinutes / (studyGoal.dailyTargetMinutes || 1)) * 100))}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((todayStudyMinutes / (studyGoal.dailyTargetMinutes || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('study')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Timer className="w-4 h-4" />
            <span>{todayStudyMinutes > 0 ? 'อ่านต่อเลย 🚀' : 'เริ่มจับเวลา ⏱️'}</span>
          </button>
        </div>
      </div>

      {/* 6 Compact Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: GPA */}
        <div
          onClick={() => onNavigate('analytics')}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">เกรดเฉลี่ย</span>
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {activeSemesterSummary.gpa.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              เป้าหมาย: {userProfile.targetGpa.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div
          onClick={() => onNavigate('subjects')}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">คะแนนเฉลี่ย</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {activeSemesterSummary.overallPercentage.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              เก็บแล้ว {activeSemesterSummary.totalEarnedScore} คะแนน
            </div>
          </div>
        </div>

        {/* Card 3: Goals */}
        <div
          onClick={() => onNavigate('subjects')}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">เป้าหมายวิชา</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {achievedTargets}/{totalSubjects}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold truncate">
              {achievedTargets === totalSubjects ? '✓ ถึงเป้าทุกวิชา' : `เหลือ ${totalSubjects - achievedTargets} วิชา`}
            </div>
          </div>
        </div>

        {/* Card 4: Top Focus */}
        <div
          onClick={() => topFocusItem && handleOpenSubjectPlan(topFocusItem.subject)}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">วิชาที่ควรเน้น</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-amber-700 tracking-tight truncate">
              {topFocusItem ? topFocusItem.subject.name : 'พร้อมทุกวิชา'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              {topFocusItem ? `ขาดอีก ${topFocusItem.gapToTarget} แต้ม` : 'เป็นไปตามเป้า'}
            </div>
          </div>
        </div>

        {/* Card 5: Readiness % */}
        <div
          onClick={() => onNavigate('future')}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">ความพร้อมอนาคต</span>
            <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-pink-600 tracking-tight">
              {readinessPercent}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              ทำแล้ว {completedChecklist}/{totalChecklist} ข้อ
            </div>
          </div>
        </div>

        {/* Card 6: Portfolio Items */}
        <div
          onClick={() => onNavigate('future')}
          className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Portfolio สะสม</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FolderHeart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700 tracking-tight">
              {inPortfolioCount} ชิ้น
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              ทั้งหมด {portfolioItems.length} ชิ้น
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Pill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={onOpenAddSubject}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-pink-600" />
          <span>+ เพิ่มวิชา</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-purple-600" />
          <span>+ เพิ่มงาน</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddExam}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ เพิ่มการสอบ</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('future')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <FolderHeart className="w-3.5 h-3.5 text-pink-600" />
          <span>+ เพิ่ม Portfolio</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('future')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xs hover:from-pink-600 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap active:scale-95 ml-auto"
        >
          <Target className="w-3.5 h-3.5" />
          <span>🎯 แผนสู่อนาคต</span>
        </button>
      </div>

      {/* Prominent Focus Card */}
      {topFocusItem && (
        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>วิชาที่ควรโฟกัสเป็นพิเศษ</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 truncate">
                {topFocusItem.subject.name}
                <span className="text-xs font-semibold text-slate-400 ml-2">
                  ({topFocusItem.subject.code})
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                <span className="font-bold text-amber-900">คำแนะนำ: </span>
                {topFocusItem.message} เหลือคะแนนให้เก็บอีก{' '}
                <span className="font-bold text-amber-800">
                  {topFocusItem.remainingPoints} คะแนน
                </span>{' '}
                (ขาดอีก {topFocusItem.gapToTarget} คะแนนเพื่อเกรด {topFocusItem.subject.targetGrade})
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSubjectPlan(topFocusItem.subject)}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <span>ดูแผนคะแนน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3 Focused Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. ภาพรวมคะแนน (Top 3 subjects) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">ภาพรวมคะแนน</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">3 วิชาล่าสุด</span>
            </div>

            <div className="space-y-2.5">
              {activeSemesterSummary.subjectSummaries.slice(0, 3).map((subSummary) => {
                const sub = subSummary.subject;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleOpenSubjectPlan(sub)}
                    className="p-3 rounded-2xl bg-slate-50/80 hover:bg-pink-50/30 border border-slate-200/60 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: getSubjectColor(sub.color) }}
                        />
                        <span className="text-xs font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate max-w-[140px]">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs">
                        เกรด {subSummary.estimatedGrade}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{subSummary.earnedScore} / 100 คะแนน</span>
                        <span>{subSummary.currentPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(100, subSummary.currentPercentage)}%`,
                            backgroundColor: getSubjectColor(sub.color),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeSemesterSummary.subjectSummaries.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ยังไม่มีรายวิชาในเทอมนี้
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('subjects')}
            className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูวิชาทั้งหมด ({totalSubjects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. งานใกล้ส่ง (Max 3 items with quick check) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">งานใกล้ส่ง</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ค้าง {pendingTasks.length} งาน
              </span>
            </div>

            <div className="space-y-2">
              {topPendingTasks.map((task) => {
                const sub = activeSemesterSummary.subjectSummaries.find(
                  (s) => s.subject.id === task.subjectId
                )?.subject;
                const days = getDaysRemaining(task.dueDate);
                const isUrgent = days <= 2 && days >= 0;

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-slate-50/80 hover:bg-purple-50/30 border border-slate-200/60 transition-all flex items-center gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleTaskCheckToggle(task)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                      title="กดเพื่อทำเครื่องหมายว่าส่งแล้ว"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {sub?.name || 'รายวิชา'} • ส่ง {formatShortThaiDate(task.dueDate)}
                      </p>
                    </div>
                    {isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                        {days === 0 ? 'วันนี้' : `อีก ${days} วัน`}
                      </span>
                    )}
                  </div>
                );
              })}

              {topPendingTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
                  <p>ไม่มีงานค้างส่งในขณะนี้ 🎉</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูงานทั้งหมด ({currentSemesterTasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. งาน/สอบที่ใกล้ที่สุด */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">การสอบที่ใกล้ที่สุด</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                รวม {currentSemesterExams.length} การสอบ
              </span>
            </div>

            <div className="space-y-2">
              {upcomingExams.map((exam) => {
                const days = getDaysRemaining(exam.examDate);
                const isPast = days < 0;

                return (
                  <div
                    key={exam.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                        {exam.subjectName}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isPast
                            ? 'bg-slate-200 text-slate-600'
                            : days <= 3
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {isPast ? 'สอบแล้ว' : days === 0 ? 'สอบวันนี้' : `อีก ${days} วัน`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{exam.title}</span>
                      <span>{formatShortThaiDate(exam.examDate)}</span>
                    </div>
                  </div>
                );
              })}

              {upcomingExams.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ไม่มีตารางสอบเร็ว ๆ นี้
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูตารางสอบทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
