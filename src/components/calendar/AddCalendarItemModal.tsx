import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../../context/GradeContext';
import { ScorePeriodKey, TaskStatus, StudyStatus } from '../../types';
import { CalendarItemType } from '../../utils/calendarUtils';

interface AddCalendarItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultType?: CalendarItemType;
  onSuccess?: () => void;
}

export const AddCalendarItemModal: React.FC<AddCalendarItemModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultType = 'task',
  onSuccess,
}) => {
  const {
    currentSemester,
    subjects,
    addTask,
    addExam,
    addStudySession,
    addFutureTodo,
    addPersonalEvent,
  } = useGrade();

  const [activeType, setActiveType] = useState<CalendarItemType>(defaultType);

  // Common Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  // Task specific
  const [periodKey, setPeriodKey] = useState<ScorePeriodKey>('preMidterm');
  const [taskDueTime, setTaskDueTime] = useState('18:00');
  const [maxScore, setMaxScore] = useState('10');

  // Exam specific
  const [examType, setExamType] = useState<'midterm' | 'final'>('midterm');
  const [room, setRoom] = useState('');
  const [topics, setTopics] = useState('');
  const [tips, setTips] = useState('');

  // Study specific
  const [studyTopic, setStudyTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');

  // Goal specific
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Personal Event specific
  const [category, setCategory] = useState('กิจกรรม');

  // Validation / Error
  const [error, setError] = useState<string | null>(null);

  // Initialize state when opened
  useEffect(() => {
    if (isOpen) {
      setActiveType(defaultType);
      const initialDate = defaultDate || new Date().toISOString().split('T')[0];
      setDate(initialDate);
      const semSubjects = subjects.filter((s) => s.semesterId === currentSemester);
      const firstSub = semSubjects[0]?.id || subjects[0]?.id || '';
      setSelectedSubjectId(firstSub);
      setTitle('');
      setNotes('');
      setError(null);
    }
  }, [isOpen, defaultDate, defaultType, subjects, currentSemester]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('กรุณาระบุชื่อรายการ');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    try {
      if (activeType === 'task') {
        if (!selectedSubjectId) {
          setError('กรุณาเลือกวิชา');
          return;
        }
        addTask({
          semesterId: currentSemester,
          subjectId: selectedSubjectId,
          title: trimmedTitle,
          periodKey,
          dueDate: date,
          dueTime: taskDueTime || undefined,
          maxScore: parseFloat(maxScore) || 10,
          status: 'todo' as TaskStatus,
          notes: notes.trim() || undefined,
        });
      } else if (activeType === 'exam') {
        if (!selectedSubjectId) {
          setError('กรุณาเลือกวิชา');
          return;
        }
        const topicsList = topics
          ? topics
              .split(/[\n,]+/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
        addExam({
          semesterId: currentSemester,
          subjectId: selectedSubjectId,
          examType,
          examDate: date,
          startTime: startTime || '08:30',
          endTime: endTime || '10:30',
          room: room.trim() || 'ห้องสอบ',
          maxScore: parseFloat(maxScore) || 20,
          topics: topicsList,
          tips: tips.trim() || '',
          studyStatus: 'not_started' as StudyStatus,
        });
      } else if (activeType === 'study') {
        const sub = subjects.find((s) => s.id === selectedSubjectId);
        addStudySession({
          subjectId: selectedSubjectId || 'general',
          subjectName: sub?.name || trimmedTitle,
          subjectCode: sub?.code,
          category: sub?.category || 'ทั่วไป',
          topic: studyTopic.trim() || trimmedTitle,
          date,
          startTime: startTime || '19:00',
          durationMinutes: parseInt(durationMinutes, 10) || 45,
          mode: 'normal',
          notes: notes.trim() || undefined,
        });
      } else if (activeType === 'goal') {
        addFutureTodo({
          title: trimmedTitle,
          dueDate: date,
          priority,
          isCompleted: false,
          notes: notes.trim() || undefined,
        });
      } else if (activeType === 'personal') {
        addPersonalEvent({
          title: trimmedTitle,
          date,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          details: notes.trim() || undefined,
          category: category.trim() || 'กิจกรรม',
        });
      }

      // Trigger soft celebratory confetti
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // Safe fallback
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const semSubjects = subjects.filter((s) => s.semesterId === currentSemester);
  const displaySubjects = semSubjects.length > 0 ? semSubjects : subjects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 p-5 sm:p-6 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📅</span>
              <span>เพิ่มรายการลงในปฏิทิน</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เชื่อมโยงข้อมูลจริงกับระบบงาน การสอบ และการอ่านหนังสือ
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

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeType === 'task'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="text-sm">🔵</span>
            <span>งาน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('exam')}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeType === 'exam'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="text-sm">🟣</span>
            <span>สอบ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('study')}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeType === 'study'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="text-sm">🟢</span>
            <span>อ่าน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('goal')}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeType === 'goal'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="text-sm">🟠</span>
            <span>เป้าหมาย</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('personal')}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeType === 'personal'
                ? 'bg-pink-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span className="text-sm">🌸</span>
            <span>กิจกรรม</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto px-0.5 pr-1">
          {/* Subject Field (For task, exam, study) */}
          {(activeType === 'task' || activeType === 'exam' || activeType === 'study') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รายวิชา <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                required
              >
                {displaySubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `[${s.code}] ` : ''}
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {activeType === 'task'
                ? 'ชื่องาน / การบ้าน'
                : activeType === 'exam'
                ? 'ชื่อการสอบ / รายละเอียด'
                : activeType === 'study'
                ? 'วิชา / เนื้อหาที่อ่าน'
                : activeType === 'goal'
                ? 'หัวข้อเป้าหมาย'
                : 'ชื่อกิจกรรมส่วนตัว'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeType === 'task'
                  ? 'เช่น ทำแบบฝึกหัดท้ายบทที่ 4'
                  : activeType === 'exam'
                  ? 'เช่น สอบเก็บคะแนนหน่วยที่ 2'
                  : activeType === 'study'
                  ? 'เช่น สรุปสูตรตรีโกณมิติ'
                  : activeType === 'goal'
                  ? 'เช่น อ่านหนังสือชีววิทยาให้จบเล่ม 1'
                  : 'เช่น ประชุมโครงงานกลุ่ม, นัดหมอฟัน'
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              required
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                required
              />
            </div>

            {activeType === 'task' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เวลากำหนดส่ง (ถ้ามี)
                </label>
                <input
                  type="time"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            )}

            {(activeType === 'exam' || activeType === 'personal') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เวลาเริ่ม</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            )}

            {activeType === 'study' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระยะเวลาที่อ่าน (นาที)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            )}
          </div>

          {/* Exam Specific Fields */}
          {activeType === 'exam' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทการสอบ</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as 'midterm' | 'final')}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition-all"
                  >
                    <option value="midterm">สอบกลางภาค</option>
                    <option value="final">สอบปลายภาค</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ห้องสอบ</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="เช่น 324 อาคาร 3"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อที่ออกสอบ (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่)
                </label>
                <textarea
                  rows={2}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="เช่น ตรีโกณมิติ, เวกเตอร์, เมทริกซ์"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition-all"
                />
              </div>
            </>
          )}

          {/* Goal Specific Fields */}
          {activeType === 'goal' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ระดับความสำคัญ</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all"
              >
                <option value="high">🔴 สำคัญมาก (High)</option>
                <option value="medium">🟡 ปานกลาง (Medium)</option>
                <option value="low">🟢 ทั่วไป (Low)</option>
              </select>
            </div>
          )}

          {/* Personal Event Category */}
          {activeType === 'personal' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่กิจกรรม</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-hidden transition-all"
              >
                <option value="กิจกรรม">🎪 กิจกรรม / ชุมนุม</option>
                <option value="ประชุม">👥 ประชุมงานกลุ่ม</option>
                <option value="โรงเรียน">🏫 กิจกรรมโรงเรียน</option>
                <option value="ส่วนตัว">✨ ธุระส่วนตัว</option>
                <option value="อื่น ๆ">📌 อื่น ๆ</option>
              </select>
            </div>
          )}

          {/* Notes / Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              หมายเหตุ / บันทึกเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ข้อความช่วยจำเพิ่มเติม..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกลงปฏิทิน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
