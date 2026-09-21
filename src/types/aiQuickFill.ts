import { NumericGrade, ScorePeriodKey, TaskStatus, FutureChecklistCategory, PortfolioCategory } from '../types';

export type AiQuickFillScope =
  | 'all'
  | 'profile'
  | 'tasks'
  | 'exams'
  | 'subjects'
  | 'goals'
  | 'portfolio'
  | 'study';

export interface AiParsedProfile {
  fullName?: string;
  nickname?: string;
  gradeLevel?: string;
  room?: string;
  studentNumber?: string;
  schoolName?: string;
  academicYear?: number;
  targetGpa?: NumericGrade;
  dreamCareer?: string;
  dreamFaculty?: string;
  dreamUniversity?: string;
}

export interface AiParsedTask {
  tempId: string;
  title: string;
  subjectQuery: string;
  matchedSubjectId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  periodKey: ScorePeriodKey;
  maxScore: number;
  notes?: string;
  status: TaskStatus;
  isDuplicate?: boolean;
  duplicateReason?: string;
  included: boolean;
}

export interface AiParsedExam {
  tempId: string;
  subjectQuery: string;
  matchedSubjectId?: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  examType: 'midterm' | 'final';
  room?: string;
  maxScore?: number;
  topics: string[];
  tips?: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
  included: boolean;
}

export interface AiParsedSubject {
  tempId: string;
  name: string;
  code?: string;
  credits: number;
  category?: string;
  targetGrade: NumericGrade;
  targetScore: number;
  teacherName?: string;
  classroom?: string;
  scoreItems?: {
    periodKey: ScorePeriodKey;
    title: string;
    score: number;
    maxScore: number;
  }[];
  included: boolean;
}

export interface AiParsedGoal {
  tempId: string;
  title: string;
  category: FutureChecklistCategory;
  dueDate?: string;
  details?: string;
  included: boolean;
}

export interface AiParsedPortfolio {
  tempId: string;
  title: string;
  category: PortfolioCategory;
  date: string; // YYYY-MM-DD
  description: string;
  included: boolean;
}

export interface AiParsedStudy {
  tempId: string;
  subjectQuery: string;
  matchedSubjectId?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  durationMinutes: number;
  notes?: string;
  included: boolean;
}

export interface AiAmbiguityItem {
  id: string;
  type: 'subject_choice' | 'date_year' | 'field_confirm';
  query: string;
  targetField: string;
  message: string;
  options: { label: string; value: any }[];
  selectedOption?: any;
  isResolved: boolean;
}

export interface AiConflictItem {
  id: string;
  field: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
  action: 'keep_old' | 'use_new';
}

export interface AiParseResponse {
  success: boolean;
  summary: string;
  profile?: AiParsedProfile;
  tasks: AiParsedTask[];
  exams: AiParsedExam[];
  subjects: AiParsedSubject[];
  goals: AiParsedGoal[];
  portfolio: AiParsedPortfolio[];
  studyPlans: AiParsedStudy[];
  ambiguities: AiAmbiguityItem[];
  conflicts: AiConflictItem[];
  warnings: string[];
  rawAnalysis?: string;
  error?: string;
}
