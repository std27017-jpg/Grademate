import React from 'react';
import {
  Trophy,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Target,
  Plus,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Edit3,
  Edit2,
  Check,
  User,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { SemesterToggle } from './SemesterToggle';
import { NavTab } from './Navbar';
import { getDaysRemaining, formatShortThaiDate } from '../utils/gradeCalculations';
import { EditSubjectScoresModal } from './EditSubjectScoresModal';
import { Subject } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddScore: (subjectId?: string) => void;
  onOpenAddTask: () => void;
  onOpenAddExam: () => void;
  onOpenAddSubject: () => void;
  onOpenEditProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddScore,
  onOpenAddTask,
  onOpenAddExam,
  onOpenAddSubject,
  onOpenEditProfile,
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

  const [isEditingNameInline, setIsEditingNameInline] = React.useState(false);
  const [inlineName, setInlineName] = React.useState(academicYear.studentName);
  const [editingScoresSubject, setEditingScoresSubject] = React.useState<Subject | null>(null);

  const isTerm1 = currentSemester === 'term1';
  const semesterBadgeColor = isTerm1 ? 'bg-blue-500' : 'bg-rose-500';

  // Filter tasks & exams for current semester
  const currentSemesterTasks = tasks.filter((t) => t.semesterId === currentSemester);
  const currentSemesterExams = exams.filter((e) => e.semesterId === currentSemester);

  // Upcoming tasks sorted by due date
  const upcomingTasks = [...currentSemesterTasks]
    .filter((t) => t.status !== 'graded')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Upcoming exams sorted by exam date
  const upcomingExams = [...currentSemesterExams]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3);

  // Top focus recommendation from activeSemesterSummary
  const topFocusItem = activeSemesterSummary.focusAdvice[0];
  const bestSubjectSummary = activeSemesterSummary.subjectSummaries.find(
    (s) => s.subject.id === activeSemesterSummary.bestSubject?.id
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Semester Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        {/* Background glow & decorative shapes */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20">
              <span className={`w-2 h-2 rounded-full ${semesterBadgeColor} animate-pulse`} />
              <span>ปีการศึกษา {academicYear.year} • ภาคเรียนที่ {isTerm1 ? '1' : '2'}</span>
            </div>
            {isEditingNameInline ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inlineName.trim()) {
                    updateStudentName(inlineName.trim());
                  }
                  setIsEditingNameInline(false);
                }}
                className="flex items-center gap-2 flex-wrap pt-1"
              >
                <span className="text-xl sm:text-2xl font-black">สวัสดี</span>
                <input
                  type="text"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  autoFocus
                  placeholder="พิมพ์ชื่อของคุณ"
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-lg sm:text-xl border-2 border-sky-400 focus:outline-none shadow-md"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingNameInline(false)}
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  สวัสดี {academicYear.studentName} 👋
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInlineName(academicYear.studentName);
                      setIsEditingNameInline(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all cursor-pointer shadow-xs"
                    title="คลิกเพื่อแก้ไขชื่อโดยตรง"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-300" />
                    <span>แก้ไขชื่อ</span>
                  </button>
                  {onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={onOpenEditProfile}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลโปรไฟล์ ชั้นเรียน หรือโรงเรียน"
                    >
                      <User className="w-3 h-3 text-indigo-300" />
                      <span>{academicYear.studentClass}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            <p className="text-sm text-slate-300 max-w-xl">
              จัดการคะแนนเก็บทั้ง 4 ช่วง คำนวณเกรดล่วงหน้า และติดตามงาน/สอบประจำ{activeSemesterSummary.semesterName}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SemesterToggle size="lg" className="bg-white/15 border-white/20 text-white shadow-lg" />
          </div>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimated GPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              เกรดเฉลี่ยโดยประมาณ
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {activeSemesterSummary.gpa.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / 4.00 ({activeSemesterSummary.totalCredits} หน่วยกิต)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>{isTerm1 ? '📘 เทอม 1' : '📕 เทอม 2'}</span>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              ดูการคำนวณ <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Total Score & % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              คะแนนสะสมปัจจุบัน
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {activeSemesterSummary.overallPercentage.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({activeSemesterSummary.totalEarnedScore}/{activeSemesterSummary.totalMaxPossibleScore} คะแนน)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, activeSemesterSummary.overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Best Subject */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              วิชาที่ดีที่สุด
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {activeSemesterSummary.bestSubject ? (
              <>
                <div className="font-bold text-slate-900 text-lg truncate">
                  {activeSemesterSummary.bestSubject.name}
                </div>
                <div className="text-xs font-medium text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  คะแนน {bestSubjectSummary?.currentPercentage.toFixed(1)}% • เกรดประมาณการ {bestSubjectSummary?.estimatedGradeLetter}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">ยังไม่มีข้อมูลวิชา</div>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ผลงานโดดเด่น</span>
            <span className="text-emerald-700 font-semibold">รักษามาตรฐาน ⭐</span>
          </div>
        </div>

        {/* Card 4: Focus Priority Subject */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              วิชาที่ควรโฟกัส
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {topFocusItem ? (
              <>
                <div className="font-bold text-slate-900 text-lg truncate">
                  {topFocusItem.subject.name}
                </div>
                <div className="text-xs font-medium text-rose-600 mt-0.5 flex items-center gap-1">
                  <span>เหลือให้เก็บอีก {topFocusItem.remainingPoints} คะแนน</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">ทุกวิชาทำคะแนนได้ตามเป้า</div>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">เป้าหมาย {topFocusItem?.subject.targetGrade || 4.0} (A)</span>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-rose-600 font-semibold hover:underline"
            >
              ดูแผนเพิ่มคะแนน →
            </button>
          </div>
        </div>
      </div>

      {/* Priority Focus Alert Box (As specified in prompt) */}
      {topFocusItem && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-sm shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                  คำแนะนำวิเคราะห์ {activeSemesterSummary.semesterName}
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {topFocusItem.subject.name}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-1 font-medium">
                {topFocusItem.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('subjects')}
            className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            ดูคะแนน 4 ช่วงวิชานี้
          </button>
        </div>
      )}

      {/* Two Column Layout: Upcoming Tasks & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  งานที่ใกล้ส่ง ({currentSemesterTasks.length} รายการ)
                </h3>
                <p className="text-xs text-slate-500">
                  ประจำ{activeSemesterSummary.semesterName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddTask}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="เพิ่มงานใหม่"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-medium text-slate-500">
                🎉 ไม่มีงานค้างใน{activeSemesterSummary.semesterName}!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => {
                const subject = activeSemesterSummary.subjectSummaries.find(
                  (s) => s.subject.id === task.subjectId
                )?.subject;
                const daysLeft = getDaysRemaining(task.dueDate);
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateTask({
                            ...task,
                            status: task.status === 'submitted' ? 'todo' : 'submitted',
                          })
                        }
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          task.status === 'submitted'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-indigo-500 bg-white'
                        }`}
                        title={task.status === 'submitted' ? 'ส่งแล้ว' : 'กดเพื่อเปลี่ยนสถานะเป็นส่งแล้ว'}
                      >
                        {task.status === 'submitted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-indigo-600">
                            {subject?.name || 'ทั่วไป'}
                          </span>
                          <span>•</span>
                          <span>{task.maxScore} คะแนน</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isOverdue
                          ? 'เลยกำหนด'
                          : daysLeft === 0
                          ? 'ส่งวันนี้!'
                          : `เหลือ ${daysLeft} วัน`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Exams & Countdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  ตารางสอบที่ใกล้ถึง ({currentSemesterExams.length} วิชา)
                </h3>
                <p className="text-xs text-slate-500">
                  ระบบนับถอยหลัง (Countdown) • {activeSemesterSummary.semesterName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddExam}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="เพิ่มตารางสอบ"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('exams')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-medium text-slate-500">
                ยังไม่มีตารางสอบสำหรับ{activeSemesterSummary.semesterName}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const subject = activeSemesterSummary.subjectSummaries.find(
                  (s) => s.subject.id === exam.subjectId
                )?.subject;
                const daysRemaining = getDaysRemaining(exam.examDate);

                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {exam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {subject?.name || 'วิชา'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>🗓️ {formatShortThaiDate(exam.examDate)}</span>
                        <span>⏰ {exam.startTime} - {exam.endTime}</span>
                        <span>📍 {exam.room}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs text-center">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {daysRemaining > 0
                          ? `เหลืออีก ${daysRemaining} วัน`
                          : daysRemaining === 0
                          ? 'สอบวันนี้!'
                          : 'สอบเสร็จแล้ว'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subject Score Quick Grid (4 periods overview per subject) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              สรุปคะแนน 4 ช่วงรายวิชา — {activeSemesterSummary.semesterName}
            </h3>
            <p className="text-xs text-slate-500">
              ก่อนกลางภาค • กลางภาค • หลังกลางภาค • ปลายภาค
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddSubject}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มวิชาใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('subjects')}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>จัดการคะแนนและรายการย่อย</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {activeSemesterSummary.subjectSummaries.map((summary) => {
            const { subject, periodBreakdowns, earnedScore, totalMaxScoreRecorded, estimatedGrade, estimatedGradeLetter, currentPercentage } = summary;

            return (
              <div
                key={subject.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all space-y-3 cursor-pointer"
                onClick={() => onNavigate('subjects')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {subject.code} • {subject.credits} หน่วยกิต
                    </span>
                    <h4 className="font-bold text-slate-900 text-base line-clamp-1">
                      {subject.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                    เกรด {estimatedGradeLetter} ({estimatedGrade})
                  </span>
                </div>

                {/* Score numbers */}
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">คะแนนรวมสะสม:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {earnedScore} / {totalMaxScoreRecorded} ({currentPercentage.toFixed(1)}%)
                  </span>
                </div>

                {/* 4 Periods Mini Bars */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {periodBreakdowns.map((period) => (
                    <div key={period.key} className="space-y-1">
                      <div className="text-[10px] text-slate-500 truncate text-center">
                        {period.shortLabel}
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            !period.hasData
                              ? 'bg-slate-200'
                              : (period.percentage ?? 0) >= 80
                              ? 'bg-emerald-500'
                              : (period.percentage ?? 0) >= 65
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{
                            width: `${period.percentage !== null ? Math.min(100, period.percentage) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-[9px] font-medium text-slate-400 text-center">
                        {period.hasData ? `${period.earned}/${period.max}` : 'ยังไม่มี'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target hint and Edit button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 flex-1 truncate">
                    <span>เป้าหมาย {subject.targetGrade}: </span>
                    <span className={summary.canStillAchieveTarget ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {summary.targetAchieved
                        ? 'ถึงเป้าแล้ว 🎉'
                        : summary.canStillAchieveTarget
                        ? `ขาด ${summary.pointsNeededForTarget} คะแนน`
                        : 'สูงสุด ' + summary.maxPossibleTotal}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingScoresSubject(subject);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                    title="แก้ไขคะแนนวิชานี้"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>แก้คะแนน</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Subject Scores Modal */}
      <EditSubjectScoresModal
        isOpen={!!editingScoresSubject}
        onClose={() => setEditingScoresSubject(null)}
        subject={editingScoresSubject}
      />
    </div>
  );
};
