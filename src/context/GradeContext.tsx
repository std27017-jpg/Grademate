import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SemesterId,
  Subject,
  Task,
  Exam,
  AcademicYearConfig,
  ScorePeriodKey,
  ScoreItem,
  SemesterSummary,
  CustomGradeScale,
  UserProfile,
  FutureChecklistItem,
  PortfolioItem,
  FutureTodoItem,
  AppNotification,
  NumericGrade,
} from '../types';
import {
  DEFAULT_ACADEMIC_YEAR,
  DEFAULT_SUBJECTS,
  DEFAULT_TASKS,
  DEFAULT_EXAMS,
  DEFAULT_USER_PROFILE,
  DEFAULT_FUTURE_CHECKLIST,
  DEFAULT_PORTFOLIO_ITEMS,
  DEFAULT_FUTURE_TODOS,
} from '../data/defaultData';
import {
  calculateSemesterSummary,
  PERIOD_CONFIG,
  DEFAULT_GRADE_THRESHOLDS,
  gradeToMinScore,
} from '../utils/gradeCalculations';

interface GradeContextType {
  // Auth & Onboarding State
  isLoggedIn: boolean;
  userProfile: UserProfile;
  login: (email: string, password?: string) => boolean;
  loginAsDemo: () => void;
  register: (profileData: Partial<UserProfile>) => void;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateTargetGpa: (target: NumericGrade) => void;

  currentSemester: SemesterId;
  setCurrentSemester: (semester: SemesterId) => void;
  academicYear: AcademicYearConfig;
  setAcademicYear: (config: AcademicYearConfig) => void;
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  
  // Grade Thresholds / Cutoff Scale
  gradeThresholds: CustomGradeScale;
  updateGradeThresholds: (thresholds: CustomGradeScale) => void;
  resetGradeThresholds: () => void;

  // Computed summaries
  activeSemesterSummary: SemesterSummary;
  term1Summary: SemesterSummary;
  term2Summary: SemesterSummary;
  allSubjects: Subject[];
  targetGpaAnalysis: {
    targetGpa: number;
    currentGpa: number;
    totalPointsNeeded: number;
    pointsNeededMessage: string;
    isAchieved: boolean;
  };
  
  // Student Name & Profile Actions
  updateStudentName: (name: string, studentClass?: string, schoolName?: string) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  // Score Item Actions
  addScoreItem: (subjectId: string, periodKey: ScorePeriodKey, item: Omit<ScoreItem, 'id'>) => void;
  updateScoreItem: (subjectId: string, periodKey: ScorePeriodKey, item: ScoreItem) => void;
  deleteScoreItem: (subjectId: string, periodKey: ScorePeriodKey, itemId: string) => void;
  updateSubjectPeriodScores: (
    subjectId: string,
    periodUpdates: Partial<Record<ScorePeriodKey, { score: number; maxScore: number; items?: ScoreItem[] }>>
  ) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;

  // Future Planner (Checklist)
  futureChecklist: FutureChecklistItem[];
  toggleFutureChecklistItem: (id: string) => void;
  addFutureChecklistItem: (item: Omit<FutureChecklistItem, 'id'>) => void;
  deleteFutureChecklistItem: (id: string) => void;

  // Portfolio Actions
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  updatePortfolioItem: (item: PortfolioItem) => void;
  deletePortfolioItem: (id: string) => void;
  toggleInPortfolio: (id: string) => void;

  // Future To-dos
  futureTodos: FutureTodoItem[];
  addFutureTodo: (item: Omit<FutureTodoItem, 'id' | 'createdAt'>) => void;
  updateFutureTodo: (item: FutureTodoItem) => void;
  deleteFutureTodo: (id: string) => void;
  toggleFutureTodo: (id: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Backup & Reset
  resetToDefault: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_LOGGED_IN: 'mygrade_is_logged_in',
  USER_PROFILE: 'mygrade_user_profile',
  SEMESTER: 'mygrade_active_semester',
  YEAR: 'mygrade_academic_year',
  SUBJECTS: 'mygrade_subjects',
  TASKS: 'mygrade_tasks',
  EXAMS: 'mygrade_exams',
  THRESHOLDS: 'mygrade_grade_thresholds',
  FUTURE_CHECKLIST: 'mygrade_future_checklist',
  PORTFOLIO: 'mygrade_portfolio_items',
  FUTURE_TODOS: 'mygrade_future_todos',
  READ_NOTIFS: 'mygrade_read_notification_ids',
  // Legacy fallback keys to ensure no data loss
  LEGACY_SEMESTER: 'grademate_active_semester',
  LEGACY_YEAR: 'grademate_academic_year',
  LEGACY_SUBJECTS: 'grademate_subjects',
  LEGACY_TASKS: 'grademate_tasks',
  LEGACY_EXAMS: 'grademate_exams',
};

export const GradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state - check if previously logged in; default to false if explicitly not logged in or first visit
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_LOGGED_IN);
    // If not set yet, we allow opening straight to app or welcome.
    // Let's set to true if user already has custom data or explicitly logged in
    return saved === 'true';
  });

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) } : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [currentSemester, setCurrentSemesterState] = useState<SemesterId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SEMESTER) || localStorage.getItem(STORAGE_KEYS.LEGACY_SEMESTER);
    return saved === 'term2' ? 'term2' : 'term1';
  });

  const [academicYear, setAcademicYearState] = useState<AcademicYearConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEAR) || localStorage.getItem(STORAGE_KEYS.LEGACY_YEAR);
      if (saved) return JSON.parse(saved);
      return {
        year: DEFAULT_USER_PROFILE.academicYear,
        studentName: DEFAULT_USER_PROFILE.fullName,
        studentClass: DEFAULT_USER_PROFILE.studentClass,
        schoolName: DEFAULT_USER_PROFILE.schoolName,
      };
    } catch {
      return DEFAULT_ACADEMIC_YEAR;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS) || localStorage.getItem(STORAGE_KEYS.LEGACY_SUBJECTS);
      return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS) || localStorage.getItem(STORAGE_KEYS.LEGACY_TASKS);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS) || localStorage.getItem(STORAGE_KEYS.LEGACY_EXAMS);
      return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  });

  const [gradeThresholds, setGradeThresholds] = useState<CustomGradeScale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      return saved ? { ...DEFAULT_GRADE_THRESHOLDS, ...JSON.parse(saved) } : DEFAULT_GRADE_THRESHOLDS;
    } catch {
      return DEFAULT_GRADE_THRESHOLDS;
    }
  });

  const [futureChecklist, setFutureChecklist] = useState<FutureChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUTURE_CHECKLIST);
      return saved ? JSON.parse(saved) : DEFAULT_FUTURE_CHECKLIST;
    } catch {
      return DEFAULT_FUTURE_CHECKLIST;
    }
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return saved ? JSON.parse(saved) : DEFAULT_PORTFOLIO_ITEMS;
    } catch {
      return DEFAULT_PORTFOLIO_ITEMS;
    }
  });

  const [futureTodos, setFutureTodos] = useState<FutureTodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUTURE_TODOS);
      return saved ? JSON.parse(saved) : DEFAULT_FUTURE_TODOS;
    } catch {
      return DEFAULT_FUTURE_TODOS;
    }
  });

  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READ_NOTIFS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_LOGGED_IN, String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEMESTER, currentSemester);
  }, [currentSemester]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEAR, JSON.stringify(academicYear));
  }, [academicYear]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(gradeThresholds));
  }, [gradeThresholds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUTURE_CHECKLIST, JSON.stringify(futureChecklist));
  }, [futureChecklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUTURE_TODOS, JSON.stringify(futureTodos));
  }, [futureTodos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFS, JSON.stringify(readNotifIds));
  }, [readNotifIds]);

  // Auth Functions
  const login = (email: string, password?: string) => {
    setIsLoggedIn(true);
    if (email && email !== userProfile.email) {
      setUserProfileState((prev) => ({ ...prev, email }));
    }
    return true;
  };

  const loginAsDemo = () => {
    setIsLoggedIn(true);
    setUserProfileState(DEFAULT_USER_PROFILE);
    setAcademicYearState({
      year: DEFAULT_USER_PROFILE.academicYear,
      studentName: DEFAULT_USER_PROFILE.fullName,
      studentClass: DEFAULT_USER_PROFILE.studentClass,
      schoolName: DEFAULT_USER_PROFILE.schoolName,
    });
  };

  const register = (profileData: Partial<UserProfile>) => {
    const newProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      ...profileData,
      id: `user_${Date.now()}`,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setUserProfileState(newProfile);
    setAcademicYearState({
      year: newProfile.academicYear || 2568,
      studentName: newProfile.fullName || 'นักเรียน',
      studentClass: newProfile.studentClass || `${newProfile.gradeLevel}/${newProfile.room || '1'}`,
      schoolName: newProfile.schoolName || 'โรงเรียนพิชัย',
    });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.fullName || partial.studentClass || partial.schoolName || partial.academicYear) {
        setAcademicYearState((ay) => ({
          ...ay,
          studentName: updated.fullName,
          studentClass: updated.studentClass,
          schoolName: updated.schoolName,
          year: updated.academicYear,
        }));
      }
      return updated;
    });
  };

  const updateTargetGpa = (target: NumericGrade) => {
    setUserProfileState((prev) => ({ ...prev, targetGpa: target }));
  };

  const setCurrentSemester = (semester: SemesterId) => {
    setCurrentSemesterState(semester);
  };

  const setAcademicYear = (config: AcademicYearConfig) => {
    setAcademicYearState(config);
    setUserProfileState((prev) => ({
      ...prev,
      fullName: config.studentName,
      studentClass: config.studentClass,
      schoolName: config.schoolName,
      academicYear: config.year,
    }));
  };

  const updateGradeThresholds = (newThresholds: CustomGradeScale) => {
    setGradeThresholds({ ...DEFAULT_GRADE_THRESHOLDS, ...newThresholds });
  };

  const resetGradeThresholds = () => {
    setGradeThresholds(DEFAULT_GRADE_THRESHOLDS);
  };

  // Subject Handlers
  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fullSubject: Subject = {
      ...newSub,
      id,
    };
    setSubjects((prev) => [...prev, fullSubject]);
    return fullSubject;
  };

  const updateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
    setExams((prev) => prev.filter((e) => e.subjectId !== id));
  };

  // Score Item Handlers
  const addScoreItem = (
    subjectId: string,
    periodKey: ScorePeriodKey,
    item: Omit<ScoreItem, 'id'>
  ) => {
    const newItem: ScoreItem = {
      ...item,
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const currentPeriod = s.periods[periodKey] || {
          key: periodKey,
          label: PERIOD_CONFIG[periodKey].label,
          shortLabel: PERIOD_CONFIG[periodKey].shortLabel,
          weight: PERIOD_CONFIG[periodKey].defaultWeight,
          items: [],
        };

        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: [...(currentPeriod.items || []), newItem],
            },
          },
        };
      })
    );
  };

  const updateScoreItem = (
    subjectId: string,
    periodKey: ScorePeriodKey,
    item: ScoreItem
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const currentPeriod = s.periods[periodKey];
        if (!currentPeriod) return s;

        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: currentPeriod.items.map((i) => (i.id === item.id ? item : i)),
            },
          },
        };
      })
    );
  };

  const deleteScoreItem = (
    subjectId: string,
    periodKey: ScorePeriodKey,
    itemId: string
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const currentPeriod = s.periods[periodKey];
        if (!currentPeriod) return s;

        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: currentPeriod.items.filter((i) => i.id !== itemId),
            },
          },
        };
      })
    );
  };

  const updateSubjectPeriodScores = (
    subjectId: string,
    periodUpdates: Partial<Record<ScorePeriodKey, { score: number; maxScore: number; items?: ScoreItem[] }>>
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;

        const newPeriods = { ...s.periods };
        const keys: ScorePeriodKey[] = ['preMidterm', 'midterm', 'postMidterm', 'final'];

        keys.forEach((key) => {
          const update = periodUpdates[key];
          if (update) {
            const currentPeriod = s.periods[key] || {
              key,
              label: PERIOD_CONFIG[key].label,
              shortLabel: PERIOD_CONFIG[key].shortLabel,
              weight: PERIOD_CONFIG[key].defaultWeight,
              items: [],
            };

            const existingItems = currentPeriod.items || [];

            if (update.items) {
              newPeriods[key] = {
                ...currentPeriod,
                weight: update.maxScore > 0 ? update.maxScore : currentPeriod.weight,
                items: update.items,
              };
            } else {
              const itemId = existingItems[0]?.id || `item_${Date.now()}_${key}`;
              newPeriods[key] = {
                ...currentPeriod,
                weight: update.maxScore > 0 ? update.maxScore : currentPeriod.weight,
                items: [
                  {
                    id: itemId,
                    title: currentPeriod.label,
                    score: update.score,
                    maxScore: update.maxScore,
                  },
                ],
              };
            }
          }
        });

        return {
          ...s,
          periods: newPeriods,
        };
      })
    );
  };

  // Task Handlers
  const addTask = (newTask: Omit<Task, 'id'>) => {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setTasks((prev) => [...prev, { ...newTask, id }]);
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Exam Handlers
  const addExam = (newExam: Omit<Exam, 'id'>) => {
    const id = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setExams((prev) => [...prev, { ...newExam, id }]);
  };

  const updateExam = (updated: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Future Checklist Handlers
  const toggleFutureChecklistItem = (id: string) => {
    setFutureChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isCompleted: !item.isCompleted,
              completedAt: !item.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
            }
          : item
      )
    );
  };

  const addFutureChecklistItem = (item: Omit<FutureChecklistItem, 'id'>) => {
    const newItem: FutureChecklistItem = {
      ...item,
      id: `fc_${Date.now()}`,
    };
    setFutureChecklist((prev) => [...prev, newItem]);
  };

  const deleteFutureChecklistItem = (id: string) => {
    setFutureChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  // Portfolio Handlers
  const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `port_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPortfolioItems((prev) => [newItem, ...prev]);
  };

  const updatePortfolioItem = (updated: PortfolioItem) => {
    setPortfolioItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const deletePortfolioItem = (id: string) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleInPortfolio = (id: string) => {
    setPortfolioItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inPortfolio: !item.inPortfolio } : item))
    );
  };

  // Future Todo Handlers
  const addFutureTodo = (item: Omit<FutureTodoItem, 'id' | 'createdAt'>) => {
    const newItem: FutureTodoItem = {
      ...item,
      id: `ft_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFutureTodos((prev) => [newItem, ...prev]);
  };

  const updateFutureTodo = (updated: FutureTodoItem) => {
    setFutureTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteFutureTodo = (id: string) => {
    setFutureTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFutureTodo = (id: string) => {
    setFutureTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  // Student Profile Handlers
  const updateStudentName = (name: string, studentClass?: string, schoolName?: string) => {
    setAcademicYearState((prev) => ({
      ...prev,
      studentName: name.trim() || prev.studentName,
      studentClass: studentClass !== undefined ? studentClass.trim() : prev.studentClass,
      schoolName: schoolName !== undefined ? schoolName.trim() : prev.schoolName,
    }));
    setUserProfileState((prev) => ({
      ...prev,
      fullName: name.trim() || prev.fullName,
      studentClass: studentClass !== undefined ? studentClass.trim() : prev.studentClass,
      schoolName: schoolName !== undefined ? schoolName.trim() : prev.schoolName,
    }));
  };

  // Reset to default
  const resetToDefault = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setTasks(DEFAULT_TASKS);
    setExams(DEFAULT_EXAMS);
    setAcademicYear(DEFAULT_ACADEMIC_YEAR);
    setUserProfileState(DEFAULT_USER_PROFILE);
    setFutureChecklist(DEFAULT_FUTURE_CHECKLIST);
    setPortfolioItems(DEFAULT_PORTFOLIO_ITEMS);
    setFutureTodos(DEFAULT_FUTURE_TODOS);
    setGradeThresholds(DEFAULT_GRADE_THRESHOLDS);
    setCurrentSemesterState('term1');
    setReadNotifIds([]);
  };

  // Export / Import
  const exportJSON = () => {
    const data = {
      userProfile,
      academicYear,
      currentSemester,
      subjects,
      tasks,
      exams,
      gradeThresholds,
      futureChecklist,
      portfolioItems,
      futureTodos,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userProfile) setUserProfileState(data.userProfile);
      if (data.subjects) setSubjects(data.subjects);
      if (data.tasks) setTasks(data.tasks);
      if (data.exams) setExams(data.exams);
      if (data.academicYear) setAcademicYear(data.academicYear);
      if (data.gradeThresholds) setGradeThresholds(data.gradeThresholds);
      if (data.currentSemester) setCurrentSemesterState(data.currentSemester);
      if (data.futureChecklist) setFutureChecklist(data.futureChecklist);
      if (data.portfolioItems) setPortfolioItems(data.portfolioItems);
      if (data.futureTodos) setFutureTodos(data.futureTodos);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  // Computed summaries with dynamic thresholds
  const term1Summary = useMemo(
    () => calculateSemesterSummary('term1', subjects, gradeThresholds),
    [subjects, gradeThresholds]
  );
  const term2Summary = useMemo(
    () => calculateSemesterSummary('term2', subjects, gradeThresholds),
    [subjects, gradeThresholds]
  );
  const activeSemesterSummary = useMemo(
    () => (currentSemester === 'term1' ? term1Summary : term2Summary),
    [currentSemester, term1Summary, term2Summary]
  );

  // Target GPA Analysis
  const targetGpaAnalysis = useMemo(() => {
    const target = userProfile.targetGpa || 3.5;
    const currentGpa = activeSemesterSummary.gpa;
    const semesterSubs = subjects.filter((s) => s.semesterId === currentSemester);
    
    // Calculate points needed across subjects
    let needed = 0;
    const minTargetScoreForGpa = gradeToMinScore(target, gradeThresholds);

    semesterSubs.forEach((sub) => {
      const subTargetScore = sub.targetScore || gradeToMinScore(sub.targetGrade || target, gradeThresholds);
      const summary = activeSemesterSummary.subjectSummaries.find((s) => s.subject.id === sub.id);
      const earned = summary?.earnedScore || 0;
      if (earned < subTargetScore) {
        needed += (subTargetScore - earned);
      }
    });

    const isAchieved = currentGpa >= target;
    const diff = target - currentGpa;

    let pointsNeededMessage = '';
    if (isAchieved) {
      pointsNeededMessage = `🎉 บรรลุเป้าหมายเกรด ${target.toFixed(2)} แล้ว! ทำผลงานได้ยอดเยี่ยมมาก`;
    } else {
      const approxPoints = Math.round(needed > 0 ? needed : diff * 20);
      pointsNeededMessage = `เป้าหมายเกรด ${target.toFixed(2)} 🎯 ตอนนี้คุณอยู่ที่ ${currentGpa.toFixed(2)} ต้องเพิ่มอีกประมาณ ${approxPoints} คะแนนเพื่อไปถึงเป้าหมาย สู้ๆ นะคะ! 💗`;
    }

    return {
      targetGpa: target,
      currentGpa,
      totalPointsNeeded: Math.max(0, needed),
      pointsNeededMessage,
      isAchieved,
    };
  }, [userProfile.targetGpa, activeSemesterSummary, subjects, currentSemester, gradeThresholds]);

  // Dynamic Notifications
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Tasks due within 3 days
    tasks
      .filter((t) => t.semesterId === currentSemester && t.status !== 'submitted' && t.status !== 'graded')
      .forEach((t) => {
        const dueDate = new Date(t.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= -1) {
          const sub = subjects.find((s) => s.id === t.subjectId);
          list.push({
            id: `notif_task_${t.id}`,
            type: 'task_due',
            title: `งานใกล้ครบกำหนด: ${t.title}`,
            message: `${sub?.name || 'วิชา'} มีกำหนดส่ง ${diffDays === 0 ? 'วันนี้!' : diffDays < 0 ? 'เลยกำหนดแล้ว' : `อีก ${diffDays} วัน`}`,
            date: t.dueDate,
            read: readNotifIds.includes(`notif_task_${t.id}`),
            actionTab: 'tasks',
          });
        }
      });

    // 2. Exams within 7 days
    exams
      .filter((e) => e.semesterId === currentSemester)
      .forEach((e) => {
        const examDate = new Date(e.examDate);
        const diffDays = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) {
          const sub = subjects.find((s) => s.id === e.subjectId);
          list.push({
            id: `notif_exam_${e.id}`,
            type: 'exam_near',
            title: `สอบใกล้ถึง: ${e.examType === 'midterm' ? 'กลางภาค' : 'ปลายภาค'} ${sub?.name || ''}`,
            message: `สอบวันที่ ${e.examDate} เวลา ${e.startTime} น. (${diffDays === 0 ? 'สอบวันนี้!' : `อีก ${diffDays} วัน`})`,
            date: e.examDate,
            read: readNotifIds.includes(`notif_exam_${e.id}`),
            actionTab: 'exams',
          });
        }
      });

    // 3. Subjects with missing scores (e.g. final period is empty)
    const emptyFinalSubs = subjects
      .filter((s) => s.semesterId === currentSemester)
      .filter((s) => !s.periods.final || !s.periods.final.items || s.periods.final.items.length === 0);

    if (emptyFinalSubs.length > 0) {
      list.push({
        id: `notif_missing_scores`,
        type: 'score_missing',
        title: `คะแนนสอบปลายภาคยังไม่ได้กรอก`,
        message: `มี ${emptyFinalSubs.length} วิชาที่ยังไม่มีคะแนนปลายภาค คลิกเพื่อบันทึกคะแนน`,
        date: todayStr,
        read: readNotifIds.includes('notif_missing_scores'),
        actionTab: 'subjects',
      });
    }

    // 4. Grade Target Advice
    list.push({
      id: `notif_target_advice`,
      type: 'grade_target',
      title: `ความคืบหน้าเป้าหมายเกรด ${userProfile.targetGpa.toFixed(2)}`,
      message: targetGpaAnalysis.pointsNeededMessage,
      date: todayStr,
      read: readNotifIds.includes('notif_target_advice'),
      actionTab: 'future',
    });

    // 5. Future Checklist readiness
    const completedCount = futureChecklist.filter((i) => i.isCompleted).length;
    const totalCount = futureChecklist.length;
    if (totalCount > 0 && completedCount < totalCount) {
      list.push({
        id: `notif_future_checklist`,
        type: 'future_checklist',
        title: `เส้นทางสู่อนาคต: ความพร้อม ${Math.round((completedCount / totalCount) * 100)}%`,
        message: `ทำสำเร็จแล้ว ${completedCount}/${totalCount} รายการ ตรวจสอบสิ่งที่ต้องเตรียมตัวเพิ่มได้เลย`,
        date: todayStr,
        read: readNotifIds.includes('notif_future_checklist'),
        actionTab: 'future',
      });
    }

    return list;
  }, [tasks, exams, subjects, currentSemester, readNotifIds, userProfile.targetGpa, targetGpaAnalysis, futureChecklist]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationAsRead = (id: string) => {
    setReadNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
  };

  return (
    <GradeContext.Provider
      value={{
        isLoggedIn,
        userProfile,
        login,
        loginAsDemo,
        register,
        logout,
        updateUserProfile,
        updateTargetGpa,
        currentSemester,
        setCurrentSemester,
        academicYear,
        setAcademicYear,
        updateStudentName,
        subjects,
        tasks,
        exams,
        gradeThresholds,
        updateGradeThresholds,
        resetGradeThresholds,
        activeSemesterSummary,
        term1Summary,
        term2Summary,
        allSubjects: subjects,
        targetGpaAnalysis,
        addSubject,
        updateSubject,
        deleteSubject,
        addScoreItem,
        updateScoreItem,
        deleteScoreItem,
        updateSubjectPeriodScores,
        addTask,
        updateTask,
        deleteTask,
        addExam,
        updateExam,
        deleteExam,
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
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefault,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => {
  const context = useContext(GradeContext);
  if (!context) {
    throw new Error('useGrade must be used within a GradeProvider');
  }
  return context;
};
