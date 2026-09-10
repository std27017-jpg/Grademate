export type SemesterId = 'term1' | 'term2';

export type ScorePeriodKey = 'preMidterm' | 'midterm' | 'postMidterm' | 'final';

export type NumericGrade = 4 | 3.5 | 3 | 2.5 | 2 | 1.5 | 1 | 0;

export type GradeLevel = 'ม.4' | 'ม.5' | 'ม.6';

export interface DreamUniversity {
  id: string;
  universityName: string;
  faculty: string;
  major?: string;
  priority?: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  nickname?: string;
  studentClass: string; // e.g. 'ม.5/1'
  gradeLevel: GradeLevel;
  room: string;
  studentNumber: string;
  schoolName: string;
  academicYear: number;
  avatar: string; // Avatar emoji or image url
  targetGpa: NumericGrade; // 4, 3.5, 3, 2.5, 2, 1.5, 1, 0
  dreamCareer: string;
  dreamUniversities: DreamUniversity[];
  registeredAt?: string;
}

export type FutureChecklistCategory =
  | 'academic'
  | 'exam'
  | 'activity'
  | 'portfolio'
  | 'application'
  | 'general';

export interface FutureChecklistItem {
  id: string;
  title: string;
  category: FutureChecklistCategory;
  isCompleted: boolean;
  completedAt?: string;
  recommendedReason?: string;
}

export type PortfolioCategory =
  | 'certificate' // 📜 เกียรติบัตร
  | 'award'       // 🏆 รางวัล
  | 'project'     // 🔬 โครงงาน
  | 'activity'    // 🤝 กิจกรรม
  | 'volunteer'   // ❤️ จิตอาสา
  | 'academic'    // 📚 ผลงานด้านวิชาการ
  | 'other';      // 🎨 ผลงานอื่น ๆ

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  date: string; // YYYY-MM-DD
  imageUrl?: string;
  fileName?: string;
  inPortfolio: boolean; // ใช้ใน Portfolio
  createdAt: string;
}

export interface FutureTodoItem {
  id: string;
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export type NotificationType =
  | 'task_due'
  | 'exam_near'
  | 'score_missing'
  | 'grade_target'
  | 'portfolio_pending'
  | 'future_checklist';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionTab?: string;
}

export type CustomGradeScale = Record<NumericGrade, number>;

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
  targetGrade: NumericGrade; // 4, 3.5, 3, 2.5, 2, 1.5, 1, 0
  targetScore: number; // e.g. 80 (Grade 4)
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
  estimatedGrade: NumericGrade; // 4, 3.5, 3, 2.5, 2, 1.5, 1, 0
  estimatedGradeLetter: string; // '4', '3.5', '3', '2.5', '2', '1.5', '1', '0' (Numeric string representation)
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
