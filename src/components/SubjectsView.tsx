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
  BookOpen,
  ArrowLeft,
  Calendar,
  CheckSquare,
  Square,
  Clock,
  User,
  Sliders,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  Palette,
  Timer,
  Filter,
  LayoutGrid,
  FolderTree,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { ScorePeriodKey, Subject, ScoreItem, Task } from '../types';
import {
  calculateSubjectSummary,
  PERIOD_CONFIG,
  formatShortThaiDate,
  getDaysRemaining,
} from '../utils/gradeCalculations';
import { SemesterToggle } from './SemesterToggle';
import { EditSubjectScoresModal } from './EditSubjectScoresModal';
import { QuickColorModal } from './QuickColorModal';
import { getSubjectColor, getContrastTextColor } from '../utils/colorUtils';

interface SubjectsViewProps {
  onOpenAddSubject: () => void;
  onOpenEditSubject: (subject: Subject) => void;
  selectedSubjectId?: string | null;
  onSelectSubject?: (subject: Subject | null) => void;
  onNavigateToStudy?: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onOpenAddSubject,
  onOpenEditSubject,
  selectedSubjectId: propSelectedSubjectId,
  onSelectSubject: propOnSelectSubject,
  onNavigateToStudy,
}) => {
  const {
    currentSemester,
    activeSemesterSummary,
    tasks,
    exams,
    updateTask,
    addScoreItem,
    updateScoreItem,
    deleteScoreItem,
    deleteSubject,
    subjectCategories,
    startStudyForSubject,
    getCategoryForSubject,
  } = useGrade();

  // Internal state for selected subject if not controlled externally
  const [internalSelectedSubjectId, setInternalSelectedSubjectId] = useState<string | null>(null);
  const activeSubjectId = propSelectedSubjectId !== undefined ? propSelectedSubjectId : internalSelectedSubjectId;

  // Category filter and grouping
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewGrouping, setViewGrouping] = useState<'all' | 'grouped'>('all');

  const handleSelectSubject = (sub: Subject | null) => {
    if (propOnSelectSubject) {
      propOnSelectSubject(sub);
    } else {
      setInternalSelectedSubjectId(sub ? sub.id : null);
    }
  };

  // Quick score edit modal
  const [editingScoresSubject, setEditingScoresSubject] = useState<Subject | null>(null);

  // Quick subject color modal (pastel & wheel)
  const [colorModalSubject, setColorModalSubject] = useState<Subject | null>(null);

  // Active tab inside selected subject detail: 'overview' | 'scores' | 'tasks' | 'exams'
  const [detailTab, setDetailTab] = useState<'overview' | 'scores' | 'tasks' | 'exams'>('overview');

  // Accordion open/close state for Midterm (50) and Final (50) in scores tab
  const [openMidtermAccordion, setOpenMidtermAccordion] = useState(false);
  const [openFinalAccordion, setOpenFinalAccordion] = useState(false);

  // Sub-score item add modal
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
    maxScore: '10',
    notes: '',
  });

  // Find currently selected subject summary
  const currentSubjectSummary = activeSemesterSummary.subjectSummaries.find(
    (s) => s.subject.id === activeSubjectId
  );
  const currentSubject = currentSubjectSummary?.subject;

  // Filter tasks & exams for this subject
  const subjectTasks = tasks.filter(
    (t) => t.semesterId === currentSemester && t.subjectId === activeSubjectId
  );
  const subjectExams = exams.filter(
    (e) => e.semesterId === currentSemester && e.subjectId === activeSubjectId
  );

  const handleTaskToggle = (task: Task) => {
    const isDone = task.status === 'submitted' || task.status === 'graded';
    updateTask({
      ...task,
      status: isDone ? 'todo' : 'submitted',
    });
    if (!isDone) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  const handleSaveSubItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim()) return;

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

  const handleDeleteSubjectClick = (sub: Subject) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${sub.name}" และข้อมูลคะแนนทั้งหมด?`)) {
      deleteSubject(sub.id);
      if (activeSubjectId === sub.id) {
        handleSelectSubject(null);
      }
    }
  };

  // =========================================================================
  // VIEW 1: COMPACT GRID OF ALL SUBJECTS (PROGRESSIVE DISCLOSURE LEVEL 1 & 2)
  // =========================================================================
  if (!currentSubject || !currentSubjectSummary) {
    // Filter subject summaries based on category
    const filteredSubjectSummaries = activeSemesterSummary.subjectSummaries.filter((sSummary) => {
      if (selectedCategory === 'all') return true;
      const cat = getCategoryForSubject(sSummary.subject);
      return cat.name.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Group subjects by category if grouped mode
    const groupedByCategory = subjectCategories
      .map((cat) => {
        const subsInCat = activeSemesterSummary.subjectSummaries.filter(
          (sSummary) => getCategoryForSubject(sSummary.subject).name.toLowerCase() === cat.name.toLowerCase()
        );
        return {
          category: cat,
          summaries: subsInCat,
        };
      })
      .filter((g) => g.summaries.length > 0);

    // Also include any subjects that have other category
    const knownCatNames = new Set(subjectCategories.map((c) => c.name.toLowerCase()));
    const otherSummaries = activeSemesterSummary.subjectSummaries.filter(
      (sSummary) => !knownCatNames.has(getCategoryForSubject(sSummary.subject).name.toLowerCase())
    );
    if (otherSummaries.length > 0) {
      groupedByCategory.push({
        category: {
          id: 'other',
          name: 'อื่น ๆ',
          icon: '📦',
          color: 'slate',
        },
        summaries: otherSummaries,
      });
    }

    const renderCard = (subSummary: (typeof activeSemesterSummary.subjectSummaries)[0]) => {
      const sub = subSummary.subject;
      const progress = Math.min(100, subSummary.currentPercentage);
      const subCat = getCategoryForSubject(sub);

      return (
        <div
          key={sub.id}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3.5">
            {/* Top Bar: Icon + Code + Options */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {/* Clickable color circle avatar with palette hover badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setColorModalSubject(sub);
                  }}
                  className="w-11 h-11 rounded-full flex items-center justify-center shadow-2xs shrink-0 font-black text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer relative group/color"
                  style={{
                    backgroundColor: getSubjectColor(sub.color),
                    color: getContrastTextColor(getSubjectColor(sub.color)),
                  }}
                  title="คลิกเพื่อปรับเปลี่ยนสีวิชานี้ (สีพาสเทล / วงล้อสี)"
                >
                  {sub.name.charAt(0)}
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-2xs opacity-0 group-hover/color:opacity-100 transition-opacity border border-slate-200">
                    <Palette className="w-2.5 h-2.5 text-indigo-600" />
                  </span>
                </button>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-base leading-snug truncate group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 block truncate">
                      {sub.code} • {sub.credits} นก.
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {subCat.icon} {subCat.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Edit/Palette/Delete buttons */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setColorModalSubject(sub);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
                  title="ปรับสีวิชา (พาสเทล/วงล้อสี)"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditSubject(sub);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title="แก้ไขข้อมูลวิชา"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubjectClick(sub);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ลบวิชา"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Level 1 & Level 2 Information: Score + Grade + Target */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">คะแนน</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {subSummary.earnedScore}{' '}
                    <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                </div>
                <div className="text-right flex items-center gap-1.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 font-extrabold text-xs text-slate-800 shadow-2xs">
                    เกรด {subSummary.estimatedGrade}
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 font-bold text-xs">
                    🎯 เป้าหมาย {sub.targetGrade}
                  </span>
                </div>
              </div>

              {/* Rounded Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>ความคืบหน้า</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: getSubjectColor(sub.color),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: [ จับเวลาอ่าน ⏱️ ] and [ ดูคะแนน → ] */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startStudyForSubject(sub.id);
                if (onNavigateToStudy) onNavigateToStudy();
              }}
              className="w-full py-2.5 px-3 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              title="เริ่มจับเวลาอ่านหนังสือวิชานี้"
            >
              <Timer className="w-3.5 h-3.5 text-pink-600" />
              <span>จับเวลาอ่าน</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubject(sub)}
              className="w-full py-2.5 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span>ดูคะแนน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 pb-8">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                วิชาของฉัน
              </h2>
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {activeSemesterSummary.subjectSummaries.length} วิชา
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              คลิกที่การ์ดเพื่อดูรายละเอียดคะแนน งาน หรือกด "จับเวลาอ่าน" เพื่อเริ่มบันทึกเวลาเรียน
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <SemesterToggle size="sm" />
            <button
              type="button"
              onClick={onOpenAddSubject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มวิชาใหม่</span>
            </button>
          </div>
        </div>

        {/* Category Filters & View Toggle Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({activeSemesterSummary.subjectSummaries.length})
            </button>
            {subjectCategories.map((cat) => {
              const count = activeSemesterSummary.subjectSummaries.filter(
                (s) => getCategoryForSubject(s.subject).name.toLowerCase() === cat.name.toLowerCase()
              ).length;
              if (count === 0 && selectedCategory !== cat.name) return null;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Grouping View Switcher */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewGrouping('all')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewGrouping === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ดทั้งหมด</span>
            </button>
            <button
              type="button"
              onClick={() => setViewGrouping('grouped')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewGrouping === 'grouped'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>จัดตามหมวดหมู่</span>
            </button>
          </div>
        </div>

        {/* View Mode: Grouped by Category */}
        {viewGrouping === 'grouped' ? (
          <div className="space-y-6">
            {groupedByCategory.map((group) => (
              <div key={group.category.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{group.category.icon}</span>
                    <h3 className="font-black text-slate-900 text-base">
                      หมวด{group.category.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {group.summaries.length} วิชา
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {group.summaries.map((subSummary) => renderCard(subSummary))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode: Standard Flat Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSubjectSummaries.map((subSummary) => renderCard(subSummary))}
          </div>
        )}

        {filteredSubjectSummaries.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800">
                {selectedCategory === 'all'
                  ? 'ยังไม่มีรายวิชาในภาคเรียนนี้'
                  : `ไม่พบวิชาในหมวด "${selectedCategory}"`}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedCategory === 'all'
                  ? 'เริ่มต้นเพิ่มรายวิชาเพื่อบันทึกคะแนนเก็บ คำนวณเกรด และติดตามงานได้ทันที'
                  : 'ลองเปลี่ยนตัวกรองหมวดหมู่ หรือแก้ไขหมวดหมู่ของวิชาที่คุณต้องการ'}
              </p>
            </div>
            {selectedCategory === 'all' ? (
              <button
                type="button"
                onClick={onOpenAddSubject}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                + เพิ่มวิชาแรก
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                แสดงทุกวิชา
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SUBJECT DETAIL VIEW WITH 4 TABS (ภาพรวม, คะแนน, งาน, สอบ)
  // =========================================================================
  const sub = currentSubject;
  const subSummary = currentSubjectSummary;

  // Midterm 50 (PreMidterm 30 + Midterm 20)
  const preMidSummary = subSummary.periodBreakdowns.find((p) => p.key === 'preMidterm');
  const midSummary = subSummary.periodBreakdowns.find((p) => p.key === 'midterm');
  const midtermTotalEarned = (preMidSummary?.earned || 0) + (midSummary?.earned || 0);
  const midtermTotalMax = (preMidSummary?.max || 30) + (midSummary?.max || 20);
  const midtermPct = Math.min(100, Math.round((midtermTotalEarned / (midtermTotalMax || 50)) * 100));

  // Final 50 (PostMidterm 30 + Final 20)
  const postMidSummary = subSummary.periodBreakdowns.find((p) => p.key === 'postMidterm');
  const finalSummary = subSummary.periodBreakdowns.find((p) => p.key === 'final');
  const finalTotalEarned = (postMidSummary?.earned || 0) + (finalSummary?.earned || 0);
  const finalTotalMax = (postMidSummary?.max || 30) + (finalSummary?.max || 20);
  const finalPct = Math.min(100, Math.round((finalTotalEarned / (finalTotalMax || 50)) * 100));

  return (
    <div className="space-y-6 pb-8">
      {/* Back button & Subject Top Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSelectSubject(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้ารวมวิชา</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                startStudyForSubject(sub.id);
                if (onNavigateToStudy) onNavigateToStudy();
              }}
              className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-pink-200 shadow-2xs"
              title="เริ่มจับเวลาอ่านวิชานี้"
            >
              <Timer className="w-3.5 h-3.5 text-pink-600" />
              <span>จับเวลาอ่าน ⏱️</span>
            </button>
            <button
              type="button"
              onClick={() => setColorModalSubject(sub)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-pink-700 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-pink-200"
              title="ปรับสีวิชา (พาสเทล / วงล้อสี)"
            >
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">ปรับสีวิชา</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingScoresSubject(sub)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">แก้ไขคะแนนด่วน</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenEditSubject(sub)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="แก้ไขข้อมูลวิชา"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setColorModalSubject(sub)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 font-black text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer relative group/detailcolor"
              style={{
                backgroundColor: getSubjectColor(sub.color),
                color: getContrastTextColor(getSubjectColor(sub.color)),
              }}
              title="คลิกเพื่อเปลี่ยนสีวิชา (พาสเทล / วงล้อสี)"
            >
              {sub.name.charAt(0)}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-2xs opacity-0 group-hover/detailcolor:opacity-100 transition-opacity border border-slate-200">
                <Palette className="w-2.5 h-2.5 text-indigo-600" />
              </span>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {sub.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                  {getCategoryForSubject(sub).icon} {getCategoryForSubject(sub).name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                รหัสวิชา: {sub.code} • {sub.credits} หน่วยกิต {sub.teacher && `• ครูผู้สอน: ${sub.teacher}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">คะแนนสะสม</span>
              <span className="text-xl font-black text-slate-900">
                {subSummary.earnedScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </span>
            </div>
            <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] text-slate-300 font-bold uppercase block">เกรดคาดการณ์</span>
              <span className="text-xl font-black text-white">
                เกรด {subSummary.estimatedGrade}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Tabs: [ ภาพรวม ] [ คะแนน ] [ งาน ] [ สอบ ] */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview' as const, label: 'ภาพรวม' },
            { id: 'scores' as const, label: 'คะแนน (100 แต้ม)' },
            { id: 'tasks' as const, label: `งาน (${subjectTasks.length})` },
            { id: 'exams' as const, label: `สอบ (${subjectExams.length})` },
          ].map((tab) => {
            const isActive = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ภาพรวม (OVERVIEW) */}
      {detailTab === 'overview' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 4 Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">คะแนนปัจจุบัน</span>
              <span className="text-2xl font-black text-slate-900">{subSummary.earnedScore}</span>
              <span className="text-[11px] text-slate-400 block">จากทั้งหมด 100 คะแนน</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">เกรดคาดการณ์</span>
              <span className="text-2xl font-black text-indigo-600">เกรด {subSummary.estimatedGrade}</span>
              <span className="text-[11px] text-slate-400 block">เป้าหมายเกรด {sub.targetGrade}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">เป้าหมาย</span>
              <span className="text-2xl font-black text-amber-600">{sub.targetGrade}</span>
              <span className="text-[11px] text-slate-400 block">เกณฑ์ {sub.targetScore} คะแนนขึ้นไป</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">คะแนนที่ต้องทำเพิ่ม</span>
              <span className="text-2xl font-black text-slate-900">
                {subSummary.targetAchieved ? '✓ บรรลุแล้ว' : `+${subSummary.pointsNeededForTarget}`}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {subSummary.targetAchieved
                  ? 'คะแนนถึงเกณฑ์แล้ว รักษามาตรฐานไว้!'
                  : `เหลือให้เก็บอีก ${subSummary.remainingPoints} คะแนน`}
              </span>
            </div>
          </div>

          {/* Quick Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Midterm Half */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">สัดส่วนครึ่งแรก (กลางภาค)</span>
                <span className="text-xs font-black text-slate-900">{midtermTotalEarned} / 50 คะแนน</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${midtermPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                คะแนนเก็บก่อนกลางภาค ({preMidSummary?.earned || 0}/30) • สอบกลางภาค ({midSummary?.earned || 0}/20)
              </p>
            </div>

            {/* Final Half */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">สัดส่วนครึ่งหลัง (ปลายภาค)</span>
                <span className="text-xs font-black text-slate-900">{finalTotalEarned} / 50 คะแนน</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${finalPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                คะแนนเก็บหลังกลางภาค ({postMidSummary?.earned || 0}/30) • สอบปลายภาค ({finalSummary?.earned || 0}/20)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: คะแนน (SCORES ACCORDIONS) */}
      {detailTab === 'scores' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <span className="text-xs text-slate-600 font-medium">
              โครงสร้าง 100 คะแนน: กลางภาค 50 (เก็บ 30 + สอบ 20) และ ปลายภาค 50 (เก็บ 30 + สอบ 20)
            </span>
            <button
              type="button"
              onClick={() => setEditingScoresSubject(sub)}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              แก้ไขคะแนนรวม
            </button>
          </div>

          {/* ACCORDION 1: กลางภาค 50 คะแนน */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenMidtermAccordion((prev) => !prev)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    📚 กลางภาค (Midterm)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    50 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ได้ {midtermTotalEarned} / 50 คะแนน ({midtermPct}%)
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${midtermPct}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <span>{openMidtermAccordion ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}</span>
                  {openMidtermAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Expanded Midterm Contents */}
            {openMidtermAccordion && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50">
                {/* 1.1 คะแนนเก็บก่อนกลางภาค (น้ำหนัก 30) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        1. คะแนนเก็บก่อนกลางภาค (น้ำหนัก 30 คะแนน)
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        คะแนนที่ได้: {preMidSummary?.earned || 0} / 30 คะแนน
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({ title: '', score: '', maxScore: '10', notes: '' });
                        setItemModal({
                          isOpen: true,
                          subjectId: sub.id,
                          periodKey: 'preMidterm',
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + เพิ่มรายการย่อย
                    </button>
                  </div>

                  {/* Sub-items list */}
                  <div className="space-y-1.5">
                    {sub.periods.preMidterm.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">
                            {item.score} / {item.maxScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteScoreItem(sub.id, 'preMidterm', item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sub.periods.preMidterm.items.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        ไม่มีรายการย่อย (ใช้คะแนนรวม {preMidSummary?.earned || 0} / 30)
                      </p>
                    )}
                  </div>
                </div>

                {/* 1.2 สอบกลางภาค (น้ำหนัก 20) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        2. คะแนนสอบกลางภาค (น้ำหนัก 20 คะแนน)
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        คะแนนที่ได้: {midSummary?.earned || 0} / 20 คะแนน
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({ title: 'ข้อสอบกลางภาค', score: '', maxScore: '20', notes: '' });
                        setItemModal({
                          isOpen: true,
                          subjectId: sub.id,
                          periodKey: 'midterm',
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + เพิ่มรายการย่อย
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {sub.periods.midterm.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">
                            {item.score} / {item.maxScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteScoreItem(sub.id, 'midterm', item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sub.periods.midterm.items.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        ไม่มีรายการย่อย (ใช้คะแนนสอบรวม {midSummary?.earned || 0} / 20)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: ปลายภาค 50 คะแนน */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenFinalAccordion((prev) => !prev)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    📚 ปลายภาค (Final)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    50 คะแนน
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ได้ {finalTotalEarned} / 50 คะแนน ({finalPct}%)
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${finalPct}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <span>{openFinalAccordion ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}</span>
                  {openFinalAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Expanded Final Contents */}
            {openFinalAccordion && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50">
                {/* 2.1 คะแนนเก็บหลังกลางภาค (น้ำหนัก 30) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        3. คะแนนเก็บหลังกลางภาค (น้ำหนัก 30 คะแนน)
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        คะแนนที่ได้: {postMidSummary?.earned || 0} / 30 คะแนน
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({ title: '', score: '', maxScore: '10', notes: '' });
                        setItemModal({
                          isOpen: true,
                          subjectId: sub.id,
                          periodKey: 'postMidterm',
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + เพิ่มรายการย่อย
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {sub.periods.postMidterm.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">
                            {item.score} / {item.maxScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteScoreItem(sub.id, 'postMidterm', item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sub.periods.postMidterm.items.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        ไม่มีรายการย่อย (ใช้คะแนนรวม {postMidSummary?.earned || 0} / 30)
                      </p>
                    )}
                  </div>
                </div>

                {/* 2.2 สอบปลายภาค (น้ำหนัก 20) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        4. คะแนนสอบปลายภาค (น้ำหนัก 20 คะแนน)
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        คะแนนที่ได้: {finalSummary?.earned || 0} / 20 คะแนน
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({ title: 'ข้อสอบปลายภาค', score: '', maxScore: '20', notes: '' });
                        setItemModal({
                          isOpen: true,
                          subjectId: sub.id,
                          periodKey: 'final',
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + เพิ่มรายการย่อย
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {sub.periods.final.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">
                            {item.score} / {item.maxScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteScoreItem(sub.id, 'final', item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {sub.periods.final.items.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        ไม่มีรายการย่อย (ใช้คะแนนสอบรวม {finalSummary?.earned || 0} / 20)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: งาน (TASKS) */}
      {detailTab === 'tasks' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              งานและการบ้านประจำวิชา ({subjectTasks.length} รายการ)
            </span>
          </div>

          <div className="space-y-2">
            {subjectTasks.map((task) => {
              const isDone = task.status === 'submitted' || task.status === 'graded';
              const days = getDaysRemaining(task.dueDate);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleTaskToggle(task)}
                    className={`cursor-pointer ${isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                  >
                    {isDone ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      กำหนดส่ง {formatShortThaiDate(task.dueDate)} • น้ำหนัก {task.maxScore} คะแนน
                    </p>
                  </div>

                  {!isDone && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {days === 0 ? 'ส่งวันนี้' : `อีก ${days} วัน`}
                    </span>
                  )}
                </div>
              );
            })}

            {subjectTasks.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                ยังไม่มีงานหรือการบ้านในวิชานี้
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: สอบ (EXAMS & TOPICS) */}
      {detailTab === 'exams' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-3">
            {subjectExams.map((exam) => {
              const days = getDaysRemaining(exam.examDate);

              return (
                <div key={exam.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {exam.examType === 'midterm' ? '📅 การสอบกลางภาค' : '📅 การสอบปลายภาค'}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {days === 0 ? 'สอบวันนี้' : `อีก ${days} วัน`}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl">
                    <span>วันที่: {formatShortThaiDate(exam.examDate)}</span>
                    <span>เวลา: {exam.startTime} - {exam.endTime} น.</span>
                    <span>ห้องสอบ: {exam.room || 'ไม่ระบุ'}</span>
                    <span>คะแนนเต็ม: {exam.maxScore} คะแนน</span>
                  </div>

                  {/* Section 9: Collapsible topics checklist */}
                  {exam.topics && exam.topics.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700">หัวข้อที่ออกสอบ (Checklist):</span>
                      <div className="space-y-1">
                        {exam.topics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700 py-1">
                            <span className="text-indigo-500 font-bold">▸</span>
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exam.tips && (
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
                      <span className="font-bold">💡 แนวข้อสอบ / คำแนะนำ: </span>
                      {exam.tips}
                    </div>
                  )}
                </div>
              );
            })}

            {subjectExams.length === 0 && (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                ยังไม่มีการสอบสำหรับวิชานี้
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Sub-Score Item Modal */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">
              {itemModal.editingItem ? 'แก้ไขรายการคะแนนย่อย' : 'เพิ่มรายการคะแนนย่อย'}
            </h3>
            <form onSubmit={handleSaveSubItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อรายการคะแนน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ใบงานที่ 1, สอบเก็บคะแนนย่อย"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนที่ได้
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemForm.score}
                    onChange={(e) => setItemForm({ ...itemForm, score: e.target.value })}
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
                    value={itemForm.maxScore}
                    onChange={(e) => setItemForm({ ...itemForm, maxScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, subjectId: '', periodKey: 'preMidterm' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer"
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Score Modal */}
      <EditSubjectScoresModal
        isOpen={Boolean(editingScoresSubject)}
        onClose={() => setEditingScoresSubject(null)}
        subject={editingScoresSubject}
      />

      {/* Quick Color Modal (Pastel & Color Wheel) */}
      <QuickColorModal
        isOpen={Boolean(colorModalSubject)}
        onClose={() => setColorModalSubject(null)}
        subject={colorModalSubject}
      />
    </div>
  );
};
