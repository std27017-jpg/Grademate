import {
  Subject,
  SubjectScoreSummary,
  SemesterSummary,
  ScorePeriodKey,
  SemesterId,
  NumericGrade,
  CustomGradeScale,
} from '../types';

export const NUMERIC_GRADES: NumericGrade[] = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0];

export const DEFAULT_GRADE_THRESHOLDS: CustomGradeScale = {
  4: 80,
  3.5: 75,
  3: 70,
  2.5: 65,
  2: 60,
  1.5: 55,
  1: 50,
  0: 0,
};

export interface GradeMetaInfo {
  grade: NumericGrade;
  defaultMin: number;
  label: string;
  badgeClass: string;
  textColor: string;
}

export const GRADE_META_LIST: GradeMetaInfo[] = [
  { grade: 4, defaultMin: 80, label: 'เกรด 4', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', textColor: 'text-emerald-600' },
  { grade: 3.5, defaultMin: 75, label: 'เกรด 3.5', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200', textColor: 'text-teal-600' },
  { grade: 3, defaultMin: 70, label: 'เกรด 3', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', textColor: 'text-blue-600' },
  { grade: 2.5, defaultMin: 65, label: 'เกรด 2.5', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200', textColor: 'text-sky-600' },
  { grade: 2, defaultMin: 60, label: 'เกรด 2', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', textColor: 'text-amber-600' },
  { grade: 1.5, defaultMin: 55, label: 'เกรด 1.5', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200', textColor: 'text-orange-600' },
  { grade: 1, defaultMin: 50, label: 'เกรด 1', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', textColor: 'text-rose-600' },
  { grade: 0, defaultMin: 0, label: 'เกรด 0', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', textColor: 'text-rose-700' },
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

export function scoreToGrade(
  score: number,
  thresholds: CustomGradeScale = DEFAULT_GRADE_THRESHOLDS
): { grade: NumericGrade; letter: string; label: string } {
  // Sort descending by min score
  for (const grade of NUMERIC_GRADES) {
    const min = thresholds[grade] ?? 0;
    if (score >= min) {
      return {
        grade,
        letter: grade.toString(),
        label: `เกรด ${grade}`,
      };
    }
  }

  return {
    grade: 0,
    letter: '0',
    label: 'เกรด 0',
  };
}

export function gradeToMinScore(
  grade: NumericGrade,
  thresholds: CustomGradeScale = DEFAULT_GRADE_THRESHOLDS
): number {
  return thresholds[grade] ?? 0;
}

export function calculateSubjectSummary(
  subject: Subject,
  thresholds: CustomGradeScale = DEFAULT_GRADE_THRESHOLDS
): SubjectScoreSummary {
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

  // Calculate remaining score based on standard 100 points scale
  const baselineTotal = totalWeight > 0 ? totalWeight : 100;
  const remainingPoints = Math.max(0, baselineTotal - totalMaxRecorded);
  const maxPossibleTotal = totalEarned + remainingPoints;

  const currentPercentage = totalMaxRecorded > 0 ? (totalEarned / totalMaxRecorded) * 100 : 0;
  
  // Estimated final score normalized to baseline
  const projectedFinalScore = totalMaxRecorded > 0 ? (totalEarned / totalMaxRecorded) * baselineTotal : 0;
  const { grade: estimatedGrade, letter: estimatedGradeLetter } = scoreToGrade(projectedFinalScore, thresholds);

  const targetScore = subject.targetScore || gradeToMinScore(subject.targetGrade, thresholds);
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
  subjects: Subject[],
  thresholds: CustomGradeScale = DEFAULT_GRADE_THRESHOLDS
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

  const subjectSummaries = semesterSubjects.map((s) => calculateSubjectSummary(s, thresholds));

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
  const focusAdvice = subjectSummaries
    .map((sum) => {
      const targetScore = sum.subject.targetScore || gradeToMinScore(sum.subject.targetGrade, thresholds);
      const gap = Math.max(0, targetScore - sum.earnedScore);
      const targetGradeStr = `เกรด ${sum.subject.targetGrade}`;
      
      let priority = 1;
      let message = '';

      if (sum.targetAchieved) {
        priority = 4;
        message = `คะแนนทะลุเป้าหมาย${targetGradeStr} เรียบร้อยแล้ว ยอดเยี่ยมมาก!`;
      } else if (!sum.canStillAchieveTarget) {
        priority = 3;
        message = `คะแนนสูงสุดที่เป็นไปได้คือ ${sum.maxPossibleTotal} คะแนน ไม่ถึงเป้า${targetGradeStr} (${targetScore} คะแนน) แนะนำปรับเป้าหมายรองรับเกรดสูงสุดที่เป็นไปได้`;
      } else {
        // Still can achieve
        priority = sum.currentPercentage < 70 ? 1 : 2;
        message = `ควรโฟกัสเป็นอันดับ ${priority === 1 ? '1' : 'สำคัญ'} เพราะคะแนนปัจจุบัน (${sum.earnedScore}/${sum.totalMaxScoreRecorded}) ยังห่างจากเป้าหมาย${targetGradeStr} อยู่ ${gap} คะแนน และยังมีคะแนนส่วนที่เหลือให้เก็บอีก ${sum.remainingPoints} คะแนน`;
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
