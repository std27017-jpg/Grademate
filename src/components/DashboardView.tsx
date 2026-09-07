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
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { NavTab } from './Navbar';
import { getDaysRemaining, formatShortThaiDate } from '../utils/gradeCalculations';
import { Task, Subject } from '../types';

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
    updateTask,
    updateStudentName,
  } = useGrade();

  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [inlineName, setInlineName] = useState(academicYear.studentName);

  const isTerm1 = currentSemester === 'term1';

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

  // Top focus recommendation from activeSemesterSummary (Section 6 requirement: exactly 1 top card)
  const topFocusItem = activeSemesterSummary.focusAdvice[0];

  // Quick stats calculations
  const totalSubjects = activeSemesterSummary.subjectSummaries.length;
  const achievedTargets = activeSemesterSummary.subjectSummaries.filter(
    (s) => s.targetAchieved
  ).length;

  // Handle checking off task directly from dashboard
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
    <div className="space-y-6 pb-6">
      {/* Top Header: สวัสดี, [ชื่อผู้ใช้] 👋 & [เลือกเทอม 1] [เลือกเทอม 2] */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
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
                <span className="text-xl sm:text-2xl font-black text-slate-900">สวัสดี,</span>
                <input
                  type="text"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  autoFocus
                  placeholder="ชื่อของคุณ"
                  className="px-3 py-1 rounded-xl bg-slate-50 text-slate-900 font-bold text-lg border-2 border-indigo-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingNameInline(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  สวัสดี, {academicYear.studentName} 👋
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setInlineName(academicYear.studentName);
                    setIsEditingNameInline(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="แก้ไขชื่อผู้ใช้"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ปีการศึกษา {academicYear.year} • {academicYear.studentClass} • {academicYear.schoolName}
          </p>
        </div>

        {/* Term 1 & Term 2 Toggle */}
        <div className="flex items-center justify-start md:justify-end">
          <SemesterToggle size="md" />
        </div>
      </div>

      {/* 4 Compact Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* GPA */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>⭐ เกรดเฉลี่ยโดยประมาณ</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeSemesterSummary.gpa.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            รวม {activeSemesterSummary.totalCredits} หน่วยกิต • {totalSubjects} วิชา
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>📊 คะแนนเฉลี่ย</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeSemesterSummary.overallPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {activeSemesterSummary.totalEarnedScore} จาก {activeSemesterSummary.totalMaxPossibleScore} คะแนน
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>🎯 เป้าหมายที่ติดตาม</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {achievedTargets}/{totalSubjects}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium truncate">
            {achievedTargets === totalSubjects
              ? '✓ บรรลุเป้าหมายครบทุกวิชา'
              : `เหลืออีก ${totalSubjects - achievedTargets} วิชาสู่เป้าหมาย`}
          </div>
        </div>

        {/* Focus Recommendation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>🔥 วิชาที่ควรโฟกัส</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight truncate">
            {topFocusItem ? topFocusItem.subject.name : 'พร้อมทุกวิชา'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {topFocusItem ? `ขาดอีก ${topFocusItem.gapToTarget} แต้มสู่เป้าหมาย` : 'ผลการเรียนเป็นไปตามเป้า'}
          </div>
        </div>
      </div>

      {/* SECTION 6: Highlighted "ควรโฟกัสวันนี้" (1 Single Prominent Card) */}
      {topFocusItem && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>ควรโฟกัสวันนี้</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 truncate">
                {topFocusItem.subject.name}
                <span className="text-xs font-normal text-slate-500 ml-2">({topFocusItem.subject.code})</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                <span className="font-bold text-amber-900">เหตุผล: </span>
                {topFocusItem.message} เหลือคะแนนให้เก็บอีก{' '}
                <span className="font-bold text-amber-800">{topFocusItem.remainingPoints} คะแนน</span>{' '}
                (ขาดอีก {topFocusItem.gapToTarget} คะแนนเพื่อเกรด {topFocusItem.subject.targetGrade})
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSubjectPlan(topFocusItem.subject)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>ดูแผนคะแนน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3 Focused Content Sections (Max 1-3 items each + [ ดูทั้งหมด → ]) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. ภาพรวมคะแนน (Top 3 subjects) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
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
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[140px]">
                        {sub.name}
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        เกรด {subSummary.estimatedGradeLetter}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{subSummary.earnedScore} / 100 คะแนน</span>
                      <span>{subSummary.currentPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, subSummary.currentPercentage)}%`,
                          backgroundColor: sub.color || '#6366f1',
                        }}
                      />
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
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>ดูวิชาทั้งหมด ({totalSubjects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. สิ่งที่ต้องทำวันนี้ (Max 3 items with quick check) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">สิ่งที่ต้องทำวันนี้ / ใกล้ส่ง</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">ค้าง {pendingTasks.length} งาน</span>
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
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors flex items-center gap-2.5"
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
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {sub?.name || 'รายวิชา'} • ส่ง {formatShortThaiDate(task.dueDate)}
                      </p>
                    </div>
                    {isUrgent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                        {days === 0 ? 'วันนี้' : `อีก ${days} วัน`}
                      </span>
                    )}
                  </div>
                );
              })}

              {topPendingTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
                  <p>ไม่มีงานค้างส่งในขณะนี้ ยอดเยี่ยมมาก! 🎉</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>ดูงานทั้งหมด ({currentSemesterTasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. งาน/สอบที่ใกล้ที่สุด (1-2 Upcoming Exams) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-slate-900 text-sm">การสอบที่ใกล้ที่สุด</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">ตารางสอบ</span>
            </div>

            <div className="space-y-2.5">
              {upcomingExams.map((exam) => {
                const sub = activeSemesterSummary.subjectSummaries.find(
                  (s) => s.subject.id === exam.subjectId
                )?.subject;
                const days = getDaysRemaining(exam.examDate);

                return (
                  <div
                    key={exam.id}
                    className="p-3 rounded-2xl bg-sky-50/50 border border-sky-200/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                        {sub?.name || 'การสอบ'}
                      </span>
                      <span className="text-xs font-black text-sky-700 px-2 py-0.5 rounded-md bg-white border border-sky-200">
                        {days === 0 ? 'สอบวันนี้!' : `อีก ${days} วัน`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{exam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}</span>
                      <span>{formatShortThaiDate(exam.examDate)} • {exam.startTime} น.</span>
                    </div>
                  </div>
                );
              })}

              {upcomingExams.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ยังไม่มีกำหนดการสอบในเทอมนี้
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>ดูตารางสอบทั้งหมด ({currentSemesterExams.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
