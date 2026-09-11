import React, { useState } from 'react';
import {
  Target,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  FolderHeart,
  Award,
  BookOpen,
  Briefcase,
  Flame,
  CheckSquare,
  Square,
  Star,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Heart,
  FileText,
  Upload,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import {
  CAREER_PRESETS,
  UNIVERSITY_PRESETS,
  FACULTY_PRESETS,
  CUTE_AVATARS,
} from '../data/defaultData';
import {
  NumericGrade,
  FutureChecklistItem,
  PortfolioItem,
  PortfolioCategory,
  FutureTodoItem,
  DreamUniversity,
} from '../types';

type FutureSubTab = 'overview' | 'checklist' | 'portfolio' | 'todos' | 'alignment';

export const FuturePlannerView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    updateTargetGpa,
    targetGpaAnalysis,
    activeSemesterSummary,
    subjects,
    currentSemester,
    futureChecklist,
    toggleFutureChecklistItem,
    addFutureChecklistItem,
    deleteFutureChecklistItem,
    portfolioItems,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    toggleInPortfolio,
    futureTodos,
    addFutureTodo,
    updateFutureTodo,
    deleteFutureTodo,
    toggleFutureTodo,
  } = useGrade();

  const [activeSubTab, setActiveSubTab] = useState<FutureSubTab>('overview');

  // Modals state
  const [isAddUniModalOpen, setIsAddUniModalOpen] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newMajor, setNewMajor] = useState('');

  // Add Portfolio Item Modal
  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portCategory, setPortCategory] = useState<PortfolioCategory>('certificate');
  const [portDate, setPortDate] = useState(new Date().toISOString().split('T')[0]);
  const [portInPortfolio, setPortInPortfolio] = useState(true);
  const [editingPortItem, setEditingPortItem] = useState<PortfolioItem | null>(null);

  // Add Future Checklist Item
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<FutureChecklistItem['category']>('academic');

  // Add Future Todo
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoNotes, setNewTodoNotes] = useState('');

  // Filters
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>('all');
  const [portfolioOnlySelected, setPortfolioOnlySelected] = useState<boolean>(false);
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Checklist statistics
  const totalChecklist = futureChecklist.length;
  const completedChecklist = futureChecklist.filter((i) => i.isCompleted).length;
  const readinessPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Portfolio statistics
  const totalPortfolio = portfolioItems.length;
  const inPortfolioCount = portfolioItems.filter((i) => i.inPortfolio).length;
  const certificateCount = portfolioItems.filter((i) => i.category === 'certificate').length;
  const activityCount = portfolioItems.filter((i) => i.category === 'activity' || i.category === 'volunteer').length;
  const projectCount = portfolioItems.filter((i) => i.category === 'project' || i.category === 'academic').length;

  // Handle toggle checklist with confetti
  const handleToggleChecklist = (id: string) => {
    const target = futureChecklist.find((i) => i.id === id);
    if (target && !target.isCompleted) {
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
    toggleFutureChecklistItem(id);
  };

  // Add Dream University
  const handleAddUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim() || !newFaculty.trim()) {
      alert('กรุณากรอกมหาวิทยาลัยและคณะ');
      return;
    }
    const newUni: DreamUniversity = {
      id: `uni_${Date.now()}`,
      universityName: newUniName.trim(),
      faculty: newFaculty.trim(),
      major: newMajor.trim() || newFaculty.trim().replace('คณะ', 'สาขา'),
      priority: (userProfile.dreamUniversities?.length || 0) + 1,
    };
    updateUserProfile({
      dreamUniversities: [...(userProfile.dreamUniversities || []), newUni],
    });
    setNewUniName('');
    setNewFaculty('');
    setNewMajor('');
    setIsAddUniModalOpen(false);
  };

  const handleDeleteUniversity = (id: string) => {
    updateUserProfile({
      dreamUniversities: (userProfile.dreamUniversities || []).filter((u) => u.id !== id),
    });
  };

  // Save Portfolio Item
  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim()) {
      alert('กรุณากรอกชื่อผลงาน');
      return;
    }
    if (editingPortItem) {
      updatePortfolioItem({
        ...editingPortItem,
        title: portTitle.trim(),
        description: portDesc.trim(),
        category: portCategory,
        date: portDate,
        inPortfolio: portInPortfolio,
      });
    } else {
      addPortfolioItem({
        title: portTitle.trim(),
        description: portDesc.trim(),
        category: portCategory,
        date: portDate,
        inPortfolio: portInPortfolio,
      });
    }
    setEditingPortItem(null);
    setPortTitle('');
    setPortDesc('');
    setIsAddPortModalOpen(false);
  };

  // Filtered lists
  const filteredPortfolio = portfolioItems.filter((item) => {
    if (portfolioOnlySelected && !item.inPortfolio) return false;
    if (portfolioCategoryFilter !== 'all' && item.category !== portfolioCategoryFilter) return false;
    return true;
  });

  const filteredChecklist = futureChecklist.filter((item) => {
    if (checklistFilter === 'completed') return item.isCompleted;
    if (checklistFilter === 'pending') return !item.isCompleted;
    return true;
  });

  // Alignment analysis
  const currentSemesterSubs = subjects.filter((s) => s.semesterId === currentSemester);
  const selectedCareerInfo = CAREER_PRESETS.find(
    (c) => c.name.toLowerCase() === userProfile.dreamCareer.toLowerCase()
  ) || {
    id: 'custom',
    name: userProfile.dreamCareer || 'เป้าหมายในฝัน',
    icon: '🎯',
    group: 'ทั่วไป',
    prioritySubjects: ['คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาอังกฤษ'],
  };

  const categoryLabels: Record<PortfolioCategory, string> = {
    certificate: '📜 เกียรติบัตร',
    award: '🏆 รางวัล',
    project: '🔬 โครงงาน',
    activity: '🤝 กิจกรรม',
    volunteer: '❤️ จิตอาสา',
    academic: '📚 วิชาการ',
    other: '🎨 อื่น ๆ',
  };

  return (
    <div className="space-y-6 pb-8 text-left">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl p-5 sm:p-6 border border-pink-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌷</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              อนาคต & เป้าหมายของฉัน
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
              Future Planner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            วางแผนเกรด มหาวิทยาลัยในฝัน แฟ้มสะสมผลงาน และเช็กลิสต์เตรียมความพร้อมสู่ TCAS
          </p>
        </div>

        {/* Readiness Pill */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-pink-200 shadow-2xs">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400">ความพร้อมสู่เป้าหมาย</div>
            <div className="text-base font-black text-pink-600">
              {readinessPercent}% ({completedChecklist}/{totalChecklist})
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-black text-sm border-2 border-pink-500">
            {readinessPercent}%
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
        {[
          { id: 'overview', label: 'ภาพรวม & เป้าหมาย', icon: Target },
          { id: 'checklist', label: 'เส้นทางความพร้อม', icon: CheckCircle2, badge: `${completedChecklist}/${totalChecklist}` },
          { id: 'portfolio', label: 'Portfolio Planner', icon: FolderHeart, badge: `${inPortfolioCount}` },
          { id: 'todos', label: 'งานเพื่ออนาคต', icon: CheckSquare, badge: `${futureTodos.filter(t => !t.isCompleted).length}` },
          { id: 'alignment', label: 'วิเคราะห์การเรียนกับเป้าหมาย', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as FutureSubTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-pink-600 text-white shadow-xs scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW & GOALS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Target Grade Selector Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-500" />
                  <span>เป้าหมายเกรดเฉลี่ย (Target GPA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกเป้าหมายเกรดที่ต้องการ ระบบจะคำนวณคะแนนที่ต้องทำเพิ่มและสถานะของแต่ละวิชาให้อัตโนมัติ
                </p>
              </div>
              <div className="flex items-center gap-2 bg-pink-50 px-3.5 py-1.5 rounded-2xl border border-pink-200">
                <span className="text-xs font-bold text-pink-700">เป้าหมายปัจจุบัน:</span>
                <span className="text-lg font-black text-pink-600">
                  {userProfile.targetGpa.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Target Grade Selector Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {([4, 3.5, 3, 2.5, 2, 1.5, 1, 0] as NumericGrade[]).map((grade) => {
                const isSelected = userProfile.targetGpa === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => updateTargetGpa(grade)}
                    className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-600 text-white shadow-xs scale-105 ring-2 ring-pink-300'
                        : 'bg-slate-50 text-slate-700 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/80'
                    }`}
                  >
                    เกรด {grade}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Encouragement / Analysis Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/70 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  คำแนะนำสู่เป้าหมายเกรด {userProfile.targetGpa.toFixed(2)}:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {targetGpaAnalysis.pointsNeededMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Dream Career & Dream Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dream Career Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                  <span>อาชีพในฝัน (Dream Career)</span>
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {selectedCareerInfo.icon} {userProfile.dreamCareer || 'ยังไม่ได้ระบุ'}
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={userProfile.dreamCareer}
                  onChange={(e) => updateUserProfile({ dreamCareer: e.target.value })}
                  placeholder="พิมพ์อาชีพที่อยากเป็น เช่น สัตวแพทย์, แพทย์, วิศวกร"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Preset Career Chips */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 mb-1.5">เลือกจากอาชีพยอดนิยม:</div>
                <div className="flex flex-wrap gap-1.5">
                  {CAREER_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateUserProfile({ dreamCareer: c.name })}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer border ${
                        userProfile.dreamCareer === c.name
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700 border-slate-200'
                      }`}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Subjects for this career */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <span>กลุ่มวิชาที่ควรเน้นสำหรับ {userProfile.dreamCareer || 'อาชีพนี้'}:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCareerInfo.prioritySubjects.map((subName) => (
                    <span
                      key={subName}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      ★ {subName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dream Universities Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  <span>มหาวิทยาลัย & คณะในฝัน</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddUniModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มเป้าหมาย</span>
                </button>
              </div>

              {/* List of Dream Universities */}
              <div className="space-y-2.5">
                {(userProfile.dreamUniversities || []).map((uni, idx) => (
                  <div
                    key={uni.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 group hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {uni.faculty}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {uni.universityName} {uni.major ? `• ${uni.major}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteUniversity(uni.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {(userProfile.dreamUniversities || []).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    ยังไม่มีมหาวิทยาลัยในฝัน คลิกปุ่ม "+ เพิ่มเป้าหมาย" ด้านบนได้เลย
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FUTURE CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          {/* Readiness Bar Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-500" />
                  <span>เส้นทางสู่เป้าหมายของฉัน (Future Checklist)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เช็กลิสต์เตรียมความพร้อมก่อนเข้ามหาวิทยาลัย ทั้งด้านผลการเรียน กิจกรรม และเอกสาร
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddChecklistOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มข้อเช็กลิสต์</span>
              </button>
            </div>

            {/* Progress Bar with Cute Text */}
            <div className="space-y-1.5 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">“ความพร้อมของคุณ”</span>
                <span className="text-pink-600 font-black">
                  {readinessPercent}% (ทำแล้ว {completedChecklist} / {totalChecklist} รายการ)
                </span>
              </div>
              <div className="h-3 w-full bg-white rounded-full overflow-hidden p-0.5 border border-pink-200">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 pt-1">
              {(['all', 'pending', 'completed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChecklistFilter(mode)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    checklistFilter === mode
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {mode === 'all'
                    ? 'ทั้งหมด'
                    : mode === 'pending'
                    ? `ยังไม่เสร็จ (${totalChecklist - completedChecklist})`
                    : `เสร็จแล้ว (${completedChecklist})`}
                </button>
              ))}
            </div>

            {/* Checklist items list */}
            <div className="space-y-2.5 pt-2">
              {filteredChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    item.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-700'
                      : 'bg-slate-50 hover:bg-white border-slate-200/80 text-slate-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-start gap-3 flex-1 text-left cursor-pointer select-none"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-pink-500 transition-colors" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </div>
                      {item.recommendedReason && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          💡 {item.recommendedReason}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteFutureChecklistItem(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer shrink-0"
                    title="ลบข้อนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredChecklist.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ไม่มีรายการในหมวดนี้
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PORTFOLIO PLANNER */}
      {activeSubTab === 'portfolio' && (
        <div className="space-y-6">
          {/* Portfolio Stats & Top Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-pink-500" />
                  <span>Portfolio Planner (คลังผลงานและเกียรติบัตร)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รวบรวมเกียรติบัตร โครงงาน กิจกรรม และจิตอาสาเพื่อเตรียมยื่นสมัคร TCAS รอบที่ 1
                </p>
              </div>

              <button
                type="button"
                id="add-portfolio-btn"
                onClick={() => {
                  setEditingPortItem(null);
                  setPortTitle('');
                  setPortDesc('');
                  setPortCategory('certificate');
                  setPortDate(new Date().toISOString().split('T')[0]);
                  setPortInPortfolio(true);
                  setIsAddPortModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มผลงานใหม่</span>
              </button>
            </div>

            {/* 4 Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">ผลงานทั้งหมด</div>
                  <div className="text-xl font-black text-pink-700">{totalPortfolio} ชิ้น</div>
                </div>
                <FolderHeart className="w-5 h-5 text-pink-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">ใช้ใน Portfolio</div>
                  <div className="text-xl font-black text-purple-700">{inPortfolioCount} ชิ้น</div>
                </div>
                <Star className="w-5 h-5 text-purple-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">เกียรติบัตร / รางวัล</div>
                  <div className="text-xl font-black text-indigo-700">{certificateCount} ใบ</div>
                </div>
                <Award className="w-5 h-5 text-indigo-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">โครงงาน & กิจกรรม</div>
                  <div className="text-xl font-black text-teal-700">{projectCount + activityCount} รายการ</div>
                </div>
                <Layers className="w-5 h-5 text-teal-400" />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => setPortfolioCategoryFilter('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  portfolioCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({totalPortfolio})
              </button>

              {(Object.keys(categoryLabels) as PortfolioCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPortfolioCategoryFilter(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    portfolioCategoryFilter === cat
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}

              <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={portfolioOnlySelected}
                  onChange={(e) => setPortfolioOnlySelected(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500"
                />
                <span>เฉพาะที่ติ๊ก "ใช้ใน Portfolio"</span>
              </label>
            </div>
          </div>

          {/* Portfolio Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortfolio.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                      {categoryLabels[item.category]}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleInPortfolio(item.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        item.inPortfolio
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title="เลือกใส่ในแฟ้ม Portfolio TCAS หรือไม่"
                    >
                      <Star className={`w-3 h-3 ${item.inPortfolio ? 'fill-purple-600 text-purple-600' : ''}`} />
                      <span>{item.inPortfolio ? 'อยู่ใน Portfolio' : 'เก็บในคลัง'}</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPortItem(item);
                        setPortTitle(item.title);
                        setPortDesc(item.description);
                        setPortCategory(item.category);
                        setPortDate(item.date);
                        setPortInPortfolio(item.inPortfolio);
                        setIsAddPortModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePortfolioItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPortfolio.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                ยังไม่มีผลงานในหมวดนี้ คลิกปุ่ม "+ เพิ่มผลงานใหม่" เพื่อเริ่มบันทึกแฟ้มสะสมงานของคุณ!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: FUTURE TODOS */}
      {activeSubTab === 'todos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-500" />
                  <span>สิ่งที่ต้องทำเพื่ออนาคต (Future To-do)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  จัดการงานที่ต้องเตรียมตัวระยะยาว เช่น ติวสอบ สมัครค่าย อบรมเกียรติบัตร และยื่นเอกสาร
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddTodoOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มงานใหม่</span>
              </button>
            </div>

            {/* Todo items */}
            <div className="space-y-2.5 pt-1">
              {futureTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    todo.isCompleted
                      ? 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                      : 'bg-white hover:bg-slate-50/50 border-slate-200 text-slate-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFutureTodo(todo.id)}
                    className="flex items-start gap-3 flex-1 text-left cursor-pointer select-none"
                  >
                    <div className="mt-0.5 shrink-0">
                      {todo.isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {todo.title}
                      </div>
                      {todo.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {todo.notes}
                        </p>
                      )}
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
                          <Clock className="w-3 h-3" />
                          <span>กำหนดส่ง: {todo.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        todo.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : todo.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {todo.priority === 'high' ? 'ด่วน' : todo.priority === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteFutureTodo(todo.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {futureTodos.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ยังไม่มีงานเพื่ออนาคต คลิก "+ เพิ่มงานใหม่" เพื่อบันทึกสิ่งที่ต้องทำได้เลย
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: STUDY & CAREER ALIGNMENT */}
      {activeSubTab === 'alignment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  <span>วิเคราะห์การเรียนกับเป้าหมายอนาคต</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เชื่อมโยงคะแนนรายวิชากับคณะและอาชีพ {userProfile.dreamCareer || 'เป้าหมาย'} ของคุณ
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold">
                <span>{selectedCareerInfo.icon}</span>
                <span>{userProfile.dreamCareer}</span>
              </div>
            </div>

            {/* Helpful disclaimer box as specified by user instructions */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                ระบบแนะนำวิชาที่ <strong>“ควรให้ความสำคัญ”</strong> เป็นพิเศษตามแนวทางวิชาชีพ
                เพื่อให้คุณจัดเวลาทบทวนและฝึกทำโจทย์ได้ตรงจุดที่สุด ไม่ใช่เกณฑ์ชี้ขาดการสอบติด
                โดยคุณสามารถปรับเปลี่ยนเป้าหมายได้ตลอดเวลาค่ะ
              </div>
            </div>

            {/* Subject Performance vs Future Goal Priority */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800">
                สถานะวิชาในเทอมปัจจุบัน ({activeSemesterSummary.semesterName}):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeSemesterSummary.subjectSummaries.map((sum) => {
                  const isPriority = selectedCareerInfo.prioritySubjects.some((ps) =>
                    sum.subject.name.toLowerCase().includes(ps.toLowerCase())
                  );

                  return (
                    <div
                      key={sum.subject.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        isPriority
                          ? 'bg-purple-50/30 border-purple-200 ring-1 ring-purple-100'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-slate-900">{sum.subject.name}</span>
                          {isPriority && (
                            <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                              ★ วิชาที่ควรเน้น
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-800">
                          เกรดคาดการณ์ {sum.estimatedGrade.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>เก็บแล้ว {sum.earnedScore} / {sum.totalMaxScoreRecorded} คะแนน</span>
                        <span className="font-bold text-slate-700">{sum.currentPercentage.toFixed(1)}%</span>
                      </div>

                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sum.targetAchieved ? 'bg-emerald-500' : isPriority ? 'bg-purple-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, sum.currentPercentage)}%` }}
                        />
                      </div>

                      <div className="text-[11px] font-medium pt-0.5">
                        {sum.targetAchieved ? (
                          <span className="text-emerald-600 font-semibold">
                            ✓ ผ่านเป้าหมายเกรด {sum.subject.targetGrade} แล้ว
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            เป้าหมาย {sum.subject.targetGrade} • ขาดอีก {sum.pointsNeededForTarget} คะแนน
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add Dream University */}
      {isAddUniModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 border border-indigo-100 shadow-2xl relative max-h-[92vh] overflow-y-auto box-border">
            <h3 className="text-lg font-black text-slate-900 mb-3">เพิ่มมหาวิทยาลัยในฝัน 🎓</h3>
            <form onSubmit={handleAddUniversity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อมหาวิทยาลัย</label>
                <input
                  type="text"
                  value={newUniName}
                  onChange={(e) => setNewUniName(e.target.value)}
                  placeholder="เช่น มหาวิทยาลัยเชียงใหม่"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {UNIVERSITY_PRESETS.slice(0, 4).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setNewUniName(u)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">คณะ</label>
                <input
                  type="text"
                  value={newFaculty}
                  onChange={(e) => setNewFaculty(e.target.value)}
                  placeholder="เช่น คณะสัตวแพทยศาสตร์"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {FACULTY_PRESETS.slice(0, 4).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setNewFaculty(f)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สาขา (ถ้ามี)</label>
                <input
                  type="text"
                  value={newMajor}
                  onChange={(e) => setNewMajor(e.target.value)}
                  placeholder="เช่น สาขาสัตวแพทยศาสตร์"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUniModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
                >
                  บันทึกเป้าหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add/Edit Portfolio Item */}
      {isAddPortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 border border-pink-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto box-border">
            <h3 className="text-lg font-black text-slate-900 mb-3">
              {editingPortItem ? 'แก้ไขผลงาน 📁' : 'เพิ่มผลงานใน Portfolio 📁'}
            </h3>
            <form onSubmit={handleSavePortfolio} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผลงาน / กิจกรรม</label>
                <input
                  type="text"
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  placeholder="เช่น เกียรติบัตรเหรียญทองตอบปัญหาวิทยาศาสตร์"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={portCategory}
                    onChange={(e) => setPortCategory(e.target.value as PortfolioCategory)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="certificate">📜 เกียรติบัตร</option>
                    <option value="award">🏆 รางวัล</option>
                    <option value="project">🔬 โครงงาน</option>
                    <option value="activity">🤝 กิจกรรม</option>
                    <option value="volunteer">❤️ จิตอาสา</option>
                    <option value="academic">📚 ผลงานวิชาการ</option>
                    <option value="other">🎨 อื่น ๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันที่ได้รับ / จัดทำ</label>
                  <input
                    type="date"
                    value={portDate}
                    onChange={(e) => setPortDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียด / สิ่งที่ได้เรียนรู้</label>
                <textarea
                  rows={3}
                  value={portDesc}
                  onChange={(e) => setPortDesc(e.target.value)}
                  placeholder="เขียนอธิบายบทบาท หน้าที่ หรือผลลัพธ์ที่ภาคภูมิใจ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="p-3 bg-pink-50/70 rounded-2xl border border-pink-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">เลือกใช้ในเล่ม Portfolio TCAS</span>
                  <p className="text-[11px] text-slate-500">คัดเลือกผลงานเด่นสำหรับจัดหน้าเล่ม 10 หน้า</p>
                </div>
                <input
                  type="checkbox"
                  checked={portInPortfolio}
                  onChange={(e) => setPortInPortfolio(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPortModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs hover:bg-pink-700"
                >
                  บันทึกผลงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Checklist Item */}
      {isAddChecklistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 border border-pink-100 shadow-2xl relative max-h-[92vh] overflow-y-auto box-border">
            <h3 className="text-lg font-black text-slate-900 mb-3">เพิ่มข้อเช็กลิสต์ความพร้อม 🚀</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newChecklistTitle.trim()) return;
                addFutureChecklistItem({
                  title: newChecklistTitle.trim(),
                  category: newChecklistCategory,
                  isCompleted: false,
                });
                setNewChecklistTitle('');
                setIsAddChecklistOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อเตรียมความพร้อม</label>
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="เช่น ซ้อมสัมภาษณ์ภาษาอังกฤษ, อ่านระเบียบการ TCAS"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddChecklistOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs hover:bg-pink-700"
                >
                  เพิ่มข้อนี้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Future Todo */}
      {isAddTodoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 border border-indigo-100 shadow-2xl relative max-h-[92vh] overflow-y-auto box-border">
            <h3 className="text-lg font-black text-slate-900 mb-3">เพิ่มสิ่งที่ต้องทำเพื่ออนาคต 📝</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTodoTitle.trim()) return;
                addFutureTodo({
                  title: newTodoTitle.trim(),
                  dueDate: newTodoDueDate,
                  priority: newTodoPriority,
                  notes: newTodoNotes.trim(),
                  isCompleted: false,
                });
                setNewTodoTitle('');
                setNewTodoDueDate('');
                setNewTodoNotes('');
                setIsAddTodoOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่องาน / สิ่งที่ต้องทำ</label>
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="เช่น สมัครสอบ TGAT/TPAT, เตรียมไฟล์ใบ ปพ.1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดส่ง / กำหนดเสร็จ</label>
                  <input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ความสำคัญ</label>
                  <select
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="high">ด่วน</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="low">ทั่วไป</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">บันทึกช่วยจำ (ถ้ามี)</label>
                <textarea
                  rows={2}
                  value={newTodoNotes}
                  onChange={(e) => setNewTodoNotes(e.target.value)}
                  placeholder="โน้ตเพิ่มเติม..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTodoOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
                >
                  เพิ่มงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
