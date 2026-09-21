import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Edit2,
  Trash2,
  ChevronRight,
  RefreshCw,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  User,
  Target,
  GraduationCap,
  Award,
  ArrowRight,
  CheckSquare,
  Square,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGrade } from '../context/GradeContext';
import { useTheme } from '../context/ThemeContext';
import { useAiQuickFill } from '../context/AiQuickFillContext';
import {
  AiQuickFillScope,
  AiParseResponse,
  AiParsedProfile,
  AiParsedTask,
  AiParsedExam,
  AiParsedSubject,
  AiParsedGoal,
  AiParsedPortfolio,
  AiParsedStudy,
  AiAmbiguityItem,
  AiConflictItem,
} from '../types/aiQuickFill';
import { parseWithAiOrFallback } from '../utils/aiQuickFillService';
import { NumericGrade, ScorePeriodKey, TaskStatus, GradeLevel } from '../types';

export const AiQuickFillModal: React.FC = () => {
  const { isOpen, scope: initialScope, initialText, subjectId, initialFile, closeAiQuickFill } = useAiQuickFill();
  const {
    subjects,
    userProfile,
    tasks,
    exams,
    currentSemester,
    updateUserProfile,
    updateStudentName,
    updateTargetGpa,
    addTask,
    addExam,
    addSubject,
    addFutureTodo,
    addPortfolioItem,
    addStudySession,
  } = useGrade();
  const { themeColor } = useTheme();

  // Modal flow state: 'input' | 'analyzing' | 'preview' | 'success'
  const [step, setStep] = useState<'input' | 'analyzing' | 'preview' | 'success'>('input');
  const [scope, setScope] = useState<AiQuickFillScope>(initialScope);
  const [inputText, setInputText] = useState(initialText);
  const [analysisProgress, setAnalysisProgress] = useState<string>('อ่านข้อความ...');

  // Uploaded file
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialFile || null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed data in preview state
  const [parsedProfile, setParsedProfile] = useState<AiParsedProfile | undefined>(undefined);
  const [parsedTasks, setParsedTasks] = useState<AiParsedTask[]>([]);
  const [parsedExams, setParsedExams] = useState<AiParsedExam[]>([]);
  const [parsedSubjects, setParsedSubjects] = useState<AiParsedSubject[]>([]);
  const [parsedGoals, setParsedGoals] = useState<AiParsedGoal[]>([]);
  const [parsedPortfolio, setParsedPortfolio] = useState<AiParsedPortfolio[]>([]);
  const [parsedStudy, setParsedStudy] = useState<AiParsedStudy[]>([]);
  const [ambiguities, setAmbiguities] = useState<AiAmbiguityItem[]>([]);
  const [conflicts, setConflicts] = useState<AiConflictItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [summaryText, setSummaryText] = useState<string>('');

  // Sync initial parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setScope(initialScope);
      setInputText(initialText);
      setUploadedFile(initialFile || null);
      if (initialFile) {
        handleFileSelect(initialFile);
      }
    } else {
      // Clean up preview URL
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      setFileBase64(null);
      setUploadedFile(null);
    }
  }, [isOpen, initialScope, initialText, initialFile]);

  // Handle file selection (Images, PDF, TXT)
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setFileBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Samples
  const handleLoadSample = (sampleType: string) => {
    if (sampleType === 'full') {
      setInputText(
        `ชื่อ ชญาภา จันทร์ส่อง อยู่ ม.4/2 เลขที่ 23\nเป้าหมายเกรด 3.8 อยากเข้าคณะสัตวแพทยศาสตร์\nมีสอบภาษาอังกฤษวันที่ 28 กันยายน เวลา 09:00 หัวข้อสอบ Conditional Sentences\nงานคณิตศาสตร์ส่งวันที่ 25 กันยายน`
      );
      setScope('all');
    } else if (sampleType === 'multi_tasks') {
      setInputText(
        `มีงานคณิตศาสตร์ส่ง 25 ก.ย.\nงานภาษาอังกฤษส่ง 27 ก.ย.\nโครงงานวิทยาศาสตร์ส่ง 30 ก.ย.\nสอบคณิตศาสตร์ 2 ต.ค. 09:00\nสอบภาษาอังกฤษ 4 ต.ค. 13:00`
      );
      setScope('all');
    } else if (sampleType === 'exams') {
      setInputText(
        `สอบคณิตศาสตร์ วันที่ 28/09/2569 เวลา 08:30 - 10:30 ห้อง 324 หัวข้อ ตรรกศาสตร์และจำนวนจริง\nสอบฟิสิกส์ วันที่ 30/09/2569 เวลา 13:00 - 15:00 ห้อง 412 หัวข้อ การเคลื่อนที่แนวตรง`
      );
      setScope('exams');
    } else if (sampleType === 'profile_goal') {
      setInputText(
        `เราชื่อ ธนภัทร สุขสมบูรณ์ ม.5/1 เลขที่ 7 รร.เตรียมอุดมศึกษา\nเป้าหมายเกรด 4.0 อยากเป็นแพทย์ มหาวิทยาลัยเชียงใหม่\nอ่านหนังสือชีววิทยาวันเสาร์ 2 ชั่วโมง`
      );
      setScope('profile');
    }
  };

  // Analyze Action
  const handleStartAnalysis = async () => {
    if (!inputText.trim() && !fileBase64) return;

    setStep('analyzing');
    setAnalysisProgress('กำลังอ่านข้อความและไฟล์...');

    const timer1 = setTimeout(() => setAnalysisProgress('กำลังวิเคราะห์โครงสร้างข้อมูล...'), 600);
    const timer2 = setTimeout(() => setAnalysisProgress('จัดหมวดหมู่ & ตรวจสอบข้อมูลเดิม...'), 1200);

    try {
      const response = await parseWithAiOrFallback({
        text: inputText,
        scope,
        fileBase64: fileBase64 || undefined,
        fileMimeType: uploadedFile?.type,
        fileName: uploadedFile?.name,
        subjects,
        userProfile,
        tasks,
        exams,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setSummaryText(response.summary);
      setParsedProfile(response.profile);
      setParsedTasks(response.tasks);
      setParsedExams(response.exams);
      setParsedSubjects(response.subjects);
      setParsedGoals(response.goals);
      setParsedPortfolio(response.portfolio);
      setParsedStudy(response.studyPlans);
      setAmbiguities(response.ambiguities);
      setConflicts(response.conflicts);
      setWarnings(response.warnings);

      setStep('preview');
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setStep('input');
      alert('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Resolve Ambiguity (User chooses subject)
  const handleResolveAmbiguity = (ambiguityId: string, chosenSubjectId: string) => {
    const matched = subjects.find((s) => s.id === chosenSubjectId);
    if (!matched) return;

    // Update tasks
    setParsedTasks((prev) =>
      prev.map((t) => (t.matchedSubjectId === chosenSubjectId ? { ...t, subjectQuery: matched.name } : t))
    );
    // Update exams
    setParsedExams((prev) =>
      prev.map((e) => (e.matchedSubjectId === chosenSubjectId ? { ...e, subjectQuery: matched.name } : e))
    );

    setAmbiguities((prev) =>
      prev.map((a) => (a.id === ambiguityId ? { ...a, isResolved: true, selectedOption: chosenSubjectId } : a))
    );
  };

  // Resolve Conflict (Keep old vs Use new)
  const handleResolveConflict = (conflictId: string, action: 'keep_old' | 'use_new') => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, action } : c))
    );
    if (conflictId === 'conflict_gpa' && parsedProfile) {
      if (action === 'keep_old') {
        setParsedProfile({ ...parsedProfile, targetGpa: userProfile.targetGpa });
      }
    }
    if (conflictId === 'conflict_name' && parsedProfile) {
      if (action === 'keep_old') {
        setParsedProfile({ ...parsedProfile, fullName: userProfile.fullName });
      }
    }
  };

  // Toggle included item
  const toggleTaskInclude = (tempId: string) => {
    setParsedTasks((prev) =>
      prev.map((t) => (t.tempId === tempId ? { ...t, included: !t.included } : t))
    );
  };

  const toggleExamInclude = (tempId: string) => {
    setParsedExams((prev) =>
      prev.map((e) => (e.tempId === tempId ? { ...e, included: !e.included } : e))
    );
  };

  const toggleSubjectInclude = (tempId: string) => {
    setParsedSubjects((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, included: !s.included } : s))
    );
  };

  const toggleGoalInclude = (tempId: string) => {
    setParsedGoals((prev) =>
      prev.map((g) => (g.tempId === tempId ? { ...g, included: !g.included } : g))
    );
  };

  const toggleStudyInclude = (tempId: string) => {
    setParsedStudy((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, included: !s.included } : s))
    );
  };

  // Calculate total items to be saved
  const includedTaskCount = parsedTasks.filter((t) => t.included).length;
  const includedExamCount = parsedExams.filter((e) => e.included).length;
  const includedSubjectCount = parsedSubjects.filter((s) => s.included).length;
  const includedGoalCount = parsedGoals.filter((g) => g.included).length;
  const includedStudyCount = parsedStudy.filter((s) => s.included).length;
  const hasProfileUpdate = Boolean(
    parsedProfile &&
      (parsedProfile.fullName ||
        parsedProfile.gradeLevel ||
        parsedProfile.room ||
        parsedProfile.studentNumber ||
        parsedProfile.targetGpa ||
        parsedProfile.dreamCareer ||
        parsedProfile.dreamFaculty)
  );

  const totalItemsCount =
    (hasProfileUpdate ? 1 : 0) +
    includedTaskCount +
    includedExamCount +
    includedSubjectCount +
    includedGoalCount +
    includedStudyCount;

  // Confirm and Save
  const handleConfirmAndSave = () => {
    // 1. Update Profile if present
    if (hasProfileUpdate && parsedProfile) {
      const profileUpdates: Partial<typeof userProfile> = {};
      if (parsedProfile.fullName) profileUpdates.fullName = parsedProfile.fullName;
      if (parsedProfile.gradeLevel) profileUpdates.gradeLevel = parsedProfile.gradeLevel as GradeLevel;
      if (parsedProfile.room) profileUpdates.room = parsedProfile.room;
      if (parsedProfile.studentNumber) profileUpdates.studentNumber = parsedProfile.studentNumber;
      if (parsedProfile.schoolName) profileUpdates.schoolName = parsedProfile.schoolName;
      if (parsedProfile.targetGpa) profileUpdates.targetGpa = parsedProfile.targetGpa;
      if (parsedProfile.dreamCareer) profileUpdates.dreamCareer = parsedProfile.dreamCareer;

      // Faculty / University in dreamUniversities
      if (parsedProfile.dreamFaculty || parsedProfile.dreamUniversity) {
        const existingUnis = [...(userProfile.dreamUniversities || [])];
        const newUni = {
          id: `uni_${Date.now()}`,
          universityName: parsedProfile.dreamUniversity || 'มหาวิทยาลัยในฝัน',
          faculty: parsedProfile.dreamFaculty || 'คณะที่สนใจ',
        };
        profileUpdates.dreamUniversities = [newUni, ...existingUnis];
      }

      updateUserProfile(profileUpdates);
      if (parsedProfile.fullName) {
        updateStudentName(parsedProfile.fullName, `${parsedProfile.gradeLevel || ''}/${parsedProfile.room || ''}`);
      }
      if (parsedProfile.targetGpa) {
        updateTargetGpa(parsedProfile.targetGpa);
      }
    }

    // 2. Add New Subjects
    const createdSubjectMap: Record<string, string> = {};
    parsedSubjects
      .filter((s) => s.included)
      .forEach((s) => {
        const newSub = addSubject({
          semesterId: currentSemester,
          name: s.name,
          code: s.code || '',
          credits: s.credits || 1.5,
          color: 'indigo',
          icon: 'BookOpen',
          targetGrade: s.targetGrade || 4,
          targetScore: s.targetScore || 80,
          category: s.category || 'ทั่วไป',
          periods: {
            preMidterm: { key: 'preMidterm', label: 'คะแนนเก็บก่อนกลางภาค', shortLabel: 'ก่อนกลางภาค', weight: 30, items: [] },
            midterm: { key: 'midterm', label: 'คะแนนสอบกลางภาค', shortLabel: 'กลางภาค', weight: 20, items: [] },
            postMidterm: { key: 'postMidterm', label: 'คะแนนเก็บหลังกลางภาค', shortLabel: 'หลังกลางภาค', weight: 20, items: [] },
            final: { key: 'final', label: 'คะแนนสอบปลายภาค', shortLabel: 'ปลายภาค', weight: 30, items: [] },
          },
        });
        createdSubjectMap[s.name] = newSub.id;
      });

    // 3. Add Tasks
    parsedTasks
      .filter((t) => t.included)
      .forEach((t) => {
        // Find subjectId
        let targetSubId = t.matchedSubjectId || createdSubjectMap[t.subjectQuery];
        if (!targetSubId && subjects.length > 0) {
          const fallbackSub = subjects.find((s) => s.name.includes(t.subjectQuery) || t.subjectQuery.includes(s.name));
          targetSubId = fallbackSub ? fallbackSub.id : subjects[0].id;
        }

        if (targetSubId) {
          addTask({
            semesterId: currentSemester,
            subjectId: targetSubId,
            title: t.title,
            periodKey: t.periodKey || 'preMidterm',
            dueDate: t.dueDate,
            dueTime: t.dueTime || '17:00',
            maxScore: t.maxScore || 10,
            status: t.status || 'todo',
            notes: t.notes,
          });
        }
      });

    // 4. Add Exams
    parsedExams
      .filter((e) => e.included)
      .forEach((e) => {
        let targetSubId = e.matchedSubjectId || createdSubjectMap[e.subjectQuery];
        if (!targetSubId && subjects.length > 0) {
          const fallbackSub = subjects.find((s) => s.name.includes(e.subjectQuery) || e.subjectQuery.includes(s.name));
          targetSubId = fallbackSub ? fallbackSub.id : subjects[0].id;
        }

        if (targetSubId) {
          addExam({
            semesterId: currentSemester,
            subjectId: targetSubId,
            examType: e.examType,
            examDate: e.examDate,
            startTime: e.startTime || '08:30',
            endTime: e.endTime || '10:30',
            room: e.room || '',
            maxScore: e.maxScore || 30,
            topics: e.topics && e.topics.length > 0 ? e.topics : ['เนื้อหาบทเรียน'],
            tips: e.tips || '',
            studyStatus: 'not_started',
          });
        }
      });

    // 5. Add Goals
    parsedGoals
      .filter((g) => g.included)
      .forEach((g) => {
        addFutureTodo({
          title: g.title,
          dueDate: g.dueDate,
          priority: 'medium',
          isCompleted: false,
          notes: g.details,
        });
      });

    // 6. Add Portfolio
    parsedPortfolio
      .filter((p) => p.included)
      .forEach((p) => {
        addPortfolioItem({
          title: p.title,
          description: p.description,
          category: p.category,
          date: p.date,
          inPortfolio: true,
        });
      });

    // 7. Add Study Sessions
    parsedStudy
      .filter((s) => s.included)
      .forEach((s) => {
        let targetSubId = s.matchedSubjectId || createdSubjectMap[s.subjectQuery];
        if (!targetSubId && subjects.length > 0) targetSubId = subjects[0].id;
        if (targetSubId) {
          const sub = subjects.find((sb) => sb.id === targetSubId);
          addStudySession({
            subjectId: targetSubId,
            subjectName: sub ? sub.name : s.subjectQuery,
            category: sub?.category || 'ทั่วไป',
            topic: s.topic,
            date: s.date,
            startTime: '19:00',
            durationMinutes: s.durationMinutes,
            mode: 'normal',
            notes: s.notes,
          });
        }
      });

    // Celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setStep('success');
    setTimeout(() => {
      closeAiQuickFill();
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-quick-fill-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="ai-quick-fill-modal-container"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-linear-to-r from-pink-50/70 via-purple-50/50 to-indigo-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">✨ AI ช่วยกรอกข้อมูล</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700 border border-pink-200">
                  Quick Fill
                </span>
              </div>
              <p className="text-xs text-slate-500">
                พิมพ์ข้อมูลหลายอย่างรวมกันในครั้งเดียว AI ช่วยแยกและกรอกลงช่องที่ถูกต้องให้ทันที
              </p>
            </div>
          </div>
          <button
            id="close-ai-quick-fill-btn"
            onClick={closeAiQuickFill}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Category Scope Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-400 font-medium whitespace-nowrap mr-1">โหมด:</span>
                {[
                  { id: 'all', label: '🌟 ทั้งหมด (ตรวจจับอัตโนมัติ)' },
                  { id: 'profile', label: '👤 ข้อมูลส่วนตัว & เป้าหมาย' },
                  { id: 'tasks', label: '📝 งาน (Tasks)' },
                  { id: 'exams', label: '⏰ ตารางสอบ (Exams)' },
                  { id: 'subjects', label: '📚 วิชา & คะแนน' },
                  { id: 'goals', label: '🎯 เป้าหมาย' },
                  { id: 'study', label: '📖 แผนอ่านหนังสือ' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id as AiQuickFillScope)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                      scope === s.id
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    พิมพ์หรือวางข้อความได้อิสระ ไม่ต้องเรียงลำดับ:
                  </label>
                  <span className="text-[11px] text-slate-400">{inputText.length} ตัวอักษร</span>
                </div>
                <textarea
                  id="ai-quick-fill-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`เช่น\nชื่อ ชญาภา จันทร์ส่อง\nม.4/2 เลขที่ 23\nเป้าหมายเกรด 3.8\nอยากเข้าคณะสัตวแพทยศาสตร์\nมีสอบอังกฤษวันที่ 28 ก.ย. เวลา 9 โมง\nหัวข้อสอบ Conditional Sentences\nต้องส่งงานคณิตวันที่ 25 ก.ย.`}
                  className="w-full h-44 sm:h-52 p-4 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 transition-all resize-none placeholder:text-slate-400 leading-relaxed font-sans"
                />
              </div>

              {/* Sample Presets */}
              <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" /> ตัวอย่างข้อความทดลองใช้งานเร็ว:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('full')}
                    className="px-2.5 py-1 text-xs bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors shadow-2xs"
                  >
                    🌸 ข้อมูลนักเรียน + งานคณิต + สอบอังกฤษ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('multi_tasks')}
                    className="px-2.5 py-1 text-xs bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors shadow-2xs"
                  >
                    📝 ส่งงาน 3 วิชา + สอบ 2 วิชา
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('exams')}
                    className="px-2.5 py-1 text-xs bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors shadow-2xs"
                  >
                    ⏰ ตารางสอบกลางภาคมีห้อง & หัวข้อ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('profile_goal')}
                    className="px-2.5 py-1 text-xs bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-pink-300 hover:text-pink-600 transition-colors shadow-2xs"
                  >
                    🎯 เกรดเป้าหมาย 4.0 + คณะแพทย์
                  </button>
                </div>
              </div>

              {/* File Attachment Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>📎 แนบรูปภาพตารางสอบ / ไฟล์ตารางงาน (อุปกรณ์เสริม):</span>
                  <span className="text-[11px] text-slate-400 font-normal">รองรับ JPG, PNG, PDF, TXT</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf,text/plain"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-pink-400 hover:bg-pink-50/30 transition-all cursor-pointer flex items-center justify-center gap-3 text-center text-slate-500 text-xs"
                  >
                    <Upload className="w-5 h-5 text-pink-500" />
                    <span>
                      คลิกเพื่ออัปโหลดรูปภาพตารางสอบ หรือเอกสาร PDF / เอกสารสรุปงาน
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-pink-50/50 border border-pink-200/80 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {filePreviewUrl ? (
                        <img
                          src={filePreviewUrl}
                          alt="preview"
                          className="w-12 h-12 rounded-lg object-cover border border-pink-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • AI พร้อมสแกนข้อความ
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFileBase64(null);
                        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                        setFilePreviewUrl(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING LOADING */}
          {step === 'analyzing' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-base">✨ AI กำลังจัดข้อมูลให้...</h4>
                <p className="text-xs text-slate-500">{analysisProgress}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
                <span>อ่านข้อความ</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span>วิเคราะห์ข้อมูล</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span>จัดหมวดหมู่</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span>เตรียมข้อมูล</span>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VERIFICATION */}
          {step === 'preview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-pink-50 to-indigo-50 border border-pink-200/80 space-y-1">
                <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{summaryText || '✨ AI เข้าใจข้อมูลดังนี้:'}</span>
                </div>
                <p className="text-xs text-slate-600">
                  กรุณาตรวจสอบข้อมูลด้านล่างก่อนยืนยัน คุณสามารถแก้ไขค่าในช่อง หรือกดยกเลิกรายการที่ไม่ต้องการได้
                </p>
              </div>

              {/* Ambiguity Warnings (⚠️ AI ไม่แน่ใจ) */}
              {ambiguities.filter((a) => !a.isResolved).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ⚠️ AI ไม่แน่ใจ (ต้องการให้ผู้ใช้ยืนยัน):
                  </h4>
                  {ambiguities
                    .filter((a) => !a.isResolved)
                    .map((amb) => (
                      <div
                        key={amb.id}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900"
                      >
                        <p className="font-semibold">{amb.message}</p>
                        <div className="flex flex-wrap gap-2">
                          {amb.options.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleResolveAmbiguity(amb.id, opt.value)}
                              className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl hover:bg-amber-100 font-medium text-amber-800 shadow-2xs transition-colors"
                            >
                              ✓ {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Conflict Warnings (⚠️ พบข้อมูลเดิม) */}
              {conflicts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    ⚠️ ตรวจพบข้อมูลเดิมที่มีอยู่แล้ว:
                  </h4>
                  {conflicts.map((conf) => (
                    <div
                      key={conf.id}
                      className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-950"
                    >
                      <div>
                        <span className="font-bold">{conf.label}:</span> เดิมระบุเป็น{' '}
                        <span className="font-semibold underline text-slate-700">{conf.oldValue}</span> ข้อมูลใหม่คือ{' '}
                        <span className="font-semibold underline text-pink-700">{conf.newValue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(conf.id, 'keep_old')}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                            conf.action === 'keep_old'
                              ? 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          เก็บ {conf.oldValue}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(conf.id, 'use_new')}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                            conf.action === 'use_new'
                              ? 'bg-pink-600 text-white border-pink-600'
                              : 'bg-white text-pink-700 border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          เปลี่ยนเป็น {conf.newValue}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* General Warnings */}
              {warnings.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-800 space-y-1">
                  {warnings.map((w, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <span className="shrink-0">ℹ️</span> {w}
                    </p>
                  ))}
                </div>
              )}

              {/* 1. Profile Preview Section */}
              {parsedProfile && hasProfileUpdate && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-pink-500" /> 👤 ข้อมูลส่วนตัว & เป้าหมาย
                    </span>
                    <span className="text-[11px] text-slate-400">แก้ไขข้อมูลได้ในช่อง</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {parsedProfile.fullName !== undefined && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">ชื่อ-นามสกุล:</label>
                        <input
                          type="text"
                          value={parsedProfile.fullName || ''}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, fullName: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    )}
                    {(parsedProfile.gradeLevel !== undefined || parsedProfile.room !== undefined) && (
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="text-[11px] text-slate-500 block mb-1">ระดับชั้น:</label>
                          <input
                            type="text"
                            value={parsedProfile.gradeLevel || ''}
                            onChange={(e) => setParsedProfile({ ...parsedProfile, gradeLevel: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="text-[11px] text-slate-500 block mb-1">ห้อง:</label>
                          <input
                            type="text"
                            value={parsedProfile.room || ''}
                            onChange={(e) => setParsedProfile({ ...parsedProfile, room: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                    {parsedProfile.studentNumber !== undefined && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">เลขที่:</label>
                        <input
                          type="text"
                          value={parsedProfile.studentNumber || ''}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, studentNumber: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    )}
                    {parsedProfile.targetGpa !== undefined && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1 font-semibold text-pink-600">
                          เกรดเป้าหมาย (0-4):
                        </label>
                        <select
                          value={parsedProfile.targetGpa || 4}
                          onChange={(e) =>
                            setParsedProfile({
                              ...parsedProfile,
                              targetGpa: parseFloat(e.target.value) as NumericGrade,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none bg-white"
                        >
                          {[4, 3.5, 3, 2.5, 2, 1.5, 1, 0].map((g) => (
                            <option key={g} value={g}>
                              เกรด {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {parsedProfile.dreamFaculty !== undefined && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">คณะในฝัน:</label>
                        <input
                          type="text"
                          value={parsedProfile.dreamFaculty || ''}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, dreamFaculty: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    )}
                    {parsedProfile.dreamCareer !== undefined && (
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">อาชีพในอนาคต:</label>
                        <input
                          type="text"
                          value={parsedProfile.dreamCareer || ''}
                          onChange={(e) => setParsedProfile({ ...parsedProfile, dreamCareer: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Tasks Preview Section */}
              {parsedTasks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-indigo-500" /> 📝 งานและการบ้าน ({parsedTasks.length} รายการ)
                    </span>
                    <span className="text-[11px] text-slate-500">เลือกรายการที่ต้องการบันทึก</span>
                  </div>

                  <div className="space-y-2.5">
                    {parsedTasks.map((t, idx) => (
                      <div
                        key={t.tempId}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          t.included ? 'bg-white border-indigo-100 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTaskInclude(t.tempId)}
                            className="mt-1 text-indigo-600 hover:text-indigo-800"
                          >
                            {t.included ? (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <input
                                type="text"
                                value={t.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setParsedTasks((prev) =>
                                    prev.map((item) => (item.tempId === t.tempId ? { ...item, title: val } : item))
                                  );
                                }}
                                className="font-bold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1"
                              />

                              {t.isDuplicate && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                  ⚠️ งานคล้ายเดิม
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-slate-400 block">วิชา:</label>
                                <select
                                  value={t.matchedSubjectId || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setParsedTasks((prev) =>
                                      prev.map((item) =>
                                        item.tempId === t.tempId ? { ...item, matchedSubjectId: val } : item
                                      )
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                >
                                  <option value="">เลือกวิชาในระบบ...</option>
                                  {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block">กำหนดส่ง:</label>
                                <input
                                  type="date"
                                  value={t.dueDate}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setParsedTasks((prev) =>
                                      prev.map((item) => (item.tempId === t.tempId ? { ...item, dueDate: val } : item))
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block">เวลาส่ง:</label>
                                <input
                                  type="time"
                                  value={t.dueTime || '17:00'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setParsedTasks((prev) =>
                                      prev.map((item) => (item.tempId === t.tempId ? { ...item, dueTime: val } : item))
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Exams Preview Section */}
              {parsedExams.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-500" /> ⏰ ตารางสอบ ({parsedExams.length} รายการ)
                    </span>
                    <span className="text-[11px] text-slate-500">ตรวจสอบวันและหัวข้อสอบ</span>
                  </div>

                  <div className="space-y-2.5">
                    {parsedExams.map((e) => (
                      <div
                        key={e.tempId}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          e.included ? 'bg-white border-rose-100 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleExamInclude(e.tempId)}
                            className="mt-1 text-rose-600 hover:text-rose-800"
                          >
                            {e.included ? (
                              <CheckCircle2 className="w-5 h-5 text-rose-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  value={e.matchedSubjectId || ''}
                                  onChange={(ev) => {
                                    const val = ev.target.value;
                                    setParsedExams((prev) =>
                                      prev.map((item) =>
                                        item.tempId === e.tempId ? { ...item, matchedSubjectId: val } : item
                                      )
                                    );
                                  }}
                                  className="font-bold text-sm text-slate-900 border border-slate-200 rounded-lg px-2 py-1 bg-white"
                                >
                                  <option value="">{e.subjectQuery}</option>
                                  {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">
                                  {e.examType === 'final' ? 'ปลายภาค' : 'กลางภาค'}
                                </span>
                              </div>

                              {e.isDuplicate && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                  ⚠️ มีสอบวันเดียวกันแล้ว
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-slate-400 block">วันสอบ:</label>
                                <input
                                  type="date"
                                  value={e.examDate}
                                  onChange={(ev) => {
                                    const val = ev.target.value;
                                    setParsedExams((prev) =>
                                      prev.map((item) => (item.tempId === e.tempId ? { ...item, examDate: val } : item))
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                />
                              </div>

                              <div className="flex gap-2">
                                <div className="w-1/2">
                                  <label className="text-[10px] text-slate-400 block">เวลาเริ่ม:</label>
                                  <input
                                    type="time"
                                    value={e.startTime}
                                    onChange={(ev) => {
                                      const val = ev.target.value;
                                      setParsedExams((prev) =>
                                        prev.map((item) =>
                                          item.tempId === e.tempId ? { ...item, startTime: val } : item
                                        )
                                      );
                                    }}
                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                  />
                                </div>
                                <div className="w-1/2">
                                  <label className="text-[10px] text-slate-400 block">สิ้นสุด:</label>
                                  <input
                                    type="time"
                                    value={e.endTime}
                                    onChange={(ev) => {
                                      const val = ev.target.value;
                                      setParsedExams((prev) =>
                                        prev.map((item) =>
                                          item.tempId === e.tempId ? { ...item, endTime: val } : item
                                        )
                                      );
                                    }}
                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block">ห้องสอบ:</label>
                                <input
                                  type="text"
                                  placeholder="เช่น ห้อง 324"
                                  value={e.room || ''}
                                  onChange={(ev) => {
                                    const val = ev.target.value;
                                    setParsedExams((prev) =>
                                      prev.map((item) => (item.tempId === e.tempId ? { ...item, room: val } : item))
                                    );
                                  }}
                                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                                />
                              </div>
                            </div>

                            {/* Topics */}
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">หัวข้อสอบ:</label>
                              <div className="flex flex-wrap gap-1">
                                {e.topics.map((top, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    {top}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Subjects Preview Section */}
              {parsedSubjects.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> 📚 วิชาใหม่ที่ตรวจพบ ({parsedSubjects.length} วิชา)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {parsedSubjects.map((s) => (
                      <div
                        key={s.tempId}
                        className="p-3 bg-white border border-emerald-100 rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSubjectInclude(s.tempId)}
                            className="text-emerald-600"
                          >
                            {s.included ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="text-slate-400 ml-2">
                              {s.credits} หน่วยกิต • เป้าเกรด {s.targetGrade}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Goals & Study Plans */}
              {(parsedGoals.length > 0 || parsedStudy.length > 0) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-purple-500" /> 🎯 เป้าหมาย & แผนอ่านหนังสือ
                  </span>
                  <div className="space-y-1.5">
                    {parsedGoals.map((g) => (
                      <div
                        key={g.tempId}
                        className="p-2.5 bg-white border border-purple-100 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleGoalInclude(g.tempId)}
                            className="text-purple-600"
                          >
                            {g.included ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-medium text-slate-800">{g.title}</span>
                        </div>
                      </div>
                    ))}
                    {parsedStudy.map((st) => (
                      <div
                        key={st.tempId}
                        className="p-2.5 bg-white border border-indigo-100 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStudyInclude(st.tempId)}
                            className="text-indigo-600"
                          >
                            {st.included ? (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          <span className="font-medium text-slate-800">
                            อ่าน {st.subjectQuery}: {st.topic} ({st.durationMinutes} นาที)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS ANIMATION */}
          {step === 'success' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">บันทึกข้อมูลเรียบร้อยแล้ว!</h4>
              <p className="text-xs text-slate-500">
                ข้อมูลถูกเชื่อมเข้าสู่ MyGrade เรียบร้อยแล้ว ระบบปฏิทินและหน้าสรุปผลจะอัปเดตให้อัตโนมัติ
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          {step === 'input' && (
            <>
              <button
                type="button"
                onClick={closeAiQuickFill}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                id="ai-start-analysis-btn"
                type="button"
                disabled={!inputText.trim() && !fileBase64}
                onClick={handleStartAnalysis}
                className="px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-xl shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>✨ ให้ AI วิเคราะห์</span>
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อความเดิม</span>
                </button>
                <button
                  type="button"
                  onClick={closeAiQuickFill}
                  className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  ยกเลิก
                </button>
              </div>

              <button
                id="ai-confirm-save-btn"
                type="button"
                disabled={totalItemsCount === 0}
                onClick={handleConfirmAndSave}
                className="px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>✓ ยืนยันและบันทึก ({totalItemsCount} รายการ)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
