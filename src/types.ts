export type SemesterId = 'term1' | 'term2';

export type ScorePeriodKey = 'preMidterm' | 'midterm' | 'postMidterm' | 'final';

export interface ScoreItem {
  id: string;
  title: string; // e.g. 'การบ้าน', 'แบบฝึกหัด', 'สอบย่อย'
  score: number; // e.g. 8
  maxScore: number; // e.g. 10
  date?: string;
  notes?: string;
}

export interface ScorePeriod {
  key: ScorePeriodKey;
  label: string; // 'คะแนนเก็บก่อนกลางภาค' | 'คะแนนสอบกลางภาค' | 'คะแนนเก็บหลังกลางภาค' | 'คะแนนสอบปลายภาค'
  shortLabel: string; // 'ก่อนกลางภาค' | 'กลางภาค' | 'หลังกลางภาค' | 'ปลายภาค'
  weight: number; // Max total allocation for this period (e.g. 30, 20, 20, 30)
  items: ScoreItem[];
  isCompleted?: boolean; // If exam/period is finished
}

export interface Subject {
  id: string;
  semesterId: SemesterId;
  name: string; // e.g. 'คณิตศาสตร์'
  code: string; // e.g. 'ค31101'
  credits: number; // e.g. 1.5
  color: string; // e.g. 'indigo', 'rose', 'emerald', 'amber', 'sky', 'violet'
  icon: string; // Lucide icon name
  targetGrade: number; // e.g. 4.0, 3.5, 3.0, 2.5, 2.0
  targetScore: number; // e.g. 80 (Grade 4 / A)
  teacherName?: string;
  classroom?: string;
  periods: Record<ScorePeriodKey, ScorePeriod>;
}

export type TaskStatus = 'todo' | 'in_progress' | 'submitted' | 'graded';

export interface Task {
  id: string;
  semesterId: SemesterId;
  subjectId: string;
  title: string; // e.g. 'ใบงานบทที่ 3'
  periodKey: ScorePeriodKey; // 'ก่อนกลางภาค'
  dueDate: string; // YYYY-MM-DD
  maxScore: number; // e.g. 10
  obtainedScore?: number;
  status: TaskStatus;
  notes?: string;
}

export type StudyStatus = 'not_started' | 'reading_50' | 'reviewed_once' | 'ready_for_exam';

export interface Exam {
  id: string;
  semesterId: SemesterId;
  subjectId: string;
  examType: 'midterm' | 'final'; // 'สอบกลางภาค' | 'สอบปลายภาค'
  examDate: string; // YYYY-MM-DD
  startTime: string; // '08:30'
  endTime: string; // '10:30'
  room: string; // 'อาคาร 3 ห้อง 324'
  maxScore: number; // '30 คะแนน'
  topics: string[]; // หัวข้อที่ออกสอบ
  tips: string; // แนวข้อสอบ
  studyStatus: StudyStatus;
}

export interface AcademicYearConfig {
  year: number; // 2569
  studentName: string;
  studentClass: string; // e.g. 'ม.5/1'
  schoolName: string;
}

export interface SubjectScoreSummary {
  subject: Subject;
  earnedScore: number;
  totalMaxScoreRecorded: number;
  totalAllocatedWeight: number;
  currentPercentage: number;
  remainingPoints: number;
  maxPossibleTotal: number;
  estimatedGrade: number;
  estimatedGradeLetter: string;
  targetAchieved: boolean;
  canStillAchieveTarget: boolean;
  pointsNeededForTarget: number;
  periodBreakdowns: {
    key: ScorePeriodKey;
    label: string;
    shortLabel: string;
    earned: number;
    max: number;
    percentage: number | null; // null if no items
    hasData: boolean;
  }[];
}

export interface SemesterSummary {
  semesterId: SemesterId;
  semesterName: string;
  totalCredits: number;
  gpa: number;
  totalEarnedScore: number;
  totalMaxPossibleScore: number;
  overallPercentage: number;
  bestSubject: Subject | null;
  needsImprovementSubject: Subject | null;
  subjectSummaries: SubjectScoreSummary[];
  focusAdvice: {
    subject: Subject;
    priority: number;
    message: string;
    remainingPoints: number;
    gapToTarget: number;
  }[];
}
