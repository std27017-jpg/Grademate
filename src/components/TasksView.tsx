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

  const filteredTasks = semesterTasks.filter((task) => {
    if (selectedSubjectFilter !== 'all' && task.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    return true;
  });

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

  const toggleTaskStatus = (task: Task) => {
    let nextStatus: TaskStatus = 'todo';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') {
      nextStatus = 'submitted';
      try {
        confetti({
          particleCount: 50,
          spread: 60,
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
            <option value="all">ทั้งหมด</option>
            <option value="todo">ยังไม่เริ่ม</option>
            <option value="in_progress">กำลังทำ</option>
            <option value="submitted">ส่งแล้ว</option>
            <option value="graded">ได้คะแนนแล้ว</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            📝
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            ไม่มีรายการงานที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-slate-500">
            คุณสามารถเพิ่มการบ้านหรือชิ้นงานใหม่ได้ตลอดเวลา
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
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
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {subject?.name || 'ทั่วไป'}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {PERIOD_CONFIG[task.periodKey]?.shortLabel || 'เก็บคะแนน'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${currentStatus.bg} ${currentStatus.text}`}
                      title="คลิกเพื่อเปลี่ยนสถานะ"
                    >
                      {currentStatus.label}
                    </button>
                  </div>

                  {/* Title & Notes */}
                  <h4 className="font-bold text-slate-900 text-base">
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {task.notes}
                    </p>
                  )}
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
                    <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {task.obtainedScore !== undefined ? `${task.obtainedScore} / ` : ''}{task.maxScore} คะแนน
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
