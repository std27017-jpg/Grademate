import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  BookCheck,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { Exam, StudyStatus } from '../types';
import { SemesterToggle } from './SemesterToggle';
import { formatThaiDate, formatShortThaiDate, getDaysRemaining } from '../utils/gradeCalculations';

export const ExamsView: React.FC = () => {
  const {
    currentSemester,
    activeSemesterSummary,
    exams,
    addExam,
    updateExam,
    deleteExam,
  } = useGrade();

  const [examTypeFilter, setExamTypeFilter] = useState<'all' | 'midterm' | 'final'>('all');
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
    maxScore: '30',
    topicsText: '',
    tips: '',
    studyStatus: 'reading_50',
  });

  // Filter exams by current semester
  const semesterExams = exams.filter((e) => e.semesterId === currentSemester);
  const filteredExams = semesterExams.filter((e) => {
    if (examTypeFilter !== 'all' && e.examType !== examTypeFilter) return false;
    return true;
  });

  // Sort by date
  filteredExams.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  const openAddModal = () => {
    const firstSubId = activeSemesterSummary.subjectSummaries[0]?.subject.id || '';
    setEditingExam(null);
    setFormState({
      subjectId: firstSubId,
      examType: 'midterm',
      examDate: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '10:30',
      room: 'อาคาร 3 ห้อง 324',
      maxScore: '30',
      topicsText: 'บทที่ 1\nบทที่ 2\nบทที่ 3',
      tips: 'เน้นข้อกาและสูตรสำคัญ',
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
      room: exam.room,
      maxScore: exam.maxScore.toString(),
      topicsText: (exam.topics || []).join('\n'),
      tips: exam.tips || '',
      studyStatus: exam.studyStatus,
    });
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.subjectId) return;

    const topics = formState.topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const maxScoreNum = parseFloat(formState.maxScore) || 30;

    if (editingExam) {
      updateExam({
        ...editingExam,
        subjectId: formState.subjectId,
        examType: formState.examType,
        examDate: formState.examDate,
        startTime: formState.startTime,
        endTime: formState.endTime,
        room: formState.room,
        maxScore: maxScoreNum,
        topics,
        tips: formState.tips,
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
        room: formState.room,
        maxScore: maxScoreNum,
        topics,
        tips: formState.tips,
        studyStatus: formState.studyStatus,
      });
    }

    setIsModalOpen(false);
  };

  const studyStatusMap: Record<StudyStatus, { label: string; bg: string; text: string }> = {
    not_started: { label: 'ยังไม่ได้อ่าน ⏳', bg: 'bg-slate-100', text: 'text-slate-700' },
    reading_50: { label: 'กำลังอ่าน 50% 📖', bg: 'bg-amber-100', text: 'text-amber-800' },
    reviewed_once: { label: 'อ่านจบแล้วรอบ 1 🎯', bg: 'bg-blue-100', text: 'text-blue-800' },
    ready_for_exam: { label: 'ทบทวนพร้อมสอบ ✨', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ตารางสอบ & นับถอยหลัง (Countdown)
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentSemester === 'term1' ? '📘 เทอม 1' : '📕 เทอม 2'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            แยกสอบกลางภาค & ปลายภาค • หัวข้อที่ออกสอบ • แนวข้อสอบ • สถานะการอ่านหนังสือ
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
            <span>เพิ่มตารางสอบ</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setExamTypeFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            examTypeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ทั้งหมด ({semesterExams.length})
        </button>
        <button
          type="button"
          onClick={() => setExamTypeFilter('midterm')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            examTypeFilter === 'midterm'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          สอบกลางภาค
        </button>
        <button
          type="button"
          onClick={() => setExamTypeFilter('final')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            examTypeFilter === 'final'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          สอบปลายภาค
        </button>
      </div>

      {/* Exam Cards */}
      {filteredExams.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            📅
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            ยังไม่มีตารางสอบสำหรับ{currentSemester === 'term1' ? 'เทอม 1' : 'เทอม 2'}
          </h3>
          <p className="text-xs text-slate-500">
            กดปุ่ม "เพิ่มตารางสอบ" เพื่อบันทึกวันสอบและหัวข้อทบทวน
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const subject = activeSemesterSummary.subjectSummaries.find(
              (s) => s.subject.id === exam.subjectId
            )?.subject;
            const daysRemaining = getDaysRemaining(exam.examDate);
            const statusInfo = studyStatusMap[exam.studyStatus] || studyStatusMap.not_started;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all p-6 space-y-4 overflow-hidden"
              >
                {/* Top Section: Subject & Countdown Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white">
                        {exam.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {subject?.code || 'รหัสวิชา'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {exam.maxScore} คะแนน
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      {subject?.name || 'วิชา'}
                    </h3>
                  </div>

                  {/* Countdown Badge (e.g. “สอบคณิตศาสตร์กลางภาค เหลืออีก 7 วัน”) */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-4 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-sm ${
                        daysRemaining < 0
                          ? 'bg-slate-100 text-slate-600'
                          : daysRemaining === 0
                          ? 'bg-rose-600 text-white animate-pulse'
                          : daysRemaining <= 3
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>
                        {daysRemaining < 0
                          ? 'สอบเสร็จสิ้นแล้ว'
                          : daysRemaining === 0
                          ? `สอบ${subject?.name || ''}วันนี้!`
                          : `สอบ${subject?.name || ''}${exam.examType === 'midterm' ? 'กลางภาค' : 'ปลายภาค'} เหลืออีก ${daysRemaining} วัน`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(exam)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExam(exam.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exam Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>วันที่: <strong className="text-slate-900">{formatThaiDate(exam.examDate)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>เวลา: <strong className="text-slate-900">{exam.startTime} - {exam.endTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>ห้องสอบ: <strong className="text-slate-900">{exam.room}</strong></span>
                  </div>
                </div>

                {/* Topics & Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Topics list */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookCheck className="w-3.5 h-3.5 text-indigo-600" />
                      หัวข้อที่ออกสอบ:
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {exam.topics && exam.topics.length > 0 ? (
                        exam.topics.map((topic, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-500 font-bold mt-0.5">•</span>
                            <span>{topic}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">ยังไม่ได้ระบุหัวข้อ</li>
                      )}
                    </ul>
                  </div>

                  {/* Tips & Study Status */}
                  <div className="space-y-3">
                    {exam.tips && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                        <span className="font-bold text-amber-900 block mb-0.5">
                          💡 แนวข้อสอบ / เคล็ดลับ:
                        </span>
                        <p className="text-amber-800">{exam.tips}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-600">
                        สถานะการอ่านหนังสือ:
                      </span>
                      <select
                        value={exam.studyStatus}
                        onChange={(e) =>
                          updateExam({
                            ...exam,
                            studyStatus: e.target.value as StudyStatus,
                          })
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        <option value="not_started">ยังไม่ได้อ่าน ⏳</option>
                        <option value="reading_50">กำลังอ่าน 50% 📖</option>
                        <option value="reviewed_once">อ่านจบแล้วรอบ 1 🎯</option>
                        <option value="ready_for_exam">ทบทวนพร้อมสอบ ✨</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingExam ? 'แก้ไขตารางสอบ' : 'เพิ่มตารางสอบใหม่'}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentSemester === 'term1' ? '📘 เทอม 1' : '📕 เทอม 2'}
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

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                        {s.subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ประเภทการสอบ *
                  </label>
                  <select
                    value={formState.examType}
                    onChange={(e) => setFormState({ ...formState, examType: e.target.value as 'midterm' | 'final' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  >
                    <option value="midterm">สอบกลางภาค</option>
                    <option value="final">สอบปลายภาค</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่สอบ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.examDate}
                    onChange={(e) => setFormState({ ...formState, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ห้องสอบ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น อาคาร 3 ห้อง 324"
                    value={formState.room}
                    onChange={(e) => setFormState({ ...formState, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    จำนวนคะแนนเต็ม *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formState.maxScore}
                    onChange={(e) => setFormState({ ...formState, maxScore: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อที่ออกสอบ (แยกบรรทัดละ 1 หัวข้อ)
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น&#10;ฟังก์ชันเชิงเส้น&#10;เมทริกซ์และดีเทอร์มิแนนต์&#10;ตรีโกณมิติ"
                  value={formState.topicsText}
                  onChange={(e) => setFormState({ ...formState, topicsText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แนวข้อสอบ / เคล็ดลับ
                </label>
                <input
                  type="text"
                  placeholder="เช่น เน้นข้อกา 30 ข้อ และแสดงวิธีทำ 2 ข้อ"
                  value={formState.tips}
                  onChange={(e) => setFormState({ ...formState, tips: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สถานะการอ่านหนังสือ
                </label>
                <select
                  value={formState.studyStatus}
                  onChange={(e) => setFormState({ ...formState, studyStatus: e.target.value as StudyStatus })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                >
                  <option value="not_started">ยังไม่ได้อ่าน ⏳</option>
                  <option value="reading_50">กำลังอ่าน 50% 📖</option>
                  <option value="reviewed_once">อ่านจบแล้วรอบ 1 🎯</option>
                  <option value="ready_for_exam">ทบทวนพร้อมสอบ ✨</option>
                </select>
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
                  {editingExam ? 'บันทึกการแก้ไข' : 'สร้างตารางสอบ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
