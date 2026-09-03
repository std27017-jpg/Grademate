import {
  Subject,
  SubjectScoreSummary,
  SemesterSummary,
  ScorePeriodKey,
  SemesterId,
} from '../types';

export const GRADE_SCALE = [
  { min: 80, grade: 4.0, letter: 'A', label: 'เกรด 4 (A)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { min: 75, grade: 3.5, letter: 'B+', label: 'เกรด 3.5 (B+)', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { min: 70, grade: 3.0, letter: 'B', label: 'เกรด 3 (B)', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { min: 65, grade: 2.5, letter: 'C+', label: 'เกรด 2.5 (C+)', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { min: 60, grade: 2.0, letter: 'C', label: 'เกรด 2 (C)', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { min: 55, grade: 1.5, letter: 'D+', label: 'เกรด 1.5 (D+)', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { min: 50, grade: 1.0, letter: 'D', label: 'เกรด 1 (D)', color: 'text-rose-500 bg-rose-50 border-rose-200' },
  { min: 0, grade: 0.0, letter: 'F', label: 'เกรด 0 (F)', color: 'text-rose-700 bg-rose-100 border-rose-300' },
];

export const PERIOD_CONFIG: Record<
  ScorePeriodKey,
  { label: string; shortLabel: string; defaultWeight: number }
> = {
  preMidterm: {
    label: 'คะแนนเก็บก่อนกลางภาค',
    shortLabel: 'ก่อนกลางภาค (เก็บ 30)',
    defaultWeight: 30,
  },
  midterm: {
    label: 'คะแนนสอบกลางภาค',
    shortLabel: 'สอบกลางภาค (20)',
    defaultWeight: 20,
  },
  postMidterm: {
    label: 'คะแนนเก็บหลังกลางภาค',
    shortLabel: 'หลังกลางภาค (เก็บ 30)',
    defaultWeight: 30,
  },
  final: {
    label: 'คะแนนสอบปลายภาค',
    shortLabel: 'สอบปลายภาค (20)',
    defaultWeight: 20,
  },
};

export function scoreToGrade(score: number): { grade: number; letter: string } {
  for (const item of GRADE_SCALE) {
    if (score >= item.min) {
      return { grade: item.grade, letter: item.letter };
    }
  }
  return { grade: 0.0, letter: 'F' };
}

export function gradeToMinScore(grade: number): number {
  const match = GRADE_SCALE.find((item) => item.grade === grade);
  return match ? match.min : 80;
}

export function calculateSubjectSummary(subject: Subject): SubjectScoreSummary {
  const periodKeys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];
  
  let totalEarned = 0;
  let totalMaxRecorded = 0;
  let totalWeight = 0;

  const breakdowns = periodKeys.map((key) => {
    const period = subject.periods[key] || {
      key,
      label: PERIOD_CONFIG[key].label,
      shortLabel: PERIOD_CONFIG[key].shortLabel,
      weight: PERIOD_CONFIG[key].defaultWeight,
      items: [],
    };

    totalWeight += period.weight;

    let periodEarned = 0;
    let periodMax = 0;

    if (period.items && period.items.length > 0) {
      for (const item of period.items) {
        periodEarned += Number(item.score) || 0;
        periodMax += Number(item.maxScore) || 0;
      }
    }

    totalEarned += periodEarned;
    totalMaxRecorded += periodMax;

    const hasData = period.items && period.items.length > 0;
    const percentage = hasData && periodMax > 0 ? (periodEarned / periodMax) * 100 : null;

    return {
      key,
      label: period.label || PERIOD_CONFIG[key].label,
      shortLabel: period.shortLabel || PERIOD_CONFIG[key].shortLabel,
      earned: periodEarned,
      max: periodMax,
      percentage,
      hasData,
    };
  });

  // Calculate remaining score based on standard 100 points scale (or sum of period weights)
  // Standard course scale is 100 points. If totalMaxRecorded < 100, remaining = 100 - totalMaxRecorded.
  const baselineTotal = totalWeight > 0 ? totalWeight : 100;
  const remainingPoints = Math.max(0, baselineTotal - totalMaxRecorded);
  const maxPossibleTotal = totalEarned + remainingPoints;

  const currentPercentage = totalMaxRecorded > 0 ? (totalEarned / totalMaxRecorded) * 100 : 0;
  
  // Estimated final grade based on projected current score + average performance, or raw normalized
  const projectedFinalScore = totalMaxRecorded > 0 ? (totalEarned / totalMaxRecorded) * baselineTotal : 0;
  const { grade: estimatedGrade, letter: estimatedGradeLetter } = scoreToGrade(projectedFinalScore);

  const targetScore = subject.targetScore || gradeToMinScore(subject.targetGrade || 4.0);
  const targetAchieved = totalEarned >= targetScore;
  const canStillAchieveTarget = maxPossibleTotal >= targetScore;
  const pointsNeededForTarget = Math.max(0, targetScore - totalEarned);

  return {
    subject,
    earnedScore: totalEarned,
    totalMaxScoreRecorded: totalMaxRecorded,
    totalAllocatedWeight: baselineTotal,
    currentPercentage,
    remainingPoints,
    maxPossibleTotal,
    estimatedGrade,
    estimatedGradeLetter,
    targetAchieved,
    canStillAchieveTarget,
    pointsNeededForTarget,
    periodBreakdowns: breakdowns,
  };
}

export function calculateSemesterSummary(
  semesterId: SemesterId,
  subjects: Subject[]
): SemesterSummary {
  const semesterSubjects = subjects.filter((s) => s.semesterId === semesterId);
  const semesterName = semesterId === 'term1' ? 'เทอม 1' : 'เทอม 2';

  if (semesterSubjects.length === 0) {
    return {
      semesterId,
      semesterName,
      totalCredits: 0,
      gpa: 0,
      totalEarnedScore: 0,
      totalMaxPossibleScore: 0,
      overallPercentage: 0,
      bestSubject: null,
      needsImprovementSubject: null,
      subjectSummaries: [],
      focusAdvice: [],
    };
  }

  const subjectSummaries = semesterSubjects.map(calculateSubjectSummary);

  let totalCreditPoints = 0;
  let totalCredits = 0;
  let totalEarned = 0;
  let totalMax = 0;

  subjectSummaries.forEach((sum) => {
    const credits = sum.subject.credits || 1.0;
    totalCredits += credits;
    totalCreditPoints += sum.estimatedGrade * credits;
    totalEarned += sum.earnedScore;
    totalMax += sum.totalMaxScoreRecorded;
  });

  const gpa = totalCredits > 0 ? totalCreditPoints / totalCredits : 0;
  const overallPercentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

  // Best subject (highest current percentage)
  const sortedByScore = [...subjectSummaries].sort(
    (a, b) => b.currentPercentage - a.currentPercentage
  );
  const bestSubject = sortedByScore[0]?.subject || null;

  // Needs improvement (lowest percentage or furthest from target)
  const sortedByNeed = [...subjectSummaries].sort(
    (a, b) => a.currentPercentage - b.currentPercentage
  );
  const needsImprovementSubject = sortedByNeed[0]?.subject || null;

  // Focus advice algorithm
  // Priority rule: Subjects furthest from target score where target is still possible have highest priority
  const focusAdvice = subjectSummaries
    .map((sum) => {
      const targetScore = sum.subject.targetScore || 80;
      const gap = Math.max(0, targetScore - sum.earnedScore);
      const targetLetter = sum.subject.targetGrade >= 4 ? 'A' : sum.subject.targetGrade >= 3.5 ? 'B+' : 'B';
      
      let priority = 1;
      let message = '';

      if (sum.targetAchieved) {
        priority = 4;
        message = `คะแนนทะลุเป้าหมายเกรด ${targetLetter} เรียบร้อยแล้ว ยอดเยี่ยมมาก!`;
      } else if (!sum.canStillAchieveTarget) {
        priority = 3;
        message = `คะแนนสูงสุดที่เป็นไปได้คือ ${sum.maxPossibleTotal} คะแนน ไม่ถึงเป้า ${targetScore} (${targetLetter}) แนะนำปรับเป้าหมายรองรับเกรดสูงสุดที่เป็นไปได้`;
      } else {
        // Still can achieve
        priority = sum.currentPercentage < 70 ? 1 : 2;
        message = `ควรโฟกัสเป็นอันดับ ${priority === 1 ? '1' : 'สำคัญ'} เพราะคะแนนปัจจุบัน (${sum.earnedScore}/${sum.totalMaxScoreRecorded}) ยังห่างจากเป้าหมาย ${targetLetter} อยู่ ${gap} คะแนน และยังมีคะแนนส่วนที่เหลือให้เก็บอีก ${sum.remainingPoints} คะแนน`;
      }

      return {
        subject: sum.subject,
        priority,
        message,
        remainingPoints: sum.remainingPoints,
        gapToTarget: gap,
      };
    })
    .sort((a, b) => a.priority - b.priority || b.gapToTarget - a.gapToTarget);

  return {
    semesterId,
    semesterName,
    totalCredits,
    gpa: Number(gpa.toFixed(2)),
    totalEarnedScore: totalEarned,
    totalMaxPossibleScore: totalMax,
    overallPercentage: Number(overallPercentage.toFixed(1)),
    bestSubject,
    needsImprovementSubject,
    subjectSummaries,
    focusAdvice,
  };
}

export function getDaysRemaining(targetDate: string): number {
  if (!targetDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatThaiDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiYear = year > 2500 ? year : year + 543;
  return `${day} ${thaiMonths[month - 1]} ${thaiYear}`;
}

export function formatShortThaiDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${day} ${thaiShortMonths[month - 1]}`;
}
