import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Square,
  Flame,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { Task, TaskStatus, ScorePeriodKey } from '../types';
import { SemesterToggle } from './SemesterToggle';
import { formatShortThaiDate, getDaysRemaining } from '../utils/gradeCalculations';
import { getSubjectColor } from '../utils/colorUtils';

export const TasksView: React.FC = () => {
  const {
    currentSemester,
    activeSemesterSummary,
    tasks,
    addTask,
    updateTask,
    deleteTask,
  } = useGrade();

  // Top Filter: 'all' (ทั้งหมด), 'today' (วันนี้), 'urgent' (ใกล้ส่ง), 'completed' (เสร็จแล้ว)
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');

  // For 'urgent' mode: default show 3 items, user can click [ดูงานทั้งหมด] to expand
  const [showAllUrgent, setShowAllUrgent] = useState(false);

  // Subject filter dropdown (optional filter)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formState, setFormState] = useState<{
    subjectId: string;
    title: string;
    periodKey: ScorePeriodKey;
    dueDate: string;
    maxScore: string;
    status: TaskStatus;
    notes: string;
  }>({
    subjectId: '',
    title: '',
    periodKey: 'preMidterm',
    dueDate: new Date().toISOString().split('T')[0],
    maxScore: '10',
    status: 'todo',
    notes: '',
  });

  // Current semester tasks
  const semesterTasks = tasks.filter((t) => t.semesterId === currentSemester);

  const isCompleted = (t: Task) => t.status === 'submitted' || t.status === 'graded';

  // Toggle completion with confetti
  const handleToggleTask = (task: Task) => {
    const done = isCompleted(task);
    updateTask({
      ...task,
      status: done ? 'todo' : 'submitted',
    });
    if (!done) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Fallback
      }
    }
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
      status: task.status,
      notes: task.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.subjectId) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: formState.title.trim(),
        subjectId: formState.subjectId,
        periodKey: formState.periodKey,
        dueDate: formState.dueDate,
        maxScore: parseFloat(formState.maxScore) || 10,
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
        maxScore: parseFloat(formState.maxScore) || 10,
        status: formState.status,
        notes: formState.notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filter tasks
  let displayedTasks = semesterTasks.filter((task) => {
    if (selectedSubjectId !== 'all' && task.subjectId !== selectedSubjectId) {
      return false;
    }
    const days = getDaysRemaining(task.dueDate);
    const done = isCompleted(task);

    if (activeFilter === 'today') {
      return !done && days === 0;
    }
    if (activeFilter === 'urgent') {
      return !done; // Sorted by date next
    }
    if (activeFilter === 'completed') {
      return done;
    }
    return true; // 'all'
  });

  // Sort: upcoming first
  displayedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Count summaries
  const pendingCount = semesterTasks.filter((t) => !isCompleted(t)).length;
  const todayCount = semesterTasks.filter((t) => !isCompleted(t) && getDaysRemaining(t.dueDate) === 0).length;
  const completedCount = semesterTasks.filter((t) => isCompleted(t)).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              การบ้าน & งานที่มอบหมาย
            </h2>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
              ค้าง {pendingCount} งาน
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ติดตามกำหนดส่งงาน พร้อมบันทึกคะแนนเข้าสู่ผลการเรียนอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SemesterToggle size="sm" />
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานใหม่</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR: Capsule [ทั้งหมด] [วันนี้] [ใกล้ส่ง] [เสร็จแล้ว] */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {[
            { id: 'all' as const, label: 'ทั้งหมด', count: semesterTasks.length },
            { id: 'today' as const, label: 'วันนี้', count: todayCount },
            { id: 'urgent' as const, label: 'ใกล้ส่ง', count: pendingCount },
            { id: 'completed' as const, label: 'เสร็จแล้ว', count: completedCount },
          ].map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setActiveFilter(f.id);
                  setShowAllUrgent(false);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Subject Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pr-1">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกวิชา</option>
            {activeSemesterSummary.subjectSummaries.map((s) => (
              <option key={s.subject.id} value={s.subject.id}>
                {s.subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayedTasks.map((task) => {
            const sub = activeSemesterSummary.subjectSummaries.find(
              (s) => s.subject.id === task.subjectId
            )?.subject;
            const days = getDaysRemaining(task.dueDate);
            const done = isCompleted(task);

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-4.5 rounded-3xl border transition-all flex flex-col justify-between space-y-3.5 ${
                  done
                    ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2.5">
                    {/* Circle Icon + Title & Subject */}
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs ${
                          done
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-sky-50 text-sky-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={done ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                      >
                        {done ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>

                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-black leading-snug truncate ${
                            done ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: getSubjectColor(sub?.color) }}
                          />
                          <span className="font-semibold truncate">{sub?.name || 'รายวิชา'}</span>
                          <span className="text-[10px] text-slate-400">({task.maxScore} คะแนน)</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        title="แก้ไขงาน"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบงาน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-2xl line-clamp-2">
                      {task.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Card Footer: 📅 วันกำหนดส่ง + Capsule Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">
                      {formatShortThaiDate(task.dueDate)} (
                      {days === 0
                        ? 'วันนี้!'
                        : days > 0
                        ? `เหลืออีก ${days} วัน`
                        : `เลยกำหนด ${Math.abs(days)} วัน`}
                      )
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all active:scale-95 shadow-2xs ${
                      done
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                        : days <= 1
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                    }`}
                  >
                    {done ? '✓ ส่งแล้ว' : 'กำลังทำ'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {displayedTasks.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-2 col-span-full">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
            <p className="text-sm font-bold text-slate-800">ไม่มีรายการงานในหมวดหมู่นี้</p>
            <p className="text-xs text-slate-500">คุณสามารถกดปุ่ม "+ เพิ่มงานใหม่" เพื่อบันทึกงานชิ้นต่อไป</p>
          </div>
        )}
      </div>

      {/* Task Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto box-border">
            <h3 className="text-lg font-black text-slate-900">
              {editingTask ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่องาน / หัวข้อการบ้าน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รายงานชีววิทยา, การบ้านเลขข้อ 1-10"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วิชาที่เกี่ยวข้อง
                </label>
                <select
                  value={formState.subjectId}
                  onChange={(e) => setFormState({ ...formState, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                >
                  {activeSemesterSummary.subjectSummaries.map((s) => (
                    <option key={s.subject.id} value={s.subject.id}>
                      {s.subject.name} ({s.subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    กำหนดส่ง
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.dueDate}
                    onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนเต็ม
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formState.maxScore}
                    onChange={(e) => setFormState({ ...formState, maxScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ทำลงในสมุด, ส่งทาง Google Classroom"
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer"
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
