import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calculator,
  Award,
  Layers,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { ScorePeriodKey, Subject, ScoreItem } from '../types';
import { calculateSubjectSummary, PERIOD_CONFIG } from '../utils/gradeCalculations';
import { SemesterToggle } from './SemesterToggle';

interface SubjectsViewProps {
  onOpenAddSubject: () => void;
  onOpenEditSubject: (subject: Subject) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onOpenAddSubject,
  onOpenEditSubject,
}) => {
  const {
    currentSemester,
    activeSemesterSummary,
    addScoreItem,
    updateScoreItem,
    deleteScoreItem,
    deleteSubject,
  } = useGrade();

  // Expanded subject accordion state (all open by default for rich visibility)
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});

  // Add/Edit Sub-score item modal/drawer state
  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    subjectId: string;
    periodKey: ScorePeriodKey;
    editingItem?: ScoreItem;
  }>({
    isOpen: false,
    subjectId: '',
    periodKey: 'preMidterm',
  });

  const [itemForm, setItemForm] = useState({
    title: '',
    score: '',
    maxScore: '',
    notes: '',
  });

  const toggleExpand = (subjectId: string) => {
    setExpandedSubjectIds((prev) => ({
      ...prev,
      [subjectId]: prev[subjectId] !== undefined ? !prev[subjectId] : false,
    }));
  };

  const openAddItem = (subjectId: string, periodKey: ScorePeriodKey) => {
    setItemModal({
      isOpen: true,
      subjectId,
      periodKey,
      editingItem: undefined,
    });
    setItemForm({
      title: '',
      score: '',
      maxScore: periodKey === 'midterm' || periodKey === 'final' ? '30' : '10',
      notes: '',
    });
  };

  const openEditItem = (subjectId: string, periodKey: ScorePeriodKey, item: ScoreItem) => {
    setItemModal({
      isOpen: true,
      subjectId,
      periodKey,
      editingItem: item,
    });
    setItemForm({
      title: item.title,
      score: item.score.toString(),
      maxScore: item.maxScore.toString(),
      notes: item.notes || '',
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim() || !itemForm.maxScore) return;

    const scoreNum = parseFloat(itemForm.score) || 0;
    const maxScoreNum = parseFloat(itemForm.maxScore) || 10;

    if (itemModal.editingItem) {
      updateScoreItem(itemModal.subjectId, itemModal.periodKey, {
        ...itemModal.editingItem,
        title: itemForm.title.trim(),
        score: scoreNum,
        maxScore: maxScoreNum,
        notes: itemForm.notes.trim() || undefined,
      });
    } else {
      addScoreItem(itemModal.subjectId, itemModal.periodKey, {
        title: itemForm.title.trim(),
        score: scoreNum,
        maxScore: maxScoreNum,
        notes: itemForm.notes.trim() || undefined,
      });
    }

    setItemModal({ isOpen: false, subjectId: '', periodKey: 'preMidterm' });
  };

  const isTerm1 = currentSemester === 'term1';

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              โครงสร้างคะแนนและรายวิชา
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {isTerm1 ? '📘 เทอม 1' : '📕 เทอม 2'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            แบ่ง 4 ส่วน: คะแนนเก็บก่อนกลางภาค • คะแนนสอบกลางภาค • คะแนนเก็บหลังกลางภาค • คะแนนสอบปลายภาค
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SemesterToggle size="md" />
          <button
            type="button"
            onClick={onOpenAddSubject}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มวิชาใหม่</span>
          </button>
        </div>
      </div>

      {/* Subject Cards List */}
      {activeSemesterSummary.subjectSummaries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
            📚
          </div>
          <h3 className="font-bold text-slate-800 text-lg">
            ยังไม่มีรายวิชาใน{activeSemesterSummary.semesterName}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            กดปุ่ม "เพิ่มวิชาใหม่" เพื่อเพิ่มรายวิชาและบันทึกคะแนนเก็บทั้ง 4 ช่วงในเทอมนี้
          </p>
          <button
            type="button"
            onClick={onOpenAddSubject}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
          >
            + เพิ่มวิชาแรก
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeSemesterSummary.subjectSummaries.map((summary) => {
            const { subject, periodBreakdowns, earnedScore, totalMaxScoreRecorded, currentPercentage, remainingPoints, maxPossibleTotal, estimatedGrade, estimatedGradeLetter, targetAchieved, canStillAchieveTarget, pointsNeededForTarget } = summary;

            const isExpanded = expandedSubjectIds[subject.id] !== false; // default true
            const periodKeys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];

            return (
              <div
                key={subject.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Subject Top Banner */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/20 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-700">
                          {subject.code}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700">
                          {subject.credits} หน่วยกิต
                        </span>
                        {subject.classroom && (
                          <span className="text-xs text-slate-500">📍 {subject.classroom}</span>
                        )}
                        {subject.teacherName && (
                          <span className="text-xs text-slate-500">👨‍🏫 {subject.teacherName}</span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {subject.name}
                      </h3>
                    </div>

                    {/* Right Summary Chips */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Current Score Badge */}
                      <div className="px-4 py-2 rounded-2xl bg-slate-100/90 border border-slate-200 text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          คะแนนรวมปัจจุบัน
                        </div>
                        <div className="text-base font-black text-slate-900">
                          {earnedScore} / {totalMaxScoreRecorded} <span className="text-xs font-semibold text-slate-600">({currentPercentage.toFixed(1)}%)</span>
                        </div>
                      </div>

                      {/* Estimated Grade Badge */}
                      <div className="px-4 py-2 rounded-2xl bg-indigo-600 text-white shadow-sm text-right">
                        <div className="text-[10px] font-semibold text-indigo-100 uppercase">
                          เกรดประมาณการ
                        </div>
                        <div className="text-base font-black">
                          {estimatedGradeLetter} ({estimatedGrade})
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditSubject(subject)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="แก้ไขวิชา"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${subject.name}"?`)) {
                              deleteSubject(subject.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบวิชา"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(subject.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advance Grade Calculation Box (As explicitly specified in the prompt) */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-sky-50/60 to-purple-50/50 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                          การคำนวณเกรดล่วงหน้า & เป้าหมาย (เกรด {subject.targetGrade >= 4 ? 'A / 4.0' : subject.targetGrade})
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {targetAchieved ? (
                          <span className="text-emerald-700 font-bold">
                            🎉 ยอดเยี่ยม! คะแนนปัจจุบัน ({earnedScore} คะแนน) ถึงเป้าหมายเกรด {subject.targetGrade >= 4 ? 'A' : 'ที่ตั้งไว้'} เรียบร้อยแล้ว
                          </span>
                        ) : canStillAchieveTarget ? (
                          <span>
                            👉 ต้องทำคะแนนเพิ่มอย่างน้อย{' '}
                            <span className="font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                              {pointsNeededForTarget} คะแนน
                            </span>{' '}
                            จาก {remainingPoints} คะแนนที่เหลือ เพื่อให้ถึงเกรด {subject.targetGrade >= 4 ? 'A' : 'เป้าหมาย'}
                          </span>
                        ) : (
                          <span className="text-rose-700">
                            ⚠️ คะแนนที่เหลือไม่เพียงพอสำหรับเกรด {subject.targetGrade} (ต้องการอีก {pointsNeededForTarget} คะแนน แต่เหลือเก็บได้ {remainingPoints} คะแนน)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 font-medium text-slate-700 shadow-2xs">
                        คะแนนปัจจุบัน: <span className="font-bold text-slate-900">{earnedScore}/{totalMaxScoreRecorded}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 font-medium text-slate-700 shadow-2xs">
                        คะแนนที่เหลือ: <span className="font-bold text-indigo-600">{remainingPoints} คะแนน</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 font-medium text-slate-700 shadow-2xs">
                        คะแนนสูงสุดที่เป็นไปได้ = <span className="font-bold text-emerald-600">{maxPossibleTotal}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Score Periods Container */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {periodKeys.map((key) => {
                        const period = subject.periods[key] || {
                          key,
                          label: PERIOD_CONFIG[key].label,
                          shortLabel: PERIOD_CONFIG[key].shortLabel,
                          weight: PERIOD_CONFIG[key].defaultWeight,
                          items: [],
                        };
                        const breakdown = periodBreakdowns.find((b) => b.key === key);
                        const hasItems = period.items && period.items.length > 0;
                        const pct = breakdown?.percentage;

                        return (
                          <div
                            key={key}
                            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between space-y-3"
                          >
                            {/* Period Header */}
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {period.label}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openAddItem(subject.id, key)}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>เพิ่มคะแนนย่อย</span>
                                </button>
                              </div>

                              {/* Progress bar and score status */}
                              <div className="mt-2.5 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">
                                    {period.shortLabel}: {hasItems ? `${breakdown?.earned}/${breakdown?.max}` : 'ยังไม่มีข้อมูล'}
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {pct !== null && pct !== undefined ? `${pct.toFixed(0)}%` : 'ยังไม่สอบ'}
                                  </span>
                                </div>

                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      !hasItems
                                        ? 'bg-slate-200'
                                        : (pct ?? 0) >= 80
                                        ? 'bg-emerald-500'
                                        : (pct ?? 0) >= 65
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{
                                      width: `${pct !== null && pct !== undefined ? Math.min(100, pct) : 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Sub-items List (e.g. การบ้าน 8/10, แบบฝึกหัด 9/10, สอบย่อย 15/20) */}
                            <div className="space-y-1.5 pt-1">
                              {!hasItems ? (
                                <div className="py-3 text-center text-xs text-slate-400 bg-white/60 rounded-xl border border-dashed border-slate-200">
                                  กด "เพิ่มคะแนนย่อย" เพื่อบันทึกคะแนนส่วนนี้
                                </div>
                              ) : (
                                period.items.map((item) => {
                                  const itemPct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
                                  return (
                                    <div
                                      key={item.id}
                                      className="p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-300 transition-all flex items-center justify-between gap-2 text-xs group"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-slate-400">•</span>
                                        <div className="min-w-0">
                                          <span className="font-semibold text-slate-800 truncate block">
                                            {item.title}
                                          </span>
                                          {item.notes && (
                                            <span className="text-[10px] text-slate-400 truncate block">
                                              {item.notes}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                          {item.score}/{item.maxScore}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                          <button
                                            type="button"
                                            onClick={() => openEditItem(subject.id, key, item)}
                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                            title="แก้ไข"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => deleteScoreItem(subject.id, key, item.id)}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                            title="ลบ"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Sub-Score Item Modal */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {itemModal.editingItem ? 'แก้ไขรายการคะแนนย่อย' : 'เพิ่มรายการคะแนนย่อย'}
                </h3>
                <p className="text-xs text-slate-500">
                  {PERIOD_CONFIG[itemModal.periodKey].label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItemModal({ isOpen: false, subjectId: '', periodKey: 'preMidterm' })}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อรายการคะแนน (เช่น การบ้าน, แบบฝึกหัด, สอบย่อย, โครงงาน) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การบ้านบทที่ 1, สอบย่อยตรีโกณมิติ"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนที่ได้ *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="เช่น 8"
                    value={itemForm.score}
                    onChange={(e) => setItemForm({ ...itemForm, score: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนเต็ม *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    placeholder="เช่น 10"
                    value={itemForm.maxScore}
                    onChange={(e) => setItemForm({ ...itemForm, maxScore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกเพิ่มเติม (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ข้อ 1-10 หน้า 45"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, subjectId: '', periodKey: 'preMidterm' })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {itemModal.editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มคะแนน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
