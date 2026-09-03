import React, { useState, useEffect } from 'react';
import { Subject, SemesterId, ScorePeriodKey, ScoreItem } from '../types';
import { useGrade } from '../context/GradeContext';
import { PERIOD_CONFIG, scoreToGrade } from '../utils/gradeCalculations';
import { Calculator, Award } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
}) => {
  const { currentSemester, addSubject, updateSubject } = useGrade();

  const [form, setForm] = useState({
    semesterId: currentSemester,
    name: '',
    code: '',
    credits: '1.5',
    targetGrade: '4.0',
    targetScore: '80',
    teacherName: '',
    classroom: '',
  });

  const [periodScores, setPeriodScores] = useState<
    Record<ScorePeriodKey, { score: string; maxScore: string }>
  >({
    preMidterm: { score: '0', maxScore: '30' },
    midterm: { score: '0', maxScore: '20' },
    postMidterm: { score: '0', maxScore: '30' },
    final: { score: '0', maxScore: '20' },
  });

  useEffect(() => {
    if (editingSubject) {
      setForm({
        semesterId: editingSubject.semesterId,
        name: editingSubject.name,
        code: editingSubject.code,
        credits: editingSubject.credits.toString(),
        targetGrade: editingSubject.targetGrade.toString(),
        targetScore: (editingSubject.targetScore || 80).toString(),
        teacherName: editingSubject.teacherName || '',
        classroom: editingSubject.classroom || '',
      });

      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      const newScores: Record<ScorePeriodKey, { score: string; maxScore: string }> = {
        preMidterm: { score: '0', maxScore: '30' },
        midterm: { score: '0', maxScore: '20' },
        postMidterm: { score: '0', maxScore: '30' },
        final: { score: '0', maxScore: '20' },
      };

      keys.forEach((key) => {
        const period = editingSubject.periods[key];
        const items = period?.items || [];
        if (items.length > 0) {
          const totalEarned = items.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
          const totalMax = items.reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
          newScores[key] = {
            score: totalEarned.toString(),
            maxScore: (totalMax > 0 ? totalMax : period?.weight || PERIOD_CONFIG[key].defaultWeight).toString(),
          };
        } else {
          newScores[key] = {
            score: '0',
            maxScore: (period?.weight || PERIOD_CONFIG[key].defaultWeight).toString(),
          };
        }
      });
      setPeriodScores(newScores);
    } else {
      setForm({
        semesterId: currentSemester,
        name: '',
        code: '',
        credits: '1.5',
        targetGrade: '4.0',
        targetScore: '80',
        teacherName: '',
        classroom: '',
      });
      setPeriodScores({
        preMidterm: { score: '0', maxScore: '30' },
        midterm: { score: '0', maxScore: '20' },
        postMidterm: { score: '0', maxScore: '30' },
        final: { score: '0', maxScore: '20' },
      });
    }
  }, [editingSubject, currentSemester, isOpen]);

  if (!isOpen) return null;

  // Calculate live score and grade
  const totalEarned =
    (parseFloat(periodScores.preMidterm.score) || 0) +
    (parseFloat(periodScores.midterm.score) || 0) +
    (parseFloat(periodScores.postMidterm.score) || 0) +
    (parseFloat(periodScores.final.score) || 0);

  const totalMax =
    (parseFloat(periodScores.preMidterm.maxScore) || 30) +
    (parseFloat(periodScores.midterm.maxScore) || 20) +
    (parseFloat(periodScores.postMidterm.maxScore) || 30) +
    (parseFloat(periodScores.final.maxScore) || 20);

  const { grade: liveGrade, letter: liveLetter } = scoreToGrade(totalEarned);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    const creditsNum = parseFloat(form.credits) || 1.0;
    const targetGradeNum = parseFloat(form.targetGrade) || 4.0;
    const targetScoreNum = parseFloat(form.targetScore) || 80;

    const buildPeriod = (
      key: ScorePeriodKey,
      existingPeriod?: any
    ) => {
      const earned = Math.max(0, parseFloat(periodScores[key].score) || 0);
      const max = Math.max(1, parseFloat(periodScores[key].maxScore) || PERIOD_CONFIG[key].defaultWeight);

      const existingItems: ScoreItem[] = existingPeriod?.items || [];
      let updatedItems: ScoreItem[] = [];

      if (existingItems.length <= 1) {
        const itemId = existingItems[0]?.id || `item_${Date.now()}_${key}`;
        const itemTitle = existingItems[0]?.title || PERIOD_CONFIG[key].label;
        updatedItems = [
          {
            id: itemId,
            title: itemTitle,
            score: earned,
            maxScore: max,
          },
        ];
      } else {
        // Replace consolidated
        const itemId = existingItems[0]?.id || `item_${Date.now()}_${key}`;
        updatedItems = [
          {
            id: itemId,
            title: PERIOD_CONFIG[key].label,
            score: earned,
            maxScore: max,
          },
        ];
      }

      return {
        key,
        label: existingPeriod?.label || PERIOD_CONFIG[key].label,
        shortLabel: existingPeriod?.shortLabel || PERIOD_CONFIG[key].shortLabel,
        weight: max,
        items: updatedItems,
      };
    };

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        semesterId: form.semesterId,
        name: form.name.trim(),
        code: form.code.trim(),
        credits: creditsNum,
        targetGrade: targetGradeNum,
        targetScore: targetScoreNum,
        teacherName: form.teacherName.trim() || undefined,
        classroom: form.classroom.trim() || undefined,
        periods: {
          preMidterm: buildPeriod('preMidterm', editingSubject.periods.preMidterm),
          midterm: buildPeriod('midterm', editingSubject.periods.midterm),
          postMidterm: buildPeriod('postMidterm', editingSubject.periods.postMidterm),
          final: buildPeriod('final', editingSubject.periods.final),
        },
      });
    } else {
      addSubject({
        semesterId: form.semesterId,
        name: form.name.trim(),
        code: form.code.trim(),
        credits: creditsNum,
        color: 'indigo',
        icon: 'BookOpen',
        targetGrade: targetGradeNum,
        targetScore: targetScoreNum,
        teacherName: form.teacherName.trim() || undefined,
        classroom: form.classroom.trim() || undefined,
        periods: {
          preMidterm: buildPeriod('preMidterm'),
          midterm: buildPeriod('midterm'),
          postMidterm: buildPeriod('postMidterm'),
          final: buildPeriod('final'),
        },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingSubject ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดหน่วยกิตและเป้าหมายเกรด
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ภาคเรียน *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, semesterId: 'term1' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.semesterId === 'term1'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                📘 เทอม 1
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, semesterId: 'term2' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.semesterId === 'term2'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                📕 เทอม 2
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อวิชา *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น คณิตศาสตร์เพิ่มเติม 3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสวิชา *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ค32201"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-medium uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หน่วยกิต *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="5"
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เป้าหมายเกรด
              </label>
              <select
                value={form.targetGrade}
                onChange={(e) => {
                  const val = e.target.value;
                  const scoreMap: Record<string, string> = {
                    '4.0': '80',
                    '3.5': '75',
                    '3.0': '70',
                    '2.5': '65',
                    '2.0': '60',
                  };
                  setForm({
                    ...form,
                    targetGrade: val,
                    targetScore: scoreMap[val] || '80',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
              >
                <option value="4.0">เกรด 4 (A)</option>
                <option value="3.5">เกรด 3.5 (B+)</option>
                <option value="3.0">เกรด 3 (B)</option>
                <option value="2.5">เกรด 2.5 (C+)</option>
                <option value="2.0">เกรด 2 (C)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                คะแนนเป้าหมาย
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="100"
                value={form.targetScore}
                onChange={(e) => setForm({ ...form, targetScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ครูผู้สอน
              </label>
              <input
                type="text"
                placeholder="เช่น อ.สมเกียรติ ยอดเลข"
                value={form.teacherName}
                onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ห้องเรียน
              </label>
              <input
                type="text"
                placeholder="เช่น ห้อง 324"
                value={form.classroom}
                onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* 4-Period Score Inputs Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">
                  คะแนน 4 ช่วงรายวิชา (รวม 100 คะแนน)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  รวม: {totalEarned} / {totalMax} คะแนน
                </span>
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">
                  เกรด {liveLetter} ({liveGrade})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Pre-midterm */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-700">
                  1. คะแนนเก็บก่อนกลางภาค
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400">ได้</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={periodScores.preMidterm.score}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          preMidterm: { ...periodScores.preMidterm, score: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <span className="text-slate-300 mt-3">/</span>
                  <div className="w-16">
                    <span className="text-[10px] text-slate-400">เต็ม</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={periodScores.preMidterm.maxScore}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          preMidterm: { ...periodScores.preMidterm, maxScore: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs text-slate-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Midterm */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-700">
                  2. คะแนนสอบกลางภาค
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400">ได้</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={periodScores.midterm.score}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          midterm: { ...periodScores.midterm, score: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <span className="text-slate-300 mt-3">/</span>
                  <div className="w-16">
                    <span className="text-[10px] text-slate-400">เต็ม</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={periodScores.midterm.maxScore}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          midterm: { ...periodScores.midterm, maxScore: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs text-slate-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Post-midterm */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-700">
                  3. คะแนนเก็บหลังกลางภาค
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400">ได้</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={periodScores.postMidterm.score}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          postMidterm: { ...periodScores.postMidterm, score: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <span className="text-slate-300 mt-3">/</span>
                  <div className="w-16">
                    <span className="text-[10px] text-slate-400">เต็ม</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={periodScores.postMidterm.maxScore}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          postMidterm: { ...periodScores.postMidterm, maxScore: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs text-slate-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Final */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-700">
                  4. คะแนนสอบปลายภาค
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400">ได้</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={periodScores.final.score}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          final: { ...periodScores.final, score: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <span className="text-slate-300 mt-3">/</span>
                  <div className="w-16">
                    <span className="text-[10px] text-slate-400">เต็ม</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={periodScores.final.maxScore}
                      onChange={(e) =>
                        setPeriodScores({
                          ...periodScores,
                          final: { ...periodScores.final, maxScore: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs text-slate-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {editingSubject ? 'บันทึกการแก้ไข' : 'สร้างวิชาใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
