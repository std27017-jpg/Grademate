import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { Exam, StudyStatus } from '../types';
import { SemesterToggle } from './SemesterToggle';
import { formatShortThaiDate, getDaysRemaining } from '../utils/gradeCalculations';

export const ExamsView: React.FC = () => {
  const {
    currentSemester,
    activeSemesterSummary,
    exams,
    addExam,
    updateExam,
    deleteExam,
  } = useGrade();

  // Show all exams toggle (Section 8: Show next exam first, then [ดูตารางสอบทั้งหมด])
  const [showAllExams, setShowAllExams] = useState(false);

  // Track expanded topics checklist per exam (Section 9 requirement)
  const [expandedExamTopics, setExpandedExamTopics] = useState<Record<string, boolean>>({});

  // Filter exam type: 'all' | 'midterm' | 'final'
  const [examTypeFilter, setExamTypeFilter] = useState<'all' | 'midterm' | 'final'>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [formState, setFormState] = useState<{
    subjectId: string;
    examType: 'midterm' | 'final';
    examDate: string;
    startTime: string;
    endTime: string;
    room: string;
    maxScore: string;
    topicsText: string;
    tips: string;
    studyStatus: StudyStatus;
  }>({
    subjectId: '',
    examType: 'midterm',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:30',
    room: 'ห้อง 324',
    maxScore: '20',
    topicsText: '',
    tips: '',
    studyStatus: 'not_started',
  });

  // Current semester exams
  const semesterExams = exams.filter((e) => e.semesterId === currentSemester);
  const filteredExams = semesterExams.filter((e) => {
    if (examTypeFilter !== 'all' && e.examType !== examTypeFilter) return false;
    return true;
  });

  // Sort by date upcoming
  filteredExams.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  // Next immediate exam
  const nextExam = filteredExams[0];
  const nextExamDays = nextExam ? getDaysRemaining(nextExam.examDate) : null;
  const nextExamSub = nextExam
    ? activeSemesterSummary.subjectSummaries.find((s) => s.subject.id === nextExam.subjectId)?.subject
    : null;

  const toggleExamTopics = (examId: string) => {
    setExpandedExamTopics((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  const openAddModal = () => {
    const firstSubId = activeSemesterSummary.subjectSummaries[0]?.subject.id || '';
    setEditingExam(null);
    setFormState({
      subjectId: firstSubId,
      examType: 'midterm',
      examDate: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '10:30',
      room: 'ห้อง 324',
      maxScore: '20',
      topicsText: 'ลำดับและอนุกรม\nความน่าจะเป็น\nเซต',
      tips: 'ทบทวนสูตรและตัวอย่างข้อสอบเก่า',
      studyStatus: 'not_started',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormState({
      subjectId: exam.subjectId,
      examType: exam.examType,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      room: exam.room || '',
      maxScore: exam.maxScore.toString(),
      topicsText: exam.topics ? exam.topics.join('\n') : '',
      tips: exam.tips || '',
      studyStatus: exam.studyStatus,
    });
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.subjectId) return;

    const topicsArray = formState.topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingExam) {
      updateExam({
        ...editingExam,
        subjectId: formState.subjectId,
        examType: formState.examType,
        examDate: formState.examDate,
        startTime: formState.startTime,
        endTime: formState.endTime,
        room: formState.room.trim() || undefined,
        maxScore: parseFloat(formState.maxScore) || 20,
        topics: topicsArray,
        tips: formState.tips.trim() || undefined,
        studyStatus: formState.studyStatus,
      });
    } else {
      addExam({
        semesterId: currentSemester,
        subjectId: formState.subjectId,
        examType: formState.examType,
        examDate: formState.examDate,
        startTime: formState.startTime,
        endTime: formState.endTime,
        room: formState.room.trim() || undefined,
        maxScore: parseFloat(formState.maxScore) || 20,
        topics: topicsArray,
        tips: formState.tips.trim() || undefined,
        studyStatus: formState.studyStatus,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ตารางสอบ & แนวข้อสอบ
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredExams.length} การสอบ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            นับถอยหลังวันสอบ จัดการห้องสอบ และเช็คหัวข้อแนวข้อสอบแต่ละวิชา
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SemesterToggle size="sm" />
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการสอบ</span>
          </button>
        </div>
      </div>

      {/* SECTION 8: การสอบครั้งถัดไป (Spotlight Card) */}
      {nextExam && nextExamSub ? (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white rounded-3xl p-6 border border-sky-200/80 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white shadow-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>การสอบครั้งถัดไป</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>{nextExamSub.name}</span>
                  <span className="text-sm font-bold text-sky-700 px-2.5 py-0.5 rounded-lg bg-sky-100 border border-sky-200">
                    {nextExam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รหัสวิชา {nextExamSub.code} • ห้องสอบ: {nextExam.room || 'ไม่ระบุ'} • คะแนนเต็ม {nextExam.maxScore} คะแนน
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  {formatShortThaiDate(nextExam.examDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-sky-600" />
                  {nextExam.startTime} - {nextExam.endTime} น.
                </span>
              </div>
            </div>

            {/* Countdown Badge & Action */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-sky-200 shadow-2xs text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">นับถอยหลัง</span>
                <span className="text-2xl font-black text-sky-600">
                  {nextExamDays === 0 ? 'สอบวันนี้!' : `เหลืออีก ${nextExamDays} วัน`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAllExams(true);
                  toggleExamTopics(nextExam.id);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>ดูแนวข้อสอบ & รายละเอียด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 text-slate-500 text-xs">
          ยังไม่มีการสอบในภาคเรียนนี้
        </div>
      )}

      {/* SECTION 8: [ ดูตารางสอบทั้งหมด ] Toggle */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setShowAllExams((prev) => !prev)}
          className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{showAllExams ? 'ย่อตารางสอบ' : `ดูตารางสอบทั้งหมด (${filteredExams.length} รายการ)`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAllExams ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter midterm vs final */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all' as const, label: 'ทั้งหมด' },
            { id: 'midterm' as const, label: 'กลางภาค' },
            { id: 'final' as const, label: 'ปลายภาค' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setExamTypeFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                examTypeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ALL EXAMS LIST & TOPICS CHECKLIST (Shown when expanded or if there are multiple) */}
      {showAllExams && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam) => {
              const sub = activeSemesterSummary.subjectSummaries.find(
                (s) => s.subject.id === exam.subjectId
              )?.subject;
              const days = getDaysRemaining(exam.examDate);
              const isTopicsOpen = Boolean(expandedExamTopics[exam.id]);

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top title & edit/delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base truncate">
                            {sub?.name || 'การสอบ'}
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {exam.examType === 'midterm' ? 'กลางภาค' : 'ปลายภาค'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          รหัส {sub?.code} • ห้อง {exam.room || 'ไม่ระบุ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(exam)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExam(exam.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Time & Date */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">วันสอบ</span>
                        <span className="font-bold text-slate-800">{formatShortThaiDate(exam.examDate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">เวลาสอบ</span>
                        <span className="font-bold text-slate-800">{exam.startTime} - {exam.endTime} น.</span>
                      </div>
                    </div>

                    {/* SECTION 9: แนวข้อสอบ Checklist แบบพับได้ */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleExamTopics(exam.id)}
                        className="w-full p-3 bg-slate-50/80 hover:bg-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>แนวข้อสอบ & หัวข้อที่ออกสอบ ({exam.topics?.length || 0})</span>
                        </span>
                        {isTopicsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isTopicsOpen && (
                        <div className="p-3.5 bg-white space-y-2 border-t border-slate-200 text-xs">
                          {exam.topics && exam.topics.length > 0 ? (
                            <div className="space-y-1.5">
                              {exam.topics.map((topic, i) => (
                                <div key={i} className="flex items-start gap-2 text-slate-800">
                                  <span className="text-indigo-600 font-bold text-sm leading-none mt-0.5">▸</span>
                                  <span className="font-medium">{topic}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">ยังไม่ได้ระบุหัวข้อแนวข้อสอบ</p>
                          )}

                          {exam.tips && (
                            <div className="pt-2 border-t border-slate-100 text-amber-800 font-medium">
                              <span className="font-bold">💡 เกร็ดข้อสอบ: </span>
                              {exam.tips}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Countdown pill */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">คะแนนเต็ม {exam.maxScore} คะแนน</span>
                    <span
                      className={`font-black px-2.5 py-0.5 rounded-full ${
                        days === 0
                          ? 'bg-rose-100 text-rose-800'
                          : days > 0
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {days === 0 ? 'สอบวันนี้' : days > 0 ? `เหลืออีก ${days} วัน` : `สอบผ่านไปแล้ว`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              {editingExam ? 'แก้ไขกำหนดการสอบ' : 'เพิ่มกำหนดการสอบ'}
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วิชาที่สอบ
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
                    ประเภทการสอบ
                  </label>
                  <select
                    value={formState.examType}
                    onChange={(e) =>
                      setFormState({ ...formState, examType: e.target.value as 'midterm' | 'final' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="midterm">สอบกลางภาค</option>
                    <option value="final">สอบปลายภาค</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันสอบ
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.examDate}
                    onChange={(e) => setFormState({ ...formState, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลาเริ่มสอบ
                  </label>
                  <input
                    type="time"
                    required
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    required
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ห้องสอบ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ห้อง 324"
                    value={formState.room}
                    onChange={(e) => setFormState({ ...formState, room: e.target.value })}
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

              {/* Section 9 topics */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อแนวข้อสอบ (ใส่บรรทัดละ 1 หัวข้อ)
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น&#10;ลำดับและอนุกรม&#10;ความน่าจะเป็น&#10;เซต"
                  value={formState.topicsText}
                  onChange={(e) => setFormState({ ...formState, topicsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เกร็ดข้อสอบ / คำแนะนำ
                </label>
                <input
                  type="text"
                  placeholder="เช่น เน้นข้อกาและสูตรสำคัญ"
                  value={formState.tips}
                  onChange={(e) => setFormState({ ...formState, tips: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
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
