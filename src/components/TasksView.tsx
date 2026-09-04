import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FolderCheck,
  FolderOpen,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { Task, TaskStatus, ScorePeriodKey } from '../types';
import { SemesterToggle } from './SemesterToggle';
import { PERIOD_CONFIG, formatShortThaiDate, getDaysRemaining } from '../utils/gradeCalculations';

export const TasksView: React.FC = () => {
  const {
    currentSemester,
    activeSemesterSummary,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    addScoreItem,
  } = useGrade();

  // Filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Track expanded state for completed tasks drawers per subject
  const [expandedCompletedSubjects, setExpandedCompletedSubjects] = useState<Record<string, boolean>>({});

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formState, setFormState] = useState<{
    subjectId: string;
    title: string;
    periodKey: ScorePeriodKey;
    dueDate: string;
    maxScore: string;
    obtainedScore: string;
    status: TaskStatus;
    notes: string;
  }>({
    subjectId: '',
    title: '',
    periodKey: 'preMidterm',
    dueDate: new Date().toISOString().split('T')[0],
    maxScore: '10',
    obtainedScore: '',
    status: 'todo',
    notes: '',
  });

  // Current semester tasks
  const semesterTasks = tasks.filter((t) => t.semesterId === currentSemester);

  // Split into active (pending) vs completed
  const isTaskCompleted = (t: Task) => t.status === 'submitted' || t.status === 'graded';

  // Apply filters
  const filterTask = (task: Task) => {
    if (selectedSubjectFilter !== 'all' && task.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (statusFilter === 'pending') {
      return !isTaskCompleted(task);
    }
    if (statusFilter === 'completed') {
      return isTaskCompleted(task);
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    return true;
  };

  const pendingTasks = semesterTasks.filter((t) => !isTaskCompleted(t) && filterTask(t));
  const completedTasks = semesterTasks.filter((t) => isTaskCompleted(t) && filterTask(t));

  const totalSemesterTasks = semesterTasks.length;
  const totalCompleted = semesterTasks.filter(isTaskCompleted).length;
  const completionPercentage = totalSemesterTasks > 0 ? (totalCompleted / totalSemesterTasks) * 100 : 0;

  // Group completed tasks by subject
  const completedTasksBySubject = activeSemesterSummary.subjectSummaries
    .map((summary) => {
      const subject = summary.subject;
      const tasksInSubject = completedTasks.filter((t) => t.subjectId === subject.id);
      return {
        subject,
        tasks: tasksInSubject,
      };
    })
    .filter((group) => group.tasks.length > 0);

  // Also catch any completed tasks whose subject might not be in active semester summary
  const otherCompletedTasks = completedTasks.filter(
    (t) => !activeSemesterSummary.subjectSummaries.some((s) => s.subject.id === t.subjectId)
  );

  const toggleSubjectDrawer = (subjectId: string) => {
    setExpandedCompletedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const expandAllCompleted = () => {
    const allExpanded: Record<string, boolean> = {};
    completedTasksBySubject.forEach((g) => {
      allExpanded[g.subject.id] = true;
    });
    allExpanded['other'] = true;
    setExpandedCompletedSubjects(allExpanded);
  };

  const collapseAllCompleted = () => {
    setExpandedCompletedSubjects({});
  };

  const openAddModal = () => {
    const firstSubId = activeSemesterSummary.subjectSummaries[0]?.subject.id || '';
    setEditingTask(null);
    setFormState({
      subjectId: firstSubId,
      title: '',
      periodKey: 'preMidterm',
      dueDate: new Date().toISOString().split('T')[0],
      maxScore: '10',
      obtainedScore: '',
      status: 'todo',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormState({
      subjectId: task.subjectId,
      title: task.title,
      periodKey: task.periodKey,
      dueDate: task.dueDate,
      maxScore: task.maxScore.toString(),
      obtainedScore: task.obtainedScore !== undefined ? task.obtainedScore.toString() : '',
      status: task.status,
      notes: task.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.subjectId) return;

    const maxScoreNum = parseFloat(formState.maxScore) || 10;
    const obtainedNum = formState.obtainedScore ? parseFloat(formState.obtainedScore) : undefined;

    if (editingTask) {
      updateTask({
        ...editingTask,
        subjectId: formState.subjectId,
        title: formState.title.trim(),
        periodKey: formState.periodKey,
        dueDate: formState.dueDate,
        maxScore: maxScoreNum,
        obtainedScore: obtainedNum,
        status: formState.status,
        notes: formState.notes.trim() || undefined,
      });
    } else {
      addTask({
        semesterId: currentSemester,
        subjectId: formState.subjectId,
        title: formState.title.trim(),
        periodKey: formState.periodKey,
        dueDate: formState.dueDate,
        maxScore: maxScoreNum,
        obtainedScore: obtainedNum,
        status: formState.status,
        notes: formState.notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Checklist check/uncheck action
  const handleChecklistToggle = (task: Task) => {
    const isDone = isTaskCompleted(task);
    if (!isDone) {
      // Mark as submitted (done) and play confetti
      updateTask({
        ...task,
        status: 'submitted',
      });
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Confetti fallback
      }
    } else {
      // Uncheck back to todo
      updateTask({
        ...task,
        status: 'todo',
      });
    }
  };

  const cycleStatus = (task: Task) => {
    let nextStatus: TaskStatus = 'todo';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') {
      nextStatus = 'submitted';
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Confetti fallback
      }
    } else if (task.status === 'submitted') nextStatus = 'graded';
    else nextStatus = 'todo';

    updateTask({
      ...task,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ระบบการบ้านและงาน
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentSemester === 'term1' ? '📘 เทอม 1' : '📕 เทอม 2'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ผูกงานเข้ากับเทอม • วิชา • ช่วงคะแนน • กำหนดส่ง • คะแนนเต็ม
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SemesterToggle size="md" />
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> วิชา:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubjectFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทุกวิชา ({semesterTasks.length})
          </button>
          {activeSemesterSummary.subjectSummaries.map((s) => (
            <button
              key={s.subject.id}
              type="button"
              onClick={() => setSelectedSubjectFilter(s.subject.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubjectFilter === s.subject.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.subject.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทั้งหมด (แยกงานค้าง / งานที่เสร็จ)</option>
            <option value="pending">เฉพาะงานค้างส่ง</option>
            <option value="completed">เฉพาะงานที่เสร็จแล้ว</option>
            <option value="todo">ยังไม่เริ่ม</option>
            <option value="in_progress">กำลังทำ</option>
            <option value="submitted">ส่งแล้ว</option>
            <option value="graded">ได้คะแนนแล้ว</option>
          </select>
        </div>
      </div>

      {/* Progress & Stats Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ ส่งแล้ว {totalCompleted} / {totalSemesterTasks} งาน ({completionPercentage.toFixed(0)}%)
              </span>
              <span className="text-xs text-slate-300 font-medium">
                • ค้างส่ง {pendingTasks.length} งาน
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              ความคืบหน้าการส่งงาน{currentSemester === 'term1' ? 'เทอม 1' : 'เทอม 2'}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {completedTasks.length > 0 && (
              <button
                type="button"
                onClick={Object.keys(expandedCompletedSubjects).length > 0 ? collapseAllCompleted : expandAllCompleted}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {Object.keys(expandedCompletedSubjects).length > 0 ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>ซ่อนงานที่เสร็จทั้งหมด</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>เปิดดูงานที่เสร็จทั้งหมด ({completedTasks.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-300 flex items-center gap-1">
          <span>💡</span>
          <span>เมื่อกดเช็คลิสต์งานที่ทำเสร็จแล้ว ระบบจะนำไปซ่อนเก็บไว้ในแต่ละวิชาให้อัตโนมัติ สามารถกดเปิดดูหรือแก้ไขได้ตลอดเวลา</span>
        </p>
      </div>

      {/* SECTION 1: Active / Pending Tasks (งานที่ต้องส่ง) */}
      {(statusFilter === 'all' || statusFilter === 'pending' || statusFilter === 'todo' || statusFilter === 'in_progress') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-lg font-black text-slate-900">
                งานที่ต้องส่ง / ค้างส่ง ({pendingTasks.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              คลิกช่อง ✓ เพื่อเช็คลิสต์งานที่เสร็จ
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-10 bg-emerald-50/50 rounded-3xl border border-emerald-100 text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                🎉
              </div>
              <h4 className="font-black text-slate-900 text-base">
                ไม่มีงานค้างส่งในเงื่อนไขนี้!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {totalCompleted > 0
                  ? `คุณส่งงานเสร็จแล้ว ${totalCompleted} รายการ (ดูงานที่ซ่อนอยู่ในวิชาด้านล่าง)`
                  : 'ยังไม่มีงานที่ต้องส่ง คุณสามารถกดปุ่ม "เพิ่มงานใหม่" ได้ทันที'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTasks.map((task) => {
                const subject = activeSemesterSummary.subjectSummaries.find(
                  (s) => s.subject.id === task.subjectId
                )?.subject;
                const daysLeft = getDaysRemaining(task.dueDate);
                const isOverdue = daysLeft < 0;

                const statusConfigs: Record<TaskStatus, { label: string; bg: string; text: string }> = {
                  todo: { label: 'ยังไม่เริ่ม', bg: 'bg-slate-100', text: 'text-slate-700' },
                  in_progress: { label: 'กำลังทำ ✍️', bg: 'bg-amber-100', text: 'text-amber-800' },
                  submitted: { label: 'ส่งแล้ว 🚀', bg: 'bg-blue-100', text: 'text-blue-800' },
                  graded: { label: 'ได้รับคะแนนแล้ว ✨', bg: 'bg-emerald-100', text: 'text-emerald-800' },
                };

                const currentStatus = statusConfigs[task.status] || statusConfigs.todo;

                return (
                  <div
                    key={task.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top tags & status toggle */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {subject?.name || 'ทั่วไป'}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {PERIOD_CONFIG[task.periodKey]?.shortLabel || 'เก็บคะแนน'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => cycleStatus(task)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${currentStatus.bg} ${currentStatus.text}`}
                          title="คลิกเพื่อเปลี่ยนสถานะ"
                        >
                          {currentStatus.label}
                        </button>
                      </div>

                      {/* Main Title with Interactive Checklist Checkbox */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(task)}
                          className="mt-0.5 w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title="กดเช็คลิสต์เมื่อทำงานนี้เสร็จ (จะนำไปซ่อนไว้ในวิชา)"
                        >
                          <Check className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-base leading-snug">
                            {task.title}
                          </h4>
                          {task.notes && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Controls */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          ส่ง {formatShortThaiDate(task.dueDate)}
                        </span>
                        <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          ({isOverdue ? 'เลยกำหนด' : daysLeft === 0 ? 'ส่งวันนี้' : `เหลือ ${daysLeft} วัน`})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                          {task.obtainedScore !== undefined ? `${task.obtainedScore} / ` : ''}{task.maxScore} คะแนน
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Completed Tasks Hidden in Subjects (งานที่เสร็จแล้ว ซ่อนไว้ในวิชานั้นๆ) */}
      {(statusFilter === 'all' || statusFilter === 'completed' || statusFilter === 'submitted' || statusFilter === 'graded') && (
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">
                  งานที่เสร็จแล้ว (ซ่อนตามรายวิชา)
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {completedTasks.length} งาน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                งานที่กดเช็คลิสต์แล้วจะถูกซ่อนไว้ในหมวดวิชา คลิกที่รายวิชาเพื่อเปิดดูหรือแก้ไขคะแนน
              </p>
            </div>

            {completedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={Object.keys(expandedCompletedSubjects).length > 0 ? collapseAllCompleted : expandAllCompleted}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {Object.keys(expandedCompletedSubjects).length > 0 ? 'ย่อเก็บทั้งหมด' : 'เปิดดูทุกวิชา'}
                </button>
              </div>
            )}
          </div>

          {completedTasks.length === 0 ? (
            <div className="py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center p-6 space-y-1">
              <p className="text-sm font-semibold text-slate-700">
                ยังไม่มีงานที่เสร็จสมบูรณ์
              </p>
              <p className="text-xs text-slate-500">
                เมื่อคุณทำงานเสร็จและกดเช็คที่ช่อง ✓ งานจะถูกนำมาจัดเก็บไว้ในวิชานั้นๆ ตรงนี้
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasksBySubject.map(({ subject, tasks: subTasks }) => {
                const isExpanded = !!expandedCompletedSubjects[subject.id];
                const totalEarnedScore = subTasks.reduce((sum, t) => sum + (t.obtainedScore ?? 0), 0);
                const totalMaxScore = subTasks.reduce((sum, t) => sum + t.maxScore, 0);

                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Subject Header Bar (Clickable to expand/collapse) */}
                    <div
                      onClick={() => toggleSubjectDrawer(subject.id)}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <FolderCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                              {subject.name}
                            </h4>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {subject.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {subject.teacherName ? `👨‍🏫 ${subject.teacherName} • ` : ''}
                            ส่งแล้ว {subTasks.length} งาน • คะแนนรวม {totalEarnedScore}/{totalMaxScore} คะแนน
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          เสร็จแล้ว {subTasks.length} งาน
                        </span>
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Tasks inside this Subject */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-2.5">
                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                          <span>รายการงานที่เสร็จแล้วในวิชา {subject.name}:</span>
                          <span>คลิก ✓ เพื่อกู้คืนเป็นงานค้างส่ง</span>
                        </div>

                        {subTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Checked Checkbox (Click to restore to todo) */}
                              <button
                                type="button"
                                onClick={() => handleChecklistToggle(task)}
                                className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-rose-500 border-2 border-emerald-500 hover:border-rose-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 group/check"
                                title="คลิกเพื่อยกเลิกการส่ง และกู้คืนกลับเป็นงานค้างส่ง"
                              >
                                <Check className="w-4 h-4 group-hover/check:hidden" />
                                <RotateCcw className="w-3.5 h-3.5 hidden group-hover/check:block" />
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-slate-700 text-sm line-through decoration-slate-400">
                                    {task.title}
                                  </p>
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {PERIOD_CONFIG[task.periodKey]?.shortLabel || 'เก็บคะแนน'}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {task.status === 'graded' ? 'ได้คะแนนแล้ว ✨' : 'ส่งแล้ว 🚀'}
                                  </span>
                                </div>
                                {task.notes && (
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                    {task.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="text-xs text-slate-400">
                                กำหนด {formatShortThaiDate(task.dueDate)}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                                  {task.obtainedScore !== undefined ? `${task.obtainedScore} / ` : ''}{task.maxScore} คะแนน
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(task)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    title="แก้ไขงานนี้"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteTask(task.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="ลบงานนี้"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Other completed tasks not matched to current subjects */}
              {otherCompletedTasks.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div
                    onClick={() => toggleSubjectDrawer('other')}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <FolderCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          วิชาอื่นๆ / งานทั่วไป
                        </h4>
                        <p className="text-xs text-slate-500">
                          ส่งแล้ว {otherCompletedTasks.length} งาน
                        </p>
                      </div>
                    </div>
                    <button type="button" className="p-1 text-slate-400">
                      {expandedCompletedSubjects['other'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {expandedCompletedSubjects['other'] && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-2">
                      {otherCompletedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleChecklistToggle(task)}
                              className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-semibold line-through text-slate-600">
                              {task.title}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {task.obtainedScore ?? task.maxScore}/{task.maxScore} คะแนน
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingTask ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงาน / การบ้านใหม่'}
                </h3>
                <p className="text-xs text-slate-500">
                  ประจำ{currentSemester === 'term1' ? 'เทอม 1' : 'เทอม 2'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วิชา *
                </label>
                <select
                  required
                  value={formState.subjectId}
                  onChange={(e) => setFormState({ ...formState, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                >
                  {activeSemesterSummary.subjectSummaries.map((s) => (
                    <option key={s.subject.id} value={s.subject.id}>
                      {s.subject.name} ({s.subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่องาน / การบ้าน (เช่น ใบงานบทที่ 3, โครงงาน) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ใบงานบทที่ 3 (ฟังก์ชันตรีโกณมิติ)"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ช่วงคะแนน *
                  </label>
                  <select
                    value={formState.periodKey}
                    onChange={(e) => setFormState({ ...formState, periodKey: e.target.value as ScorePeriodKey })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="preMidterm">ก่อนกลางภาค</option>
                    <option value="midterm">กลางภาค</option>
                    <option value="postMidterm">หลังกลางภาค</option>
                    <option value="final">ปลายภาค</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันกำหนดส่ง *
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.dueDate}
                    onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนเต็ม *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formState.maxScore}
                    onChange={(e) => setFormState({ ...formState, maxScore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนที่ได้ (ถ้ามี)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="เช่น 8"
                    value={formState.obtainedScore}
                    onChange={(e) => setFormState({ ...formState, obtainedScore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะ
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as TaskStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="todo">ยังไม่เริ่ม</option>
                    <option value="in_progress">กำลังทำ</option>
                    <option value="submitted">ส่งแล้ว</option>
                    <option value="graded">ได้คะแนนแล้ว</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียด / โน้ต
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ทำแบบฝึกหัดข้อ 1-15 ในสมุด"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {editingTask ? 'บันทึกการแก้ไข' : 'สร้างงานใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
