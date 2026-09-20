import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Sparkles,
  MapPin,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../../context/GradeContext';
import {
  CalendarItem,
  DayStudyStats,
  formatThaiBuddhistDate,
} from '../../utils/calendarUtils';
import { Task, Exam, PersonalEvent } from '../../types';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  items: CalendarItem[];
  studyStats?: DayStudyStats;
  onOpenAddItem: (date: string) => void;
  onNavigateToExams?: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  items,
  studyStats,
  onOpenAddItem,
  onNavigateToExams,
}) => {
  const { updateTask, deletePersonalEvent } = useGrade();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const dateObj = new Date(dateKey);
  const formattedDate = formatThaiBuddhistDate(dateObj);

  const dayItems = items.filter((i) => i.date === dateKey);
  const tasksCount = dayItems.filter((i) => i.type === 'task').length;
  const examsCount = dayItems.filter((i) => i.type === 'exam').length;
  const studyCount = dayItems.filter((i) => i.type === 'study').length;
  const personalCount = dayItems.filter((i) => i.type === 'personal').length;
  const goalsCount = dayItems.filter((i) => i.type === 'goal').length;

  const handleToggleTask = (task: Task) => {
    const isCurrentlyDone = task.status === 'submitted' || task.status === 'graded';
    updateTask({
      ...task,
      status: isCurrentlyDone ? 'todo' : 'submitted',
    });
    if (!isCurrentlyDone) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleDeletePersonalEvent = (id: string) => {
    deletePersonalEvent(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 p-5 sm:p-6 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {formattedDate || dateKey}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dayItems.length > 0
                ? `วันนี้มีทั้งหมด ${dayItems.length} รายการ (${[
                    tasksCount ? `${tasksCount} งาน` : '',
                    examsCount ? `${examsCount} สอบ` : '',
                    studyCount ? `${studyCount} รอบอ่าน` : '',
                    personalCount ? `${personalCount} กิจกรรม` : '',
                    goalsCount ? `${goalsCount} เป้าหมาย` : '',
                  ]
                    .filter(Boolean)
                    .join(', ')})`
                : 'ยังไม่มีรายการในวันนี้'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* Study Summary for this date if exists */}
          {studyStats && studyStats.totalMinutes > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-100 text-emerald-900 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="p-1 rounded-lg bg-emerald-200/80 text-emerald-800">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span>สถิติการอ่านหนังสือวันนี้</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                  {studyStats.totalMinutes} นาที ({studyStats.percentageOfGoal}%)
                </span>
              </div>
              <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, studyStats.percentageOfGoal)}%` }}
                />
              </div>
              <div className="text-xs text-emerald-700 flex flex-wrap gap-2">
                <span>จำนวน {studyStats.sessionCount} รอบอ่าน</span>
                {studyStats.subjects.length > 0 && (
                  <span>
                    • วิชา: {studyStats.subjects.map((s) => `${s.name} (${s.minutes}น.)`).join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* List of items */}
          {dayItems.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-400 shadow-inner">
                📅
              </div>
              <p className="text-sm font-bold text-slate-700">ยังไม่มีรายการในวันนี้</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                เพิ่มงาน การสอบ หรือกิจกรรมเพื่อเริ่มวางแผนวันนี้นะ ✨
              </p>
              <button
                type="button"
                onClick={() => onOpenAddItem(dateKey)}
                className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มรายการทันที</span>
              </button>
            </div>
          ) : (
            dayItems.map((item) => {
              if (item.type === 'task') {
                const task = item.raw as Task;
                const isDone = item.isCompleted;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-50/80 border-slate-200/60 opacity-75'
                        : 'bg-blue-50/60 border-blue-100 hover:border-blue-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 text-blue-600 hover:text-blue-700 shrink-0 transition-transform active:scale-90"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-blue-400 hover:text-blue-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                          🔵 งาน
                        </span>
                        {item.subjectName && (
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {item.subjectName}
                          </span>
                        )}
                        {item.time && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {item.time} น.
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm font-semibold mt-1 text-slate-800 ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.notes}</p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </div>
                );
              }

              if (item.type === 'exam') {
                const exam = item.raw as Exam;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 hover:border-purple-200 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200/80 text-purple-900">
                          🟣 สอบ
                        </span>
                        <span className="text-xs font-bold text-purple-900">
                          {item.subjectName}
                        </span>
                      </div>
                      {item.time && (
                        <span className="text-xs font-semibold text-purple-800 flex items-center gap-1 bg-purple-100/80 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {item.time} - {item.endTime || 'เสร็จสิ้น'}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      {exam.room && (
                        <p className="text-xs text-purple-700 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          ห้องสอบ: {exam.room}
                        </p>
                      )}
                      {exam.topics && exam.topics.length > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          <span className="font-semibold">หัวข้อ:</span> {exam.topics.join(', ')}
                        </p>
                      )}
                    </div>

                    {onNavigateToExams && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToExams();
                          }}
                          className="px-3 py-1 text-xs font-bold text-purple-700 bg-white hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>ดูรายละเอียดการสอบ</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === 'study') {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                          🟢 อ่านหนังสือ
                        </span>
                        {item.time && (
                          <span className="text-[11px] text-emerald-800 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mt-1 text-slate-800">{item.title}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {item.statusText}
                    </span>
                  </div>
                );
              }

              if (item.type === 'goal') {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/80 text-amber-900">
                        🟠 เป้าหมาย
                      </span>
                      <p className="text-sm font-semibold mt-1 text-slate-800">{item.title}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                      {item.statusText}
                    </span>
                  </div>
                );
              }

              if (item.type === 'personal') {
                const pe = item.raw as PersonalEvent;
                const isConfirmingDelete = deleteConfirmId === pe.id;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-200/80 text-pink-900">
                            🌸 {item.statusText || 'กิจกรรมส่วนตัว'}
                          </span>
                          {item.time && (
                            <span className="text-[11px] text-pink-800 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {item.time} {item.endTime ? `- ${item.endTime}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold mt-1 text-slate-800">{item.title}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-600 mt-0.5">{item.notes}</p>
                        )}
                      </div>

                      {/* Delete button with confirmation */}
                      <div>
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeletePersonalEvent(pe.id)}
                              className="px-2 py-1 text-[11px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              ยืนยันลบ
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-[11px] text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(pe.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="ลบกิจกรรม"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Footer Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={() => onOpenAddItem(dateKey)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มรายการในวันนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
