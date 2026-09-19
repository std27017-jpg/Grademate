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
import { getSubjectColor } from '../utils/colorUtils';

export const ExamsView: React.FC = () => {
  const {
    currentSemester,
    subjects,
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

  // Checklist of topics that the user marked as read (persisted in localStorage)
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mygrade_read_topics');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTopicCheck = (examId: string, topicIndex: number) => {
    const key = `${examId}_${topicIndex}`;
    setCheckedTopics((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('mygrade_read_topics', JSON.stringify(updated));
      } catch (e) {
        // Fallback
      }
      return updated;
    });
  };

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
    ? subjects.find((s) => s.id === nextExam.subjectId)
    : null;

  const toggleExamTopics = (examId: string) => {
    setExpandedExamTopics((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  const openAddModal = () => {
    const currentSubjects = subjects.filter((s) => s.semesterId === currentSemester);
    const firstSubId = currentSubjects[0]?.id || subjects[0]?.id || '';
    setEditingExam(null);
    setFormState({
      subjectId: firstSubId,
      examType: 'midterm',
      examDate: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '10:30',
      room: '',
      maxScore: '20',
      topicsText: '',
      tips: '',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 sm:p-6 rounded-3xl border border-white/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ตารางสอบ & แนวข้อสอบ
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full glass-secondary text-slate-700 border border-white/60">
              {filteredExams.length} การสอบ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            นับถอยหลังวันสอบ จัดการห้องสอบ และเช็คหัวข้อแนวข้อสอบแต่ละวิชา
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <SemesterToggle size="sm" />
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 app-theme-btn text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการสอบ</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards: สอบที่กำลังจะถึง | ตารางสอบ | หัวข้อสอบ | Progress การอ่าน */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-sky-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">🎯 สอบที่กำลังจะถึง</span>
          <div className="text-sm font-black text-slate-900 truncate mt-1">
            {nextExamSub?.name || 'ไม่มีการสอบเร็ว ๆ นี้'}
          </div>
          <span className="text-[11px] text-sky-700 font-bold block truncate">
            {nextExamDays !== null
              ? nextExamDays === 0
                ? 'สอบวันนี้!'
                : `อีก ${nextExamDays} วัน`
              : 'พร้อมสำหรับการสอบ'}
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-indigo-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">📅 ตารางสอบ</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {semesterExams.length} <span className="text-xs font-bold text-slate-600">วิชา</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-bold">ในภาคเรียนนี้</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-purple-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">📑 หัวข้อสอบทั้งหมด</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {semesterExams.reduce((acc, e) => acc + (e.topics?.length || 0), 0)}{' '}
            <span className="text-xs font-bold text-slate-600">หัวข้อ</span>
          </div>
          <span className="text-[11px] text-purple-700 font-bold">บันทึกแนวข้อสอบแล้ว</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">📚 Progress การอ่าน</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {Object.values(checkedTopics).filter(Boolean).length}{' '}
            <span className="text-xs font-bold text-slate-600">หัวข้ออ่านแล้ว</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">ทบทวนเตรียมพร้อม</span>
        </div>
      </div>

      {/* SECTION 8: การสอบครั้งถัดไป (Spotlight Card) */}
      {nextExam ? (
        <div className="glass-card rounded-3xl p-6 border border-sky-200/80 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white shadow-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>การสอบครั้งถัดไป</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>{nextExamSub?.name || 'ไม่พบข้อมูลวิชาของการสอบนี้'}</span>
                  <span className="text-sm font-bold text-sky-700 px-2.5 py-0.5 rounded-lg bg-sky-100/90 border border-sky-200">
                    {nextExam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {nextExamSub?.code ? `รหัสวิชา ${nextExamSub.code} • ` : ''}ห้องสอบ: {nextExam.room || 'ไม่ระบุ'} • คะแนนเต็ม {nextExam.maxScore} คะแนน
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
              <div className="glass-secondary px-4 py-2.5 rounded-2xl border border-sky-200 shadow-xs text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">นับถอยหลัง</span>
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <span>ดูแนวข้อสอบ & รายละเอียด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 text-center border border-white/80 text-slate-600 text-xs font-medium">
          ยังไม่มีการสอบในภาคเรียนนี้
        </div>
      )}

      {/* Filter and Section Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap glass-card p-2 sm:p-2.5 rounded-full border border-white/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {[
            { id: 'all' as const, label: 'ทั้งหมด', count: semesterExams.length },
            { id: 'midterm' as const, label: 'กลางภาค', count: semesterExams.filter(e => e.examType === 'midterm').length },
            { id: 'final' as const, label: 'ปลายภาค', count: semesterExams.filter(e => e.examType === 'final').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setExamTypeFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                examTypeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  examTypeFilter === tab.id ? 'bg-white/20 text-white' : 'glass-secondary text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500 px-3 hidden sm:inline">
          เรียงตามวันสอบที่ใกล้ที่สุด
        </span>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP EXAM SCHEDULE TABLE                                              */}
      {/* ========================================================================= */}
      <div className="hidden md:block glass-card rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 text-xs font-black text-slate-700 bg-white/40">
                <th className="py-3.5 px-4">วันที่ & เวลา</th>
                <th className="py-3.5 px-4">วิชาที่สอบ</th>
                <th className="py-3.5 px-4 text-center">ประเภท</th>
                <th className="py-3.5 px-4 text-center">ห้องสอบ</th>
                <th className="py-3.5 px-4 text-center">คะแนนเต็ม</th>
                <th className="py-3.5 px-4 text-center">นับถอยหลัง</th>
                <th className="py-3.5 px-4 text-center">แนวข้อสอบ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 text-xs font-medium">
              {filteredExams.map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);
                const subName = sub?.name || 'ไม่พบข้อมูลวิชาของการสอบนี้';
                const days = getDaysRemaining(exam.examDate);
                const isDetailsOpen = Boolean(expandedExamTopics[exam.id]);
                const topics = exam.topics || [];
                const readCount = topics.filter((_, idx) => checkedTopics[`${exam.id}_${idx}`]).length;

                return (
                  <React.Fragment key={exam.id}>
                    <tr className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatShortThaiDate(exam.examDate)}</div>
                        <div className="text-[11px] text-slate-500">{exam.startTime} - {exam.endTime} น.</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: getSubjectColor(sub?.color) }}
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">{subName}</div>
                            {sub?.code && <div className="text-[11px] text-slate-500">รหัส {sub.code}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                          {exam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 font-bold">
                        {exam.room || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-900 font-black">
                        {exam.maxScore}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-black text-[11px] px-2.5 py-1 rounded-full shadow-2xs ${
                            days === 0
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : days > 0
                              ? 'bg-sky-100 text-sky-800 border border-sky-200/80'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {days === 0 ? 'สอบวันนี้!' : days > 0 ? `อีก ${days} วัน` : 'สอบแล้ว'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExamTopics(exam.id)}
                          className="px-3 py-1 rounded-xl text-xs font-bold glass-secondary hover:bg-white text-slate-800 border border-white/80 transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                        >
                          <span>{topics.length > 0 ? `${readCount}/${topics.length} หัวข้อ` : 'แนวข้อสอบ'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(exam)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
                            title="แก้ไขการสอบ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteExam(exam.id)}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ลบการสอบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isDetailsOpen && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={8} className="p-4">
                          <div className="space-y-3 glass-secondary p-4 rounded-2xl border border-white/60 text-xs">
                            <div className="font-bold text-slate-800">
                              Checklist แนวข้อสอบ {subName} (คลิกเพื่อบันทึกว่าอ่านแล้ว):
                            </div>
                            {topics.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {topics.map((topic, i) => {
                                  const isRead = Boolean(checkedTopics[`${exam.id}_${i}`]);
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => toggleTopicCheck(exam.id, i)}
                                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        isRead
                                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                          : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white'
                                      }`}
                                    >
                                      <div className="mt-0.5 shrink-0">
                                        {isRead ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-md border-2 border-slate-300" />
                                        )}
                                      </div>
                                      <span className={`leading-snug ${isRead ? 'line-through text-slate-400' : 'font-medium'}`}>
                                        {topic}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">ยังไม่ได้ระบุหัวข้อแนวข้อสอบ</p>
                            )}

                            {exam.tips && (
                              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-800 mt-2">
                                <span className="font-bold">💡 เกร็ดข้อสอบ: </span>
                                <span>{exam.tips}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredExams.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs font-medium">
            ไม่มีรายการสอบในหมวดนี้
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE EXAM CARDS                                                         */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam) => {
            const sub = subjects.find((s) => s.id === exam.subjectId);
            const subName = sub?.name || 'ไม่พบข้อมูลวิชาของการสอบนี้';
            const days = getDaysRemaining(exam.examDate);
            const isDetailsOpen = Boolean(expandedExamTopics[exam.id]);
            const topics = exam.topics || [];
            const readCount = topics.filter((_, idx) => checkedTopics[`${exam.id}_${idx}`]).length;

            return (
              <div
                key={exam.id}
                className="glass-card rounded-3xl p-5 border border-white/80 shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top: 📅 Date & Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-900 font-extrabold">{formatShortThaiDate(exam.examDate)}</span>
                        <span className="text-slate-500 font-normal ml-1.5 text-[11px]">{exam.startTime} - {exam.endTime} น.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-[11px] px-3 py-1 rounded-full shadow-2xs ${
                          days === 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            : days > 0
                            ? 'bg-sky-100 text-sky-800 border border-sky-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {days === 0 ? 'สอบวันนี้!' : days > 0 ? `เหลืออีก ${days} วัน` : `สอบแล้ว`}
                      </span>

                      {/* Quick Edit/Delete */}
                      <button
                        type="button"
                        onClick={() => openEditModal(exam)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
                        title="แก้ไขการสอบ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExam(exam.id)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบการสอบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ◯ ไอคอนวิชา + ชื่อวิชา & ประเภทสอบ */}
                  <div className="flex items-center gap-3 p-3 glass-secondary rounded-2xl border border-white/60">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: getSubjectColor(sub?.color),
                        color: '#ffffff',
                      }}
                    >
                      {subName.charAt(0) || 'ส'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                          {subName}
                        </h4>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                          {exam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {sub?.code && <span>รหัส {sub.code} • </span>}
                        <span>ห้อง {exam.room || 'ไม่ระบุ'}</span>
                        <span>•</span>
                        <span>{exam.maxScore} คะแนน</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Summary (Read Progress) */}
                  {topics.length > 0 && (
                    <div className="flex items-center justify-between px-1 text-xs">
                      <span className="text-slate-600 font-medium">
                        เนื้อหาที่ต้องอ่าน ({readCount}/{topics.length} หัวข้อ)
                      </span>
                      <span className={`font-bold ${readCount === topics.length ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {readCount === topics.length ? 'อ่านครบแล้ว! 🎉' : `${Math.round((readCount / topics.length) * 100)}%`}
                      </span>
                    </div>
                  )}

                  {/* Expandable Details & Checklist */}
                  {isDetailsOpen && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/50 animate-in fade-in duration-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block mb-2">
                          Checklist เนื้อหาที่ต้องอ่าน (ติ๊กเมื่ออ่านแล้ว):
                        </span>
                        {topics.length > 0 ? (
                          <div className="space-y-2">
                            {topics.map((topic, i) => {
                              const isRead = Boolean(checkedTopics[`${exam.id}_${i}`]);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => toggleTopicCheck(exam.id, i)}
                                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    isRead
                                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                      : 'glass-secondary border-white/70 text-slate-700 hover:bg-white'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isRead ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-md border-2 border-slate-300" />
                                    )}
                                  </div>
                                  <span className={`leading-snug ${isRead ? 'line-through text-slate-400' : 'font-medium'}`}>
                                    {topic}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">ยังไม่ได้ระบุหัวข้อแนวข้อสอบ</p>
                        )}
                      </div>

                      {exam.tips && (
                        <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/70 text-amber-800">
                          <span className="font-bold">💡 เกร็ดข้อสอบ: </span>
                          <span>{exam.tips}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Action Button: [ ดูรายละเอียด ] */}
                <button
                  type="button"
                  onClick={() => toggleExamTopics(exam.id)}
                  className="w-full py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{isDetailsOpen ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด & Checklist'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center border border-white/80 text-slate-600 text-xs font-medium">
            ไม่มีรายการสอบในหมวดนี้
          </div>
        )}
      </div>

      {/* Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto box-border border border-white/80">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
                >
                  {subjects
                    .filter((s) => s.semesterId === currentSemester)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  {subjects.filter((s) => s.semesterId === currentSemester).length === 0 && (
                    <option value="">ไม่มีรายวิชาในภาคเรียนนี้</option>
                  )}
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium glass-input"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium glass-input"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium glass-input"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold app-theme-btn text-white shadow-xs cursor-pointer active:scale-95"
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
