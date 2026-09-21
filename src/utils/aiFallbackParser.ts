import {
  Subject,
  Task,
  Exam,
  UserProfile,
  NumericGrade,
  ScorePeriodKey,
  FutureChecklistCategory,
  PortfolioCategory,
} from '../types';
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

// Current reference year: 2026 (BE 2569)
const CURRENT_YEAR = 2026;
const THAI_YEAR = 2569;

// Thai month names mapping
const THAI_MONTHS: Record<string, number> = {
  'มกราคม': 1, 'ม.ค.': 1, 'มกรา': 1,
  'กุมภาพันธ์': 2, 'ก.พ.': 2, 'กุมภา': 2,
  'มีนาคม': 3, 'มี.ค.': 3, 'มีนา': 3,
  'เมษายน': 4, 'เม.ย.': 4, 'เมษา': 4,
  'พฤษภาคม': 5, 'พ.ค.': 5, 'พฤษภา': 5,
  'มิถุนายน': 6, 'มิ.ย.': 6, 'มิถุนา': 6,
  'กรกฎาคม': 7, 'ก.ค.': 7, 'กรกฎา': 7,
  'สิงหาคม': 8, 'ส.ค.': 8, 'สิงหา': 8,
  'กันยายน': 9, 'ก.ย.': 9, 'กันยา': 9,
  'ตุลาคม': 10, 'ต.ค.': 10, 'ตุลา': 10,
  'พฤศจิกายน': 11, 'พ.ย.': 11, 'พฤศจิกา': 11,
  'ธันวาคม': 12, 'ธ.ค.': 12, 'ธันวา': 12,
};

/**
 * Parses Thai date string to YYYY-MM-DD
 */
export function parseThaiDate(text: string): { date: string; isYearAssumed: boolean } | null {
  if (!text) return null;
  const clean = text.trim();

  // Pattern: 28 ก.ย. 2569 or 28 กันยายน 2569 or 28/09/2569 or 28-09-2026
  const slashMatch = clean.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    let rawYear = slashMatch[3] ? parseInt(slashMatch[3], 10) : THAI_YEAR;
    let isYearAssumed = !slashMatch[3];
    if (rawYear > 2500) rawYear = rawYear - 543; // BE to CE
    if (rawYear < 100) rawYear = 2000 + rawYear;
    const yStr = rawYear.toString();
    const mStr = month.toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    return { date: `${yStr}-${mStr}-${dStr}`, isYearAssumed };
  }

  // Thai month names
  for (const [mName, mNum] of Object.entries(THAI_MONTHS)) {
    const escaped = mName.replace('.', '\\.');
    const regex = new RegExp(`(\\d{1,2})\\s*(?:วัน(?:ที่)?)?\\s*${escaped}(?:\\s*(\\d{2,4}))?`, 'i');
    const m = clean.match(regex);
    if (m) {
      const day = parseInt(m[1], 10);
      let rawYear = m[2] ? parseInt(m[2], 10) : THAI_YEAR;
      const isYearAssumed = !m[2];
      if (rawYear > 2500) rawYear = rawYear - 543;
      if (rawYear < 100) rawYear = 2000 + rawYear;
      const yStr = rawYear.toString();
      const mStr = mNum.toString().padStart(2, '0');
      const dStr = day.toString().padStart(2, '0');
      return { date: `${yStr}-${mStr}-${dStr}`, isYearAssumed };
    }
  }

  // Relative dates
  const today = new Date('2026-09-21');
  if (clean.includes('พรุ่งนี้')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { date: tomorrow.toISOString().slice(0, 10), isYearAssumed: false };
  }
  if (clean.includes('วันนี้')) {
    return { date: today.toISOString().slice(0, 10), isYearAssumed: false };
  }
  if (clean.includes('มะรืน')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    return { date: dayAfter.toISOString().slice(0, 10), isYearAssumed: false };
  }

  return null;
}

/**
 * Extracts time in HH:mm format (e.g. 09:00, 9 โมง, 13:30 น.)
 */
export function parseThaiTime(text: string): string | null {
  if (!text) return null;

  // 09:00 or 13:30
  const colonMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10).toString().padStart(2, '0');
    const m = colonMatch[2];
    return `${h}:${m}`;
  }

  // 9 โมง / 9 โมงเช้า / บ่าย 1 โมง
  const mongMatch = text.match(/(\d{1,2})\s*(?:โมง|น\.|นาฬิกา)/);
  if (mongMatch) {
    let h = parseInt(mongMatch[1], 10);
    if (text.includes('บ่าย') && h <= 6) h += 12;
    return `${h.toString().padStart(2, '0')}:00`;
  }

  return null;
}

/**
 * Fuzzy matches subject query with current subjects in context
 */
export function matchSubject(
  query: string,
  existingSubjects: Subject[]
): {
  matchedSubject?: Subject;
  ambiguousMatches: Subject[];
  isExact: boolean;
} {
  if (!query || existingSubjects.length === 0) {
    return { ambiguousMatches: [], isExact: false };
  }

  const cleanQuery = query.toLowerCase().replace(/[\s\-_]/g, '');

  // 1. Exact Name or Code match
  const exact = existingSubjects.find(
    (s) =>
      s.name.toLowerCase().replace(/[\s\-_]/g, '') === cleanQuery ||
      (s.code && s.code.toLowerCase().replace(/[\s\-_]/g, '') === cleanQuery)
  );
  if (exact) {
    return { matchedSubject: exact, ambiguousMatches: [exact], isExact: true };
  }

  // 2. Starts with / includes
  const matches = existingSubjects.filter((s) => {
    const sName = s.name.toLowerCase().replace(/[\s\-_]/g, '');
    return sName.includes(cleanQuery) || cleanQuery.includes(sName);
  });

  if (matches.length === 1) {
    return { matchedSubject: matches[0], ambiguousMatches: matches, isExact: false };
  } else if (matches.length > 1) {
    return { ambiguousMatches: matches, isExact: false };
  }

  // 3. Keyword heuristic (e.g. คณิต -> คณิตศาสตร์, อังกฤษ -> ภาษาอังกฤษ, วิทย์ -> วิทยาศาสตร์)
  const keywordsMap: Record<string, string[]> = {
    คณิต: ['คณิตศาสตร์', 'คณิต'],
    อังกฤษ: ['ภาษาอังกฤษ', 'อังกฤษ', 'english'],
    ไทย: ['ภาษาไทย', 'วรรณคดี'],
    วิทย์: ['วิทยาศาสตร์', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา'],
    ชีวะ: ['ชีววิทยา', 'ชีว'],
    เคมี: ['เคมี'],
    ฟิสิกส์: ['ฟิสิกส์'],
    สังคม: ['สังคมศึกษา', 'สังคม', 'ประวัติศาสตร์'],
    คอม: ['คอมพิวเตอร์', 'วิทยาการคำนวณ', 'เทคโนโลยี'],
    ศิลปะ: ['ศิลปะ', 'ทัศนศิลป์'],
    สุขศึกษา: ['สุขศึกษา', 'พลศึกษา'],
  };

  for (const [kw, terms] of Object.entries(keywordsMap)) {
    if (cleanQuery.includes(kw)) {
      const candidates = existingSubjects.filter((s) =>
        terms.some((t) => s.name.toLowerCase().includes(t))
      );
      if (candidates.length === 1) {
        return { matchedSubject: candidates[0], ambiguousMatches: candidates, isExact: false };
      } else if (candidates.length > 1) {
        return { ambiguousMatches: candidates, isExact: false };
      }
    }
  }

  return { ambiguousMatches: [], isExact: false };
}

/**
 * Intelligent client/offline fallback parser for Thai student context
 */
export function parseWithRuleEngine(
  text: string,
  existingSubjects: Subject[],
  currentUserProfile: UserProfile,
  existingTasks: Task[],
  existingExams: Exam[],
  scope: AiQuickFillScope = 'all'
): AiParseResponse {
  const warnings: string[] = [];
  const ambiguities: AiAmbiguityItem[] = [];
  const conflicts: AiConflictItem[] = [];

  let profile: AiParsedProfile | undefined = undefined;
  const tasks: AiParsedTask[] = [];
  const exams: AiParsedExam[] = [];
  const subjects: AiParsedSubject[] = [];
  const goals: AiParsedGoal[] = [];
  const portfolio: AiParsedPortfolio[] = [];
  const studyPlans: AiParsedStudy[] = [];

  const lines = text
    .split(/\r?\n|;|\./)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Profile Extraction (if scope is 'all' or 'profile')
  if (scope === 'all' || scope === 'profile') {
    const pData: AiParsedProfile = {};
    let hasProfileData = false;

    // Full Name
    const nameMatch = text.match(/(?:ชื่อ|เราชื่อ|นาย|นางสาว|ด\.ช\.|ด\.ญ\.)\s*([ก-๙a-zA-Z]+(?:\s+[ก-๙a-zA-Z]+)+)/);
    if (nameMatch) {
      pData.fullName = nameMatch[1].trim();
      hasProfileData = true;
    }

    // Grade Level & Room: e.g. ม.4/2, ม. 5 ห้อง 1, ม.6/3
    const classRoomMatch = text.match(/ม\.\s*(\d)\s*(?:\/|ห้อง\s*)(\d+)/i);
    if (classRoomMatch) {
      pData.gradeLevel = `ม.${classRoomMatch[1]}`;
      pData.room = classRoomMatch[2];
      hasProfileData = true;
    } else {
      const gradeOnly = text.match(/ม\.\s*(\d)/i);
      if (gradeOnly) {
        pData.gradeLevel = `ม.${gradeOnly[1]}`;
        hasProfileData = true;
      }
      const roomOnly = text.match(/ห้อง\s*(\d+)/);
      if (roomOnly) {
        pData.room = roomOnly[1];
        hasProfileData = true;
      }
    }

    // Student Number: e.g. เลขที่ 23
    const noMatch = text.match(/เลขที่\s*(\d+)/);
    if (noMatch) {
      pData.studentNumber = noMatch[1];
      hasProfileData = true;
    }

    // School: e.g. โรงเรียนพิชัย, รร.สวนกุหลาบ
    const schoolMatch = text.match(/(?:โรงเรียน|รร\.)\s*([ก-๙a-zA-Z0-9\s]+?)(?=\s|$|,|\n)/);
    if (schoolMatch) {
      pData.schoolName = schoolMatch[1].trim();
      hasProfileData = true;
    }

    // Target GPA: e.g. เป้าหมายเกรด 3.8, เกรดเป้าหมาย 4.0, อยากได้เกรด 3.5
    const gpaMatch = text.match(/(?:เป้าหมายเกรด|เกรดเป้าหมาย|เป้าเกรด|เกรด|gpa)\s*[:=]?\s*([0-4](?:\.[0-9]+)?)/i);
    if (gpaMatch) {
      const numGpa = parseFloat(gpaMatch[1]);
      if (numGpa >= 0 && numGpa <= 4) {
        // Find closest valid NumericGrade
        const validGrades: NumericGrade[] = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0];
        const closest = validGrades.reduce((prev, curr) =>
          Math.abs(curr - numGpa) < Math.abs(prev - numGpa) ? curr : prev
        );
        pData.targetGpa = closest;
        hasProfileData = true;

        // Check conflict with existing Target GPA
        if (currentUserProfile.targetGpa && currentUserProfile.targetGpa !== closest) {
          conflicts.push({
            id: 'conflict_gpa',
            field: 'targetGpa',
            label: 'เกรดเป้าหมาย',
            oldValue: currentUserProfile.targetGpa,
            newValue: closest,
            action: 'use_new',
          });
        }
      }
    }

    // Dream Faculty & Career
    const facultyMatch = text.match(/(?:คณะ|อยากเข้าคณะ|สาขา)\s*([ก-๙a-zA-Z]+)/);
    if (facultyMatch) {
      pData.dreamFaculty = facultyMatch[1].trim();
      hasProfileData = true;
    }

    const careerMatch = text.match(/(?:อาชีพ|อยากเป็น|โตขึ้นเป็น)\s*([ก-๙a-zA-Z]+)/);
    if (careerMatch) {
      pData.dreamCareer = careerMatch[1].trim();
      hasProfileData = true;
    } else if (pData.dreamFaculty && !pData.dreamCareer) {
      pData.dreamCareer = pData.dreamFaculty;
    }

    // Dream University
    const uniMatch = text.match(/(?:มหาวิทยาลัย|มหาลัย|ม\.)\s*([ก-๙a-zA-Z]+)/);
    if (uniMatch && !uniMatch[0].match(/ม\.\s*\d/)) {
      pData.dreamUniversity = uniMatch[1].trim();
      hasProfileData = true;
    }

    if (hasProfileData) {
      profile = pData;
    }
  }

  // 2. Extract Tasks and Exams from text chunks
  // Split into clauses or analyze lines
  const clauses = text
    .split(/\n|แล้วก็|และยังมี|กับมี|รวมทั้ง|และมี|มี|ต้อง/)
    .map((c) => c.trim())
    .filter(Boolean);

  let taskCounter = 1;
  let examCounter = 1;

  for (const clause of clauses) {
    const isExamClause =
      scope === 'exams' ||
      (scope !== 'tasks' &&
        /(?:สอบ|ตารางสอบ|ไฟนอล|มิดเทอม|exam|midterm|final)/i.test(clause) &&
        !/ส่งงาน|การบ้าน|รายงาน/.test(clause));

    const isTaskClause =
      scope === 'tasks' ||
      (scope !== 'exams' &&
        /(?:ส่งงาน|มีงาน|การบ้าน|ใบงาน|รายงาน|โครงงาน|ส่งวันที่|task|assignment)/i.test(clause) &&
        !isExamClause);

    // Date & Time extraction
    const dateResult = parseThaiDate(clause);
    const parsedTime = parseThaiTime(clause);

    // Subject extraction
    let foundSubjectQuery = '';
    const subjectKeywords = [
      'คณิตศาสตร์เพิ่มเติม', 'คณิตศาสตร์พื้นฐาน', 'คณิตศาสตร์', 'คณิต',
      'ภาษาอังกฤษ', 'อังกฤษ', 'english',
      'วิทยาศาสตร์', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'ชีวะ', 'วิทย์',
      'ภาษาไทย', 'วรรณคดี', 'ไทย',
      'สังคมศึกษา', 'สังคม', 'ประวัติศาสตร์',
      'คอมพิวเตอร์', 'วิทยาการคำนวณ', 'การงานอาชีพ', 'การงาน',
      'ศิลปะ', 'ดนตรี', 'สุขศึกษา', 'พละ',
    ];

    for (const kw of subjectKeywords) {
      if (clause.includes(kw)) {
        foundSubjectQuery = kw;
        break;
      }
    }

    // Match with user's existing subjects
    const matchResult = matchSubject(foundSubjectQuery, existingSubjects);
    let matchedId = matchResult.matchedSubject?.id;

    if (foundSubjectQuery && !matchResult.isExact && matchResult.ambiguousMatches.length > 1) {
      // Ambiguity found!
      const ambiguityId = `amb_subj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      ambiguities.push({
        id: ambiguityId,
        type: 'subject_choice',
        query: foundSubjectQuery,
        targetField: isExamClause ? 'exam_subject' : 'task_subject',
        message: `AI ตรวจพบวิชา "${foundSubjectQuery}" ซึ่งตรงกับหลายวิชาในระบบ กรุณาเลือกวิชาที่ต้องการ:`,
        options: matchResult.ambiguousMatches.map((s) => ({
          label: `${s.name} (${s.code || 'ไม่มีรหัส'})`,
          value: s.id,
        })),
        selectedOption: matchResult.ambiguousMatches[0].id,
        isResolved: false,
      });
      matchedId = matchResult.ambiguousMatches[0].id;
    }

    if (dateResult?.isYearAssumed) {
      warnings.push(`กำหนดวันที่ "${clause.slice(0, 30)}..." เป็นปี พ.ศ. ${THAI_YEAR} (${CURRENT_YEAR}) อัตโนมัติ`);
    }

    // Process EXAM
    if (isExamClause && (dateResult || foundSubjectQuery)) {
      const examDate = dateResult ? dateResult.date : '2026-09-28';
      const startTime = parsedTime || '09:00';
      const subName = matchResult.matchedSubject?.name || foundSubjectQuery || 'วิชาสอบ';

      // Extract topics if mentioned
      const topics: string[] = [];
      const topicMatch = clause.match(/(?:หัวข้อ(?:สอบ)?|เรื่อง|เนื้อหา)\s*([ก-๙a-zA-Z0-9\s,\-\(\)]+)/i);
      if (topicMatch) {
        topics.push(topicMatch[1].trim());
      }

      // Check duplicate
      const duplicateExam = existingExams.find(
        (e) => e.subjectId === matchedId && e.examDate === examDate
      );

      exams.push({
        tempId: `exam_${Date.now()}_${examCounter++}`,
        subjectQuery: subName,
        matchedSubjectId: matchedId,
        examDate,
        startTime,
        endTime: '10:30',
        examType: /ปลายภาค|final/i.test(clause) ? 'final' : 'midterm',
        room: '',
        topics: topics.length > 0 ? topics : ['เนื้อหาตามที่ครูผู้สอนกำหนด'],
        isDuplicate: Boolean(duplicateExam),
        duplicateReason: duplicateExam ? `พบการสอบวิชานี้ในวันที่ ${examDate} อยู่แล้ว` : undefined,
        included: true,
      });
    }

    // Process TASK
    else if (isTaskClause && (dateResult || foundSubjectQuery)) {
      const dueDate = dateResult ? dateResult.date : '2026-09-25';
      const dueTime = parsedTime || '17:00';
      const subName = matchResult.matchedSubject?.name || foundSubjectQuery || 'งานทั่วไป';

      // Title extraction
      let title = `งาน${subName}`;
      const titleMatch = clause.match(/(?:งาน|ใบงาน|การบ้าน|รายงาน|โครงงาน)\s*([ก-๙a-zA-Z0-9\s]+?)(?=\s*ส่ง|\s*วัน|\s*$)/);
      if (titleMatch) {
        title = titleMatch[0].trim();
      }

      // Check duplicate
      const duplicateTask = existingTasks.find(
        (t) => t.subjectId === matchedId && (t.title.includes(title) || t.dueDate === dueDate)
      );

      tasks.push({
        tempId: `task_${Date.now()}_${taskCounter++}`,
        title,
        subjectQuery: subName,
        matchedSubjectId: matchedId,
        dueDate,
        dueTime,
        periodKey: 'preMidterm',
        maxScore: 10,
        notes: clause.length > 50 ? clause : undefined,
        status: 'todo',
        isDuplicate: Boolean(duplicateTask),
        duplicateReason: duplicateTask ? `พบงานที่ชื่อหรือกำหนดส่งคล้ายกัน (${duplicateTask.title})` : undefined,
        included: true,
      });
    }

    // Process Study Plan: e.g. อ่านหนังสือชีววิทยาวันเสาร์ 1 ชั่วโมง
    else if (scope === 'study' || /อ่านหนังสือ|ทบทวน|study|ติว/i.test(clause)) {
      const studyDate = dateResult ? dateResult.date : '2026-09-26';
      const durationMatch = clause.match(/(\d+)\s*(?:ชั่วโมง|ชม\.|นาที)/);
      let durationMinutes = 60;
      if (durationMatch) {
        const val = parseInt(durationMatch[1], 10);
        durationMinutes = clause.includes('นาที') ? val : val * 60;
      }

      studyPlans.push({
        tempId: `study_${Date.now()}_${studyPlans.length + 1}`,
        subjectQuery: matchResult.matchedSubject?.name || foundSubjectQuery || 'อ่านหนังสือ',
        matchedSubjectId: matchedId,
        topic: clause.replace(/อ่านหนังสือ|ทบทวน|ติว/g, '').trim() || 'ทบทวนบทเรียน',
        date: studyDate,
        durationMinutes,
        included: true,
      });
    }
  }

  // 3. Extract Goals if mentioned
  if (scope === 'all' || scope === 'goals') {
    const goalMatches = text.match(/(?:เป้าหมาย|ตั้งเป้า|goal)\s*[:=]?\s*([ก-๙a-zA-Z0-9\s\.\/]+)/g);
    if (goalMatches) {
      for (const gm of goalMatches) {
        const cleanGoal = gm.replace(/(?:เป้าหมาย|ตั้งเป้า|goal)\s*[:=]?\s*/i, '').trim();
        if (cleanGoal && !cleanGoal.startsWith('เกรด')) {
          goals.push({
            tempId: `goal_${Date.now()}_${goals.length + 1}`,
            title: cleanGoal,
            category: 'academic',
            dueDate: '2026-10-30',
            included: true,
          });
        }
      }
    }
  }

  // Summary generation
  const summaryParts: string[] = [];
  if (profile) summaryParts.push('ข้อมูลส่วนตัว & เป้าหมาย');
  if (tasks.length > 0) summaryParts.push(`งาน ${tasks.length} รายการ`);
  if (exams.length > 0) summaryParts.push(`ตารางสอบ ${exams.length} รายการ`);
  if (subjects.length > 0) summaryParts.push(`วิชาใหม่ ${subjects.length} วิชา`);
  if (goals.length > 0) summaryParts.push(`เป้าหมาย ${goals.length} รายการ`);
  if (studyPlans.length > 0) summaryParts.push(`แผนอ่านหนังสือ ${studyPlans.length} รายการ`);

  const summary = summaryParts.length > 0
    ? `✨ AI จัดหมวดหมู่ข้อมูลสำเร็จ: ${summaryParts.join(', ')}`
    : '✨ AI วิเคราะห์ข้อความแล้ว แต่ยังไม่พบข้อมูลที่ตรงกับหมวดหมู่อย่างชัดเจน กรุณาตรวจสอบหรือเพิ่มข้อมูลเพิ่มเติม';

  return {
    success: true,
    summary,
    profile,
    tasks,
    exams,
    subjects,
    goals,
    portfolio,
    studyPlans,
    ambiguities,
    conflicts,
    warnings,
  };
}
