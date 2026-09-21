import { Subject, Task, Exam, UserProfile } from '../types';
import {
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
  AiQuickFillScope,
} from '../types/aiQuickFill';
import { parseWithRuleEngine, matchSubject } from './aiFallbackParser';

interface ParseRequestParams {
  text: string;
  scope?: AiQuickFillScope;
  fileBase64?: string;
  fileMimeType?: string;
  fileName?: string;
  subjects: Subject[];
  userProfile: UserProfile;
  tasks: Task[];
  exams: Exam[];
}

export async function parseWithAiOrFallback(params: ParseRequestParams): Promise<AiParseResponse> {
  const { text, scope = 'all', fileBase64, fileMimeType, fileName, subjects, userProfile, tasks, exams } = params;

  // Prepare minimal necessary context for privacy and efficiency
  const userContext = {
    existingSubjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    currentProfile: {
      fullName: userProfile.fullName,
      targetGpa: userProfile.targetGpa,
      gradeLevel: userProfile.gradeLevel,
      room: userProfile.room,
    },
    existingTasks: tasks.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, subjectId: t.subjectId })),
    existingExams: exams.map((e) => ({ id: e.id, subjectId: e.subjectId, examDate: e.examDate })),
  };

  let rawData: any = null;
  let useFallback = false;

  // Try calling server-side Gemini API route first
  try {
    const response = await fetch('/api/ai-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        scope,
        fileBase64,
        fileMimeType,
        fileName,
        userContext,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        rawData = result.data;
      } else {
        useFallback = true;
      }
    } else {
      useFallback = true;
    }
  } catch (err) {
    console.warn('Network error reaching /api/ai-parse, running intelligent fallback parser:', err);
    useFallback = true;
  }

  // If Gemini was unavailable or returned fallbackRequired, run local Thai rule engine
  if (useFallback || !rawData) {
    return parseWithRuleEngine(text, subjects, userProfile, tasks, exams, scope);
  }

  // Process and enrich Gemini output with duplicate, ambiguity, and conflict checks
  const warnings: string[] = Array.isArray(rawData.warnings) ? [...rawData.warnings] : [];
  const ambiguities: AiAmbiguityItem[] = [];
  const conflicts: AiConflictItem[] = [];

  // 1. Process Profile
  let profile: AiParsedProfile | undefined = undefined;
  if (rawData.profile && (scope === 'all' || scope === 'profile')) {
    const p = rawData.profile;
    profile = {
      fullName: p.fullName || undefined,
      gradeLevel: p.gradeLevel || undefined,
      room: p.room ? String(p.room) : undefined,
      studentNumber: p.studentNumber ? String(p.studentNumber) : undefined,
      schoolName: p.schoolName || undefined,
      targetGpa: typeof p.targetGpa === 'number' ? (p.targetGpa as any) : undefined,
      dreamCareer: p.dreamCareer || undefined,
      dreamFaculty: p.dreamFaculty || undefined,
      dreamUniversity: p.dreamUniversity || undefined,
    };

    // Conflict detection for Target GPA
    if (profile.targetGpa && userProfile.targetGpa && profile.targetGpa !== userProfile.targetGpa) {
      conflicts.push({
        id: 'conflict_gpa',
        field: 'targetGpa',
        label: 'เกรดเป้าหมาย',
        oldValue: userProfile.targetGpa,
        newValue: profile.targetGpa,
        action: 'use_new',
      });
    }

    // Conflict detection for Name
    if (profile.fullName && userProfile.fullName && profile.fullName !== userProfile.fullName) {
      conflicts.push({
        id: 'conflict_name',
        field: 'fullName',
        label: 'ชื่อ-นามสกุล',
        oldValue: userProfile.fullName,
        newValue: profile.fullName,
        action: 'use_new',
      });
    }
  }

  // 2. Process Tasks
  const parsedTasks: AiParsedTask[] = [];
  if (Array.isArray(rawData.tasks) && scope !== 'exams' && scope !== 'profile') {
    rawData.tasks.forEach((t: any, idx: number) => {
      const subQuery = t.subjectQuery || t.subject || 'ทั่วไป';
      const match = matchSubject(subQuery, subjects);

      let matchedId = match.matchedSubject?.id;
      if (!match.isExact && match.ambiguousMatches.length > 1) {
        ambiguities.push({
          id: `amb_task_${idx}`,
          type: 'subject_choice',
          query: subQuery,
          targetField: `task_${idx}_subject`,
          message: `วิชา "${subQuery}" ตรงกับหลายวิชาในระบบ:`,
          options: match.ambiguousMatches.map((s) => ({
            label: `${s.name} (${s.code || '-'})`,
            value: s.id,
          })),
          selectedOption: match.ambiguousMatches[0].id,
          isResolved: false,
        });
        matchedId = match.ambiguousMatches[0].id;
      }

      const dueDate = t.dueDate || '2026-09-25';
      const title = t.title || `งาน${subQuery}`;

      // Duplicate detection
      const duplicateTask = tasks.find(
        (existing) =>
          (matchedId && existing.subjectId === matchedId && existing.title.toLowerCase().includes(title.toLowerCase())) ||
          (existing.dueDate === dueDate && existing.title.toLowerCase() === title.toLowerCase())
      );

      parsedTasks.push({
        tempId: `task_ai_${Date.now()}_${idx}`,
        title,
        subjectQuery: match.matchedSubject?.name || subQuery,
        matchedSubjectId: matchedId,
        dueDate,
        dueTime: t.dueTime || '17:00',
        periodKey: t.periodKey || 'preMidterm',
        maxScore: typeof t.maxScore === 'number' ? t.maxScore : 10,
        notes: t.notes || '',
        status: 'todo',
        isDuplicate: Boolean(duplicateTask),
        duplicateReason: duplicateTask ? `พบงาน "${duplicateTask.title}" ที่มีกำหนดส่งหรือชื่อคล้ายกัน` : undefined,
        included: true,
      });
    });
  }

  // 3. Process Exams
  const parsedExams: AiParsedExam[] = [];
  if (Array.isArray(rawData.exams) && scope !== 'tasks' && scope !== 'profile') {
    rawData.exams.forEach((e: any, idx: number) => {
      const subQuery = e.subjectQuery || e.subject || 'วิชาสอบ';
      const match = matchSubject(subQuery, subjects);

      let matchedId = match.matchedSubject?.id;
      if (!match.isExact && match.ambiguousMatches.length > 1) {
        ambiguities.push({
          id: `amb_exam_${idx}`,
          type: 'subject_choice',
          query: subQuery,
          targetField: `exam_${idx}_subject`,
          message: `วิชาสอบ "${subQuery}" ตรงกับหลายวิชาในระบบ:`,
          options: match.ambiguousMatches.map((s) => ({
            label: `${s.name} (${s.code || '-'})`,
            value: s.id,
          })),
          selectedOption: match.ambiguousMatches[0].id,
          isResolved: false,
        });
        matchedId = match.ambiguousMatches[0].id;
      }

      const examDate = e.examDate || '2026-09-28';

      // Duplicate detection
      const duplicateExam = exams.find(
        (existing) => existing.subjectId === matchedId && existing.examDate === examDate
      );

      parsedExams.push({
        tempId: `exam_ai_${Date.now()}_${idx}`,
        subjectQuery: match.matchedSubject?.name || subQuery,
        matchedSubjectId: matchedId,
        examDate,
        startTime: e.startTime || '09:00',
        endTime: e.endTime || '10:30',
        examType: e.examType === 'final' ? 'final' : 'midterm',
        room: e.room || '',
        maxScore: typeof e.maxScore === 'number' ? e.maxScore : 30,
        topics: Array.isArray(e.topics) && e.topics.length > 0 ? e.topics : ['เนื้อหาตามที่กำหนด'],
        tips: e.tips || '',
        isDuplicate: Boolean(duplicateExam),
        duplicateReason: duplicateExam ? `พบการสอบวิชานี้ในวันที่ ${examDate} อยู่แล้ว` : undefined,
        included: true,
      });
    });
  }

  // 4. Process Subjects
  const parsedSubjects: AiParsedSubject[] = [];
  if (Array.isArray(rawData.subjects)) {
    rawData.subjects.forEach((s: any, idx: number) => {
      parsedSubjects.push({
        tempId: `subj_ai_${Date.now()}_${idx}`,
        name: s.name || 'วิชาใหม่',
        code: s.code || '',
        credits: typeof s.credits === 'number' ? s.credits : 1.5,
        category: s.category || 'ทั่วไป',
        targetGrade: typeof s.targetGrade === 'number' ? s.targetGrade : 4,
        targetScore: typeof s.targetScore === 'number' ? s.targetScore : 80,
        teacherName: s.teacherName || '',
        classroom: s.classroom || '',
        scoreItems: Array.isArray(s.scoreItems) ? s.scoreItems : [],
        included: true,
      });
    });
  }

  // 5. Goals
  const parsedGoals: AiParsedGoal[] = [];
  if (Array.isArray(rawData.goals)) {
    rawData.goals.forEach((g: any, idx: number) => {
      parsedGoals.push({
        tempId: `goal_ai_${Date.now()}_${idx}`,
        title: g.title || 'เป้าหมาย',
        category: g.category || 'academic',
        dueDate: g.dueDate || undefined,
        details: g.details || '',
        included: true,
      });
    });
  }

  // 6. Portfolio
  const parsedPortfolio: AiParsedPortfolio[] = [];
  if (Array.isArray(rawData.portfolio)) {
    rawData.portfolio.forEach((p: any, idx: number) => {
      parsedPortfolio.push({
        tempId: `port_ai_${Date.now()}_${idx}`,
        title: p.title || 'ผลงาน',
        category: p.category || 'certificate',
        date: p.date || '2026-09-21',
        description: p.description || '',
        included: true,
      });
    });
  }

  // 7. Study Plans
  const parsedStudy: AiParsedStudy[] = [];
  if (Array.isArray(rawData.studyPlans)) {
    rawData.studyPlans.forEach((sp: any, idx: number) => {
      const match = matchSubject(sp.subjectQuery || '', subjects);
      parsedStudy.push({
        tempId: `study_ai_${Date.now()}_${idx}`,
        subjectQuery: match.matchedSubject?.name || sp.subjectQuery || 'อ่านหนังสือ',
        matchedSubjectId: match.matchedSubject?.id,
        topic: sp.topic || 'ทบทวนบทเรียน',
        date: sp.date || '2026-09-21',
        durationMinutes: typeof sp.durationMinutes === 'number' ? sp.durationMinutes : 60,
        notes: sp.notes || '',
        included: true,
      });
    });
  }

  return {
    success: true,
    summary: rawData.summary || '✨ AI วิเคราะห์และจัดหมวดหมู่ข้อมูลสำเร็จ',
    profile,
    tasks: parsedTasks,
    exams: parsedExams,
    subjects: parsedSubjects,
    goals: parsedGoals,
    portfolio: parsedPortfolio,
    studyPlans: parsedStudy,
    ambiguities,
    conflicts,
    warnings,
  };
}
