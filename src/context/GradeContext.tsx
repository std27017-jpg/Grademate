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
} from '../types';
import {
  DEFAULT_ACADEMIC_YEAR,
  DEFAULT_SUBJECTS,
  DEFAULT_TASKS,
  DEFAULT_EXAMS,
} from '../data/defaultData';
import { calculateSemesterSummary, PERIOD_CONFIG } from '../utils/gradeCalculations';

interface GradeContextType {
  currentSemester: SemesterId;
  setCurrentSemester: (semester: SemesterId) => void;
  academicYear: AcademicYearConfig;
  setAcademicYear: (config: AcademicYearConfig) => void;
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  
  // Computed summaries
  activeSemesterSummary: SemesterSummary;
  term1Summary: SemesterSummary;
  term2Summary: SemesterSummary;
  allSubjects: Subject[];
  
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

  // Backup & Reset
  resetToDefault: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SEMESTER: 'grademate_active_semester',
  YEAR: 'grademate_academic_year',
  SUBJECTS: 'grademate_subjects',
  TASKS: 'grademate_tasks',
  EXAMS: 'grademate_exams',
};

export const GradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSemester, setCurrentSemesterState] = useState<SemesterId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SEMESTER);
    return saved === 'term2' ? 'term2' : 'term1';
  });

  const [academicYear, setAcademicYearState] = useState<AcademicYearConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEAR);
      return saved ? JSON.parse(saved) : DEFAULT_ACADEMIC_YEAR;
    } catch {
      return DEFAULT_ACADEMIC_YEAR;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  });

  // Save changes to LocalStorage
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

  const setCurrentSemester = (semester: SemesterId) => {
    setCurrentSemesterState(semester);
  };

  const setAcademicYear = (config: AcademicYearConfig) => {
    setAcademicYearState(config);
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
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fullItem: ScoreItem = { ...item, id: itemId };

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const currentPeriod = s.periods[periodKey];
        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: [...(currentPeriod.items || []), fullItem],
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
        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: (currentPeriod.items || []).map((i) =>
                i.id === item.id ? item : i
              ),
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
        return {
          ...s,
          periods: {
            ...s.periods,
            [periodKey]: {
              ...currentPeriod,
              items: (currentPeriod.items || []).filter((i) => i.id !== itemId),
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

        (Object.keys(periodUpdates) as ScorePeriodKey[]).forEach((key) => {
          const update = periodUpdates[key];
          if (!update) return;

          const currentPeriod = newPeriods[key] || {
            key,
            label: PERIOD_CONFIG[key].label,
            shortLabel: PERIOD_CONFIG[key].shortLabel,
            weight: PERIOD_CONFIG[key].defaultWeight,
            items: [],
          };

          if (update.items && Array.isArray(update.items)) {
            newPeriods[key] = {
              ...currentPeriod,
              weight: update.maxScore > 0 ? update.maxScore : currentPeriod.weight,
              items: update.items,
            };
          } else {
            const existingItems = currentPeriod.items || [];
            if (existingItems.length <= 1) {
              const itemId = existingItems[0]?.id || `item_${Date.now()}_${key}`;
              const title = existingItems[0]?.title || currentPeriod.label;
              newPeriods[key] = {
                ...currentPeriod,
                weight: update.maxScore > 0 ? update.maxScore : currentPeriod.weight,
                items: [
                  {
                    id: itemId,
                    title,
                    score: update.score,
                    maxScore: update.maxScore,
                  },
                ],
              };
            } else {
              // If multiple sub-items exist, replace with one consolidated entry with the user's score/maxScore
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

  // Student Profile Handlers
  const updateStudentName = (name: string, studentClass?: string, schoolName?: string) => {
    setAcademicYearState((prev) => ({
      ...prev,
      studentName: name.trim() || prev.studentName,
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
    setCurrentSemesterState('term1');
  };

  // Export / Import
  const exportJSON = () => {
    const data = {
      academicYear,
      currentSemester,
      subjects,
      tasks,
      exams,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.subjects) setSubjects(data.subjects);
      if (data.tasks) setTasks(data.tasks);
      if (data.exams) setExams(data.exams);
      if (data.academicYear) setAcademicYear(data.academicYear);
      if (data.currentSemester) setCurrentSemesterState(data.currentSemester);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  // Computed summaries
  const term1Summary = useMemo(
    () => calculateSemesterSummary('term1', subjects),
    [subjects]
  );
  const term2Summary = useMemo(
    () => calculateSemesterSummary('term2', subjects),
    [subjects]
  );
  const activeSemesterSummary = useMemo(
    () => (currentSemester === 'term1' ? term1Summary : term2Summary),
    [currentSemester, term1Summary, term2Summary]
  );

  return (
    <GradeContext.Provider
      value={{
        currentSemester,
        setCurrentSemester,
        academicYear,
        setAcademicYear,
        updateStudentName,
        subjects,
        tasks,
        exams,
        activeSemesterSummary,
        term1Summary,
        term2Summary,
        allSubjects: subjects,
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
