import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Calculator,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Edit2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Subject, ScorePeriodKey, ScoreItem } from '../types';
import { useGrade } from '../context/GradeContext';
import { PERIOD_CONFIG, scoreToGrade } from '../utils/gradeCalculations';

interface EditSubjectScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const EditSubjectScoresModal: React.FC<EditSubjectScoresModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const { updateSubjectPeriodScores } = useGrade();

  // Mode: 'quick' (4 periods total) vs 'detailed' (sub-items breakdown)
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick');

  // Quick mode state: score and maxScore for each period
  const [periodScores, setPeriodScores] = useState<
    Record<ScorePeriodKey, { score: string; maxScore: string }>
  >({
    preMidterm: { score: '0', maxScore: '30' },
    midterm: { score: '0', maxScore: '20' },
    postMidterm: { score: '0', maxScore: '30' },
    final: { score: '0', maxScore: '20' },
  });

  // Detailed mode state: list of items per period
  const [detailedItems, setDetailedItems] = useState<Record<ScorePeriodKey, ScoreItem[]>>({
    preMidterm: [],
    midterm: [],
    postMidterm: [],
    final: [],
  });

  // State for adding a new sub-item in detailed mode
  const [newItemPeriod, setNewItemPeriod] = useState<ScorePeriodKey | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemScore, setNewItemScore] = useState('');
  const [newItemMaxScore, setNewItemMaxScore] = useState('10');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && subject) {
      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      const newQuick: Record<ScorePeriodKey, { score: string; maxScore: string }> = {
        preMidterm: { score: '0', maxScore: '30' },
        midterm: { score: '0', maxScore: '20' },
        postMidterm: { score: '0', maxScore: '30' },
        final: { score: '0', maxScore: '20' },
      };

      const newDetailed: Record<ScorePeriodKey, ScoreItem[]> = {
        preMidterm: [],
        midterm: [],
        postMidterm: [],
        final: [],
      };

      keys.forEach((key) => {
        const period = subject.periods[key];
        const items = period?.items || [];
        newDetailed[key] = [...items];

        if (items.length > 0) {
          const totalEarned = items.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
          const totalMax = items.reduce((sum, item) => sum + (Number(item.maxScore) || 0), 0);
          newQuick[key] = {
            score: totalEarned.toString(),
            maxScore: (totalMax > 0 ? totalMax : period?.weight || PERIOD_CONFIG[key].defaultWeight).toString(),
          };
        } else {
          newQuick[key] = {
            score: '0',
            maxScore: (period?.weight || PERIOD_CONFIG[key].defaultWeight).toString(),
          };
        }
      });

      setPeriodScores(newQuick);
      setDetailedItems(newDetailed);
      setSavedSuccess(false);
      setNewItemPeriod(null);
    }
  }, [isOpen, subject]);

  if (!isOpen || !subject) return null;

  // Real-time calculations
  const calculateTotals = () => {
    if (activeTab === 'quick') {
      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      let earned = 0;
      let maxTotal = 0;
      keys.forEach((k) => {
        earned += parseFloat(periodScores[k].score) || 0;
        maxTotal += parseFloat(periodScores[k].maxScore) || 0;
      });
      return { earned, maxTotal };
    } else {
      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      let earned = 0;
      let maxTotal = 0;
      keys.forEach((k) => {
        detailedItems[k].forEach((item) => {
          earned += Number(item.score) || 0;
          maxTotal += Number(item.maxScore) || 0;
        });
      });
      return { earned, maxTotal };
    }
  };

  const { earned, maxTotal } = calculateTotals();
  const percentage = maxTotal > 0 ? (earned / maxTotal) * 100 : 0;
  const { grade: previewGrade, letter: previewLetter } = scoreToGrade(earned);

  const targetScore = subject.targetScore || 80;
  const pointsNeeded = Math.max(0, targetScore - earned);
  const isTargetAchieved = earned >= targetScore;

  const handleQuickChange = (
    key: ScorePeriodKey,
    field: 'score' | 'maxScore',
    value: string
  ) => {
    setPeriodScores((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleDetailedItemChange = (
    periodKey: ScorePeriodKey,
    itemId: string,
    field: 'title' | 'score' | 'maxScore',
    val: string
  ) => {
    setDetailedItems((prev) => ({
      ...prev,
      [periodKey]: prev[periodKey].map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          [field]: field === 'title' ? val : parseFloat(val) || 0,
        };
      }),
    }));
  };

  const handleDeleteDetailedItem = (periodKey: ScorePeriodKey, itemId: string) => {
    setDetailedItems((prev) => ({
      ...prev,
      [periodKey]: prev[periodKey].filter((i) => i.id !== itemId),
    }));
  };

  const handleAddSubItem = (periodKey: ScorePeriodKey) => {
    if (!newItemTitle.trim()) return;
    const scoreVal = parseFloat(newItemScore) || 0;
    const maxVal = parseFloat(newItemMaxScore) || 10;

    const newItem: ScoreItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: newItemTitle.trim(),
      score: scoreVal,
      maxScore: maxVal,
    };

    setDetailedItems((prev) => ({
      ...prev,
      [periodKey]: [...prev[periodKey], newItem],
    }));

    setNewItemTitle('');
    setNewItemScore('');
    setNewItemMaxScore('10');
    setNewItemPeriod(null);
  };

  const handleSave = () => {
    if (activeTab === 'quick') {
      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      const updates: Partial<
        Record<ScorePeriodKey, { score: number; maxScore: number }>
      > = {};

      keys.forEach((k) => {
        updates[k] = {
          score: Math.max(0, parseFloat(periodScores[k].score) || 0),
          maxScore: Math.max(0, parseFloat(periodScores[k].maxScore) || PERIOD_CONFIG[k].defaultWeight),
        };
      });

      updateSubjectPeriodScores(subject.id, updates);
    } else {
      const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
      const updates: Partial<
        Record<ScorePeriodKey, { score: number; maxScore: number; items: ScoreItem[] }>
      > = {};

      keys.forEach((k) => {
        const items = detailedItems[k];
        const totalEarned = items.reduce((s, i) => s + (Number(i.score) || 0), 0);
        const totalMax = items.reduce((s, i) => s + (Number(i.maxScore) || 0), 0);
        updates[k] = {
          score: totalEarned,
          maxScore: totalMax > 0 ? totalMax : PERIOD_CONFIG[k].defaultWeight,
          items,
        };
      });

      updateSubjectPeriodScores(subject.id, updates);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const periodList: {
    key: ScorePeriodKey;
    label: string;
    badge: string;
    defaultWeight: number;
    color: string;
  }[] = [
    {
      key: 'preMidterm',
      label: 'คะแนนเก็บก่อนกลางภาค',
      badge: 'ก่อนกลางภาค (30)',
      defaultWeight: 30,
      color: 'border-blue-200 bg-blue-50/40 text-blue-800',
    },
    {
      key: 'midterm',
      label: 'คะแนนสอบกลางภาค',
      badge: 'กลางภาค (20)',
      defaultWeight: 20,
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-800',
    },
    {
      key: 'postMidterm',
      label: 'คะแนนเก็บหลังกลางภาค',
      badge: 'หลังกลางภาค (30)',
      defaultWeight: 30,
      color: 'border-purple-200 bg-purple-50/40 text-purple-800',
    },
    {
      key: 'final',
      label: 'คะแนนสอบปลายภาค',
      badge: 'ปลายภาค (20)',
      defaultWeight: 20,
      color: 'border-rose-200 bg-rose-50/40 text-rose-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl border border-slate-100 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {subject.credits} หน่วยกิต • {subject.semesterId === 'term1' ? '📘 เทอม 1' : '📕 เทอม 2'}
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">
              แก้ไขคะแนน: {subject.name}
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดคะแนนที่ได้และคะแนนเต็มทั้ง 4 ช่วง (รวม 100 คะแนน)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                คะแนนรวมสะสม (คำนวณสด)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black tracking-tight text-white">
                  {earned}
                </span>
                <span className="text-sm font-semibold text-indigo-200">
                  / {maxTotal} คะแนน ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Estimated Grade Chip */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <div className="text-[10px] uppercase font-bold text-indigo-200">
                  เกรดประมาณการ
                </div>
                <div className="text-lg font-black text-white">
                  {previewLetter} ({previewGrade})
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <div className="text-[10px] uppercase font-bold text-indigo-200">
                  เป้าหมายเกรด {subject.targetGrade}
                </div>
                <div className="text-xs font-bold text-emerald-300">
                  {isTargetAchieved ? '✓ ถึงเป้าหมายแล้ว' : `ขาดอีก ${pointsNeeded} คะแนน`}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 80 ? 'bg-emerald-400' : percentage >= 65 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Tab Switcher: Quick 4-period vs Detailed sub-items */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'quick'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ แก้ 4 ช่วงหลัก (ด่วน)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detailed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'detailed'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 คะแนนย่อย (Sub-items)
            </button>
          </div>

          {/* Preset Button */}
          {activeTab === 'quick' && (
            <button
              type="button"
              onClick={() => {
                setPeriodScores({
                  preMidterm: { score: '25', maxScore: '30' },
                  midterm: { score: '17', maxScore: '20' },
                  postMidterm: { score: '26', maxScore: '30' },
                  final: { score: '18', maxScore: '20' },
                });
              }}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              เติมตัวอย่างเกรด 4 (86/100)
            </button>
          )}
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200 animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>บันทึกคะแนนวิชา {subject.name} เรียบร้อยแล้ว!</span>
          </div>
        )}

        {/* TAB 1: QUICK 4 PERIODS EDIT */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              กรอก <strong>"คะแนนที่ได้"</strong> และ <strong>"คะแนนเต็ม"</strong> ของแต่ละช่วง ระบบจะคำนวณเกรดและคะแนนสะสมให้อัตโนมัติ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {periodList.map((period) => {
                const currentScore = parseFloat(periodScores[period.key].score) || 0;
                const currentMax = parseFloat(periodScores[period.key].maxScore) || period.defaultWeight;
                const periodPct = currentMax > 0 ? (currentScore / currentMax) * 100 : 0;

                return (
                  <div
                    key={period.key}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/40 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {period.label}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {period.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          คะแนนที่ได้
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={currentMax || 100}
                          value={periodScores[period.key].score}
                          onChange={(e) =>
                            handleQuickChange(period.key, 'score', e.target.value)
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base font-black text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          คะแนนเต็ม
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="100"
                          value={periodScores[period.key].maxScore}
                          onChange={(e) =>
                            handleQuickChange(period.key, 'maxScore', e.target.value)
                          }
                          placeholder={period.defaultWeight.toString()}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base font-semibold text-slate-700 bg-white"
                        />
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>คิดเป็น {periodPct.toFixed(0)}%</span>
                        <span>{currentScore} / {currentMax}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, periodPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED SUB-ITEMS EDIT */}
        {activeTab === 'detailed' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-500">
              จัดการรายการย่อย (เช่น ใบงาน, การบ้าน, สอบย่อย) สามารถเพิ่มคะแนน แก้ไข หรือลบรายการได้ตามต้องการ:
            </p>

            <div className="space-y-4">
              {periodList.map((period) => {
                const items = detailedItems[period.key];
                const periodEarned = items.reduce((s, i) => s + (Number(i.score) || 0), 0);
                const periodMax = items.reduce((s, i) => s + (Number(i.maxScore) || 0), 0);
                const isAddingHere = newItemPeriod === period.key;

                return (
                  <div
                    key={period.key}
                    className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          {period.label}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500">
                          (รวม {periodEarned}/{periodMax} คะแนน)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setNewItemPeriod(isAddingHere ? null : period.key);
                          setNewItemTitle('');
                          setNewItemScore('');
                          setNewItemMaxScore(period.key === 'midterm' || period.key === 'final' ? '20' : '10');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAddingHere ? 'ปิด' : 'เพิ่มรายการย่อย'}</span>
                      </button>
                    </div>

                    {/* New Item Form Inline */}
                    {isAddingHere && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2.5 animate-fade-in">
                        <div className="text-xs font-bold text-indigo-900">
                          เพิ่มคะแนนย่อยใน {period.label}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1">
                            <input
                              type="text"
                              placeholder="ชื่อรายการ เช่น การบ้าน 1"
                              value={newItemTitle}
                              onChange={(e) => setNewItemTitle(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="0.5"
                              placeholder="คะแนนที่ได้"
                              value={newItemScore}
                              onChange={(e) => setNewItemScore(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="1"
                              placeholder="คะแนนเต็ม"
                              value={newItemMaxScore}
                              onChange={(e) => setNewItemMaxScore(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setNewItemPeriod(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSubItem(period.key)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            + เพิ่มรายการ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    {items.length === 0 ? (
                      <div className="py-2.5 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีรายการย่อย (กดปุ่ม "เพิ่มรายการย่อย" เพื่อกรอกคะแนน)
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleDetailedItemChange(
                                    period.key,
                                    item.id,
                                    'title',
                                    e.target.value
                                  )
                                }
                                className="font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-1 py-0.5 rounded outline-none flex-1 truncate"
                              />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-400 font-semibold">ได้</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={item.score}
                                  onChange={(e) =>
                                    handleDetailedItemChange(
                                      period.key,
                                      item.id,
                                      'score',
                                      e.target.value
                                    )
                                  }
                                  className="w-12 text-center font-bold text-slate-900 border-none outline-none"
                                />
                                <span className="text-slate-300">/</span>
                                <span className="text-[10px] text-slate-400 font-semibold">เต็ม</span>
                                <input
                                  type="number"
                                  step="1"
                                  value={item.maxScore}
                                  onChange={(e) =>
                                    handleDetailedItemChange(
                                      period.key,
                                      item.id,
                                      'maxScore',
                                      e.target.value
                                    )
                                  }
                                  className="w-12 text-center font-semibold text-slate-700 border-none outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteDetailedItem(period.key, item.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            คะแนนจะถูกนำไปอัปเดตเกรดรวมและสถิติทันที
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกคะแนน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
