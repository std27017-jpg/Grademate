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
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { NavTab } from './Navbar';
import { getDaysRemaining, formatShortThaiDate } from '../utils/gradeCalculations';
import { Task, Subject } from '../types';
import { getSubjectColor } from '../utils/colorUtils';
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

  // Active / pending tasks (sorted by due date)
  const pendingTasks = [...currentSemesterTasks]
    .filter((t) => t.status !== 'submitted' && t.status !== 'graded')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const topPendingTasks = pendingTasks.slice(0, 3);

  // Urgent tasks (due in <= 2 days or overdue)
  const urgentTasks = pendingTasks.filter((t) => {
    const days = getDaysRemaining(t.dueDate);
    return days <= 2;
  });

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

  // Calculate target progress percentage (Current GPA / Target GPA)
  const targetProgressPercent = Math.min(
    100,
    Math.round(((activeSemesterSummary.gpa || 0) / (userProfile.targetGpa || 4.0)) * 100)
  );

  // Dynamic Teen Motivational Message based on actual student status
  const getTeenMotivationalMessage = () => {
    if (todayStudyMinutes >= studyGoal.dailyTargetMinutes && studyGoal.dailyTargetMinutes > 0) {
      return {
        text: 'เก่งมาก! วันนี้ทำครบตามเป้าหมายแล้ว 🎉',
        tone: 'success',
      };
    }
    if (activeSemesterSummary.gpa >= userProfile.targetGpa && activeSemesterSummary.gpa > 0) {
      return {
        text: 'สุดยอดมาก! เกรดเฉลี่ยปัจจุบันถึงเป้าหมายแล้ว 🏆',
        tone: 'success',
      };
    }
    const gpaGap = Number((userProfile.targetGpa - activeSemesterSummary.gpa).toFixed(2));
    if (gpaGap > 0 && gpaGap <= 0.35) {
      return {
        text: `อีกนิดเดียวก็ถึงเกรดเป้าหมายแล้ว! (ขาดอีกเพียง ${gpaGap.toFixed(2)}) ✨`,
        tone: 'accent',
      };
    }
    if (urgentTasks.length > 0) {
      return {
        text: `วันนี้มีงานใกล้ครบกำหนด ${urgentTasks.length} งานนะ อย่าลืมส่งให้ทัน 📝`,
        tone: 'urgent',
      };
    }
    if (todayStudyMinutes < studyGoal.dailyTargetMinutes) {
      return {
        text: 'มาอ่านหนังสืออีกนิดเพื่อพิชิตเป้าหมายวันนี้กัน 📚',
        tone: 'info',
      };
    }
    return {
      text: 'ตั้งใจเรียนและบันทึกคะแนนเก็บอย่างสม่ำเสมอนะคะ 💖',
      tone: 'info',
    };
  };

  const motivational = getTeenMotivationalMessage();

  const handleTaskCheckToggle = (task: Task) => {
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
    <div className="space-y-6 pb-12 text-left">
      {/* ========================================================================= */}
      {/* SECTION 1: HEADER & USER PROFILE WITH LIQUID GLASS BANNER                 */}
      {/* ========================================================================= */}
      <div
        className="rounded-3xl p-5 sm:p-6 border border-white/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 12px 36px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.12), 0 2px 8px 0 rgba(0,0,0,0.03)',
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div
              onClick={() => {
                if (onOpenEditProfile) {
                  onOpenEditProfile();
                } else {
                  onNavigate('profile');
                }
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] backdrop-blur-md border border-white/80 ring-1 ring-pink-500/20 shadow-sm flex items-center justify-center select-none shrink-0 overflow-hidden cursor-pointer hover:border-pink-400 hover:ring-pink-500/40 hover:shadow-md transition-all active:scale-95 group relative"
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
              }}
              title="ดูและแก้ไขรูปโปรไฟล์"
            >
              <AvatarDisplay
                avatar={userProfile.avatar || '🌸'}
                avatarUrl={userProfile.avatarUrl}
                size="full"
                shape="inherit"
                className="w-full h-full [border-radius:inherit]"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit',
                }}
              />
              <div
                className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none"
                style={{ borderRadius: 'inherit' }}
              >
                <Edit3 className="w-4 h-4 drop-shadow-md text-white" />
              </div>
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
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      สวัสดี, {userProfile.fullName || academicYear.studentName || 'ยังไม่ได้กรอกข้อมูล'} 💗
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineName(userProfile.fullName || academicYear.studentName);
                        setIsEditingNameInline(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-pink-600 rounded-xl hover:bg-pink-100 transition-colors cursor-pointer"
                      title="แก้ไขชื่อ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {userProfile.schoolName || academicYear.schoolName || 'ยังไม่ได้กรอกข้อมูล'} •{' '}
                {userProfile.studentClass
                  ? `ชั้น ${userProfile.studentClass}`
                  : userProfile.gradeLevel
                  ? `ชั้น ${userProfile.gradeLevel}${userProfile.room ? `/${userProfile.room}` : ''}`
                  : 'ยังไม่ได้ระบุชั้น'}
                {userProfile.studentNumber ? ` (เลขที่ ${userProfile.studentNumber})` : ''} • ปีการศึกษา{' '}
                {academicYear.year}
              </p>
            </div>
          </div>

          {/* Teen Motivational Encouragement Banner */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs border bg-white/95 text-slate-800 border-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>{motivational.text}</span>
            </div>
          </div>
        </div>

        {/* Semester Switcher */}
        <div className="flex items-center justify-start md:justify-end shrink-0">
          <SemesterToggle size="md" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 🎯 เกรดเป้าหมาย (HERO TARGET GPA CARD)                          */}
      {/* ========================================================================= */}
      <div
        onClick={() => onNavigate('future')}
        className="rounded-3xl p-5 sm:p-6 border border-white/85 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.68) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 14px 40px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.15), 0 2px 8px 0 rgba(0,0,0,0.03)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-pink-700">
                เกรดเป้าหมาย (Target GPA)
              </span>
              {activeSemesterSummary.gpa >= userProfile.targetGpa && activeSemesterSummary.gpa > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ ถึงเป้าหมายแล้ว
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {userProfile.targetGpa.toFixed(2)}
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                <span>เกรดปัจจุบัน: </span>
                <strong className="text-slate-900 font-black text-base">
                  {activeSemesterSummary.gpa.toFixed(2)}
                </strong>
                {targetGpaAnalysis.pointsNeededMessage && (
                  <span className="block text-[11px] text-pink-700 font-bold mt-0.5">
                    {targetGpaAnalysis.pointsNeededMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Target badges for Career and University */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {userProfile.dreamCareer ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <Briefcase className="w-3 h-3 text-purple-600" />
                  <span>{userProfile.dreamCareer}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>ยังไม่ได้ระบุอาชีพในฝัน</span>
                </span>
              )}

              {userProfile.dreamUniversities?.[0]?.faculty ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                  <span>
                    {userProfile.dreamUniversities[0].faculty} ({userProfile.dreamUniversities[0].universityName})
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Progress Bar & Quick Adjust Button */}
          <div className="w-full md:w-64 space-y-2 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>ความคืบหน้าสู่เป้าหมาย</span>
              <span className="text-pink-600 font-black">{targetProgressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700"
                style={{ width: `${targetProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold">
              <span>0.00</span>
              <span>เป้าหมาย {userProfile.targetGpa.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: 4-METRIC QUICK STAT GRID (2x2 Mobile, 4 Cols Desktop)          */}
      {/* 📊 GPA | 📚 เวลาอ่าน | 📝 งาน | 🎓 พอร์ต                                  */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span>ภาพรวมสถิติ</span>
          </h3>
          <span className="text-xs text-slate-600 font-bold">เทอม {currentSemester === 'term1' ? '1' : '2'}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: 📊 GPA */}
          <div
            onClick={() => onNavigate('analytics')}
            className="bg-white p-4 rounded-3xl border border-pink-200/90 shadow-2xs hover:shadow-sm hover:border-pink-400 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">📊 GPA เทอมนี้</span>
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {activeSemesterSummary.gpa.toFixed(2)}
              </div>
              <div className="text-xs text-slate-600 font-bold truncate mt-0.5">
                เป้าหมาย: <strong className="text-pink-600 font-black">{userProfile.targetGpa.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: 📚 อ่านหนังสือ */}
          <div
            onClick={() => onNavigate('study')}
            className="bg-white p-4 rounded-3xl border border-emerald-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">📚 อ่านวันนี้</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Timer className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {todayStudyMinutes}{' '}
                <span className="text-sm font-bold text-slate-600">นาที</span>
              </div>
              <div className="text-xs text-emerald-700 font-bold truncate mt-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
                <span>Streak {studyStreakDays} วันต่อเนื่อง</span>
              </div>
            </div>
          </div>

          {/* Card 3: 📝 งานค้าง */}
          <div
            onClick={() => onNavigate('tasks')}
            className="bg-white p-4 rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-sm hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">📝 งานค้างส่ง</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {pendingTasks.length}{' '}
                <span className="text-sm font-bold text-slate-600">งาน</span>
              </div>
              <div className="text-xs text-amber-700 font-bold truncate mt-0.5">
                {urgentTasks.length > 0 ? (
                  <span className="text-rose-600 font-black">ด่วน {urgentTasks.length} งาน</span>
                ) : (
                  <span>เรียบร้อยดี</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: 🎓 พอร์ตโฟลิโอ */}
          <div
            onClick={() => onNavigate('future')}
            className="bg-white p-4 rounded-3xl border border-purple-200/90 shadow-2xs hover:shadow-sm hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">🎓 พอร์ตสะสม</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <FolderHeart className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {inPortfolioCount}{' '}
                <span className="text-sm font-bold text-slate-600">ชิ้น</span>
              </div>
              <div className="text-xs text-purple-700 font-bold truncate mt-0.5">
                ความพร้อม {readinessPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: 📌 วันนี้ควรทำอะไร? (WHAT TO DO TODAY! ACTION CARDS)          */}
      {/* 🔴 ด่วน | 🟠 ควรทำวันนี้ | 🟢 ทำเมื่อมีเวลา                              */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <h3 className="text-base font-black text-slate-900">วันนี้ควรทำอะไร?</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
              ภารกิจประจำวัน
            </span>
          </div>
          <span className="text-xs text-slate-600 font-bold">อัปเดตตามข้อมูลจริง</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 🔴 ด่วน */}
          <div className="bg-white rounded-3xl p-5 border-2 border-rose-200 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>🔴 ด่วน</span>
                </div>
                <span className="text-xs font-bold text-rose-700">
                  {urgentTasks.length > 0 ? `${urgentTasks.length} รายการ` : 'ไม่มีงานด่วน'}
                </span>
              </div>

              {urgentTasks.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {urgentTasks.slice(0, 2).map((task) => {
                    const days = getDaysRemaining(task.dueDate);
                    const sub = activeSemesterSummary.subjectSummaries.find(
                      (s) => s.subject.id === task.subjectId
                    )?.subject;

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => handleTaskCheckToggle(task)}
                          className="text-rose-500 hover:text-emerald-600 mt-0.5 cursor-pointer shrink-0 transition-colors"
                          title="กดเมื่อส่งงานแล้ว"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 truncate">{task.title}</p>
                          <p className="text-[11px] text-slate-600 font-semibold truncate">
                            {sub?.name || 'รายวิชา'} • กำหนดส่ง {formatShortThaiDate(task.dueDate)}
                          </p>
                          <span className="inline-block text-[10px] font-black px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 mt-1">
                            {days < 0 ? 'เกินกำหนดส่ง' : days === 0 ? 'ส่งวันนี้!' : `อีก ${days} วัน`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">ไม่มีงานเร่งด่วนในขณะนี้</p>
                  <p className="text-[11px] text-slate-500">คุณจัดการเวลาได้ยอดเยี่ยมมาก! ✨</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="w-full py-2 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-rose-200"
            >
              <span>ดูงานทั้งหมด ({currentSemesterTasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: 🟠 ควรทำวันนี้ */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>🟠 ควรทำวันนี้</span>
                </div>
                <span className="text-xs font-bold text-amber-800">แนะนำสำหรับคุณ</span>
              </div>

              <div className="space-y-2 pt-1">
                {/* Study target item */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">อ่านหนังสือทบทวนบทเรียน</span>
                    <span className="text-[11px] font-bold text-amber-800">
                      {todayStudyMinutes} / {studyGoal.dailyTargetMinutes} น.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    {todayStudyMinutes >= studyGoal.dailyTargetMinutes
                      ? 'ครบเป้าหมายอ่านหนังสือวันนี้แล้ว 🎉'
                      : `ขาดอีก ${studyGoal.dailyTargetMinutes - todayStudyMinutes} นาทีเพื่อพิชิตเป้าหมาย`}
                  </p>
                </div>

                {/* Focus subject or upcoming exam */}
                {topFocusItem ? (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate">
                        วิชา: {topFocusItem.subject.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900">
                        เน้นพิเศษ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      ขาดอีก {topFocusItem.gapToTarget} คะแนนเพื่อเกรด {topFocusItem.subject.targetGrade}
                    </p>
                  </div>
                ) : upcomingExams[0] ? (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      ใกล้สอบ: {upcomingExams[0].subjectName}
                    </span>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      สอบวันที่ {formatShortThaiDate(upcomingExams[0].examDate)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('study')}
              className="w-full py-2 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-amber-200"
            >
              <span>เริ่มจับเวลาอ่านหนังสือ ⏱️</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: 🟢 ทำเมื่อมีเวลา */}
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🟢 ทำเมื่อมีเวลา</span>
                </div>
                <span className="text-xs font-bold text-emerald-800">วางแผนอนาคต</span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">อัปเดต Portfolio & กิจกรรม</span>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    สะสมแล้ว {inPortfolioCount} ชิ้นงาน • เพิ่มผลงานเพื่อยื่นรอบพอร์ต TCAS
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">ตรวจเช็กเกรดและเป้าหมาย</span>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    ความพร้อมสู่เป้าหมาย {readinessPercent}% (ทำแล้ว {completedChecklist}/{totalChecklist} ข้อ)
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('future')}
              className="w-full py-2 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-emerald-200"
            >
              <span>ไปที่แฟ้มสะสมผลงาน 🎓</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: QUICK ACTIONS (PILL SHORTCUTS)                                 */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={onOpenAddSubject}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-pink-600 stroke-[3]" />
          <span>+ เพิ่มวิชา</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
          <span>+ เพิ่มงาน</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddExam}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
          <span>+ เพิ่มการสอบ</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('future')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-white hover:bg-pink-50 text-pink-700 border-2 border-pink-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <FolderHeart className="w-3.5 h-3.5 text-pink-600" />
          <span>+ เพิ่ม Portfolio</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('future')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs hover:from-pink-700 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap active:scale-95 ml-auto"
        >
          <Target className="w-3.5 h-3.5" />
          <span>🎯 แผนสู่อนาคต</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: คะแนน & วิชาที่ควรโฟกัส (ACADEMIC FOCUS & GRADES)               */}
      {/* ========================================================================= */}
      {topFocusItem && (
        <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>วิชาที่ควรโฟกัสเป็นพิเศษ</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 truncate">
                {topFocusItem.subject.name}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  ({topFocusItem.subject.code})
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl font-medium">
                <span className="font-bold text-amber-900">คำแนะนำ: </span>
                {topFocusItem.message} เหลือคะแนนให้เก็บอีก{' '}
                <span className="font-black text-amber-800">
                  {topFocusItem.remainingPoints} คะแนน
                </span>{' '}
                (ขาดอีก {topFocusItem.gapToTarget} คะแนนเพื่อเกรด {topFocusItem.subject.targetGrade})
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSubjectPlan(topFocusItem.subject)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <span>ดูแผนคะแนน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: 3 FOCUSED CONTENT COLUMNS (SUBJECTS, TASKS, EXAMS)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. ภาพรวมคะแนน (Top 3 subjects) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-4 h-4 text-pink-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">ภาพรวมคะแนน</h4>
              </div>
              <span className="text-xs text-slate-600 font-bold">3 วิชาล่าสุด</span>
            </div>

            <div className="space-y-2.5">
              {activeSemesterSummary.subjectSummaries.slice(0, 3).map((subSummary) => {
                const sub = subSummary.subject;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleOpenSubjectPlan(sub)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-pink-50/40 border border-slate-200 transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: getSubjectColor(sub.color) }}
                        />
                        <span className="text-xs font-black text-slate-900 group-hover:text-pink-600 transition-colors truncate max-w-[140px]">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-slate-300 text-slate-900 shadow-2xs">
                        เกรด {subSummary.estimatedGrade}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                        <span>{subSummary.earnedScore} / 100 คะแนน</span>
                        <span className="text-slate-900 font-black">
                          {subSummary.currentPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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
                <div className="text-center py-6 text-slate-600 text-xs font-bold">
                  ยังไม่มีรายวิชาในเทอมนี้
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('subjects')}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูวิชาทั้งหมด ({totalSubjects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. งานใกล้ส่ง (Max 3 items with quick check) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">งานใกล้ส่ง</h4>
              </div>
              <span className="text-xs text-slate-600 font-bold">
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
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/40 border border-slate-200 transition-all flex items-center gap-2.5"
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
                      <p className="text-xs font-black text-slate-900 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-600 font-semibold truncate">
                        {sub?.name || 'รายวิชา'} • ส่ง {formatShortThaiDate(task.dueDate)}
                      </p>
                    </div>
                    {isUrgent && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                        {days === 0 ? 'วันนี้' : `อีก ${days} วัน`}
                      </span>
                    )}
                  </div>
                );
              })}

              {topPendingTasks.length === 0 && (
                <div className="text-center py-6 text-slate-600 text-xs font-bold space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p>ไม่มีงานค้างส่งในขณะนี้ 🎉</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูงานทั้งหมด ({currentSemesterTasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. การสอบที่ใกล้ที่สุด */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">การสอบที่ใกล้ที่สุด</h4>
              </div>
              <span className="text-xs text-slate-600 font-bold">
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
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                        {exam.subjectName}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isPast
                            ? 'bg-slate-200 text-slate-700'
                            : days <= 3
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isPast ? 'สอบแล้ว' : days === 0 ? 'สอบวันนี้' : `อีก ${days} วัน`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                      <span>{exam.title}</span>
                      <span className="font-bold text-slate-800">{formatShortThaiDate(exam.examDate)}</span>
                    </div>
                  </div>
                );
              })}

              {upcomingExams.length === 0 && (
                <div className="text-center py-6 text-slate-600 text-xs font-bold">
                  ไม่มีตารางสอบเร็ว ๆ นี้
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 active:scale-95"
          >
            <span>ดูตารางสอบทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
