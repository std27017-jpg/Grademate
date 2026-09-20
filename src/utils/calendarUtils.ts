import { Task, Exam, StudySession, FutureTodoItem, PersonalEvent, Subject } from '../types';

export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_DAYS_WEEK_FULL = [
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
  'อาทิตย์',
];

export const THAI_DAYS_WEEK_SHORT = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

/**
 * Format a Date or date string to Thai Buddhist full date string
 * e.g. "20 กันยายน 2569"
 */
export const formatThaiBuddhistDate = (dateInput: Date | string): string => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = THAI_MONTHS_FULL[d.getMonth()];
  const buddhistYear = d.getFullYear() + 543;
  return `${day} ${month} ${buddhistYear}`;
};

/**
 * Format a Date or date string to Thai Buddhist short date string
 * e.g. "20 ก.ย. 69"
 */
export const formatThaiBuddhistDateShort = (dateInput: Date | string): string => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const buddhistYearShort = String((d.getFullYear() + 543) % 100).padStart(2, '0');
  return `${day} ${month} ${buddhistYearShort}`;
};

/**
 * Get YYYY-MM-DD string from Date
 */
export const toDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if two dates represent the same day
 */
export const isSameDay = (d1: Date | string, d2: Date | string): boolean => {
  const str1 = typeof d1 === 'string' ? d1.split('T')[0] : toDateKey(d1);
  const str2 = typeof d2 === 'string' ? d2.split('T')[0] : toDateKey(d2);
  return str1 === str2;
};

export type CalendarItemType = 'task' | 'exam' | 'study' | 'goal' | 'personal';

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectColor?: string;
  statusText?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  raw: Task | Exam | StudySession | FutureTodoItem | PersonalEvent;
}

export interface DayStudyStats {
  totalMinutes: number;
  sessionCount: number;
  subjects: { name: string; minutes: number; color?: string }[];
  percentageOfGoal: number;
  heatLevel: 0 | 1 | 2 | 3 | 4;
}

/**
 * Calculate study heatmap level:
 * 0: 0 mins
 * 1: 1-30 mins
 * 2: 31-60 mins
 * 3: 61-120 mins
 * 4: > 120 mins
 */
export const getHeatLevel = (minutes: number): 0 | 1 | 2 | 3 | 4 => {
  if (minutes <= 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
};

/**
 * Generate 35-42 days for standard Monday-first month calendar grid
 */
export const getMonthDaysGrid = (currentMonthDate: Date): { date: Date; dateKey: string; isCurrentMonth: boolean }[] => {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  // We want Monday = 0, ..., Sunday = 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday becomes 6

  const days: { date: Date; dateKey: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDate - i);
    days.push({
      date: d,
      dateKey: toDateKey(d),
      isCurrentMonth: false,
    });
  }

  // Current month days
  const daysInMonth = lastDayOfMonth.getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dateKey: toDateKey(d),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dateKey: toDateKey(d),
      isCurrentMonth: false,
    });
  }

  return days;
};

/**
 * Generate 7 days of the week for Week View (Mon-Sun)
 */
export const getWeekDays = (referenceDate: Date): { date: Date; dateKey: string; dayName: string; dayNumber: number }[] => {
  const d = new Date(referenceDate);
  let dayOfWeek = d.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6; // Sunday is index 6

  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);

  const week: { date: Date; dateKey: string; dayName: string; dayNumber: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    week.push({
      date: current,
      dateKey: toDateKey(current),
      dayName: THAI_DAYS_WEEK_FULL[i],
      dayNumber: current.getDate(),
    });
  }
  return week;
};

/**
 * Aggregates all sources into unified CalendarItem list
 */
export const aggregateCalendarItems = (params: {
  tasks: Task[];
  exams: Exam[];
  studySessions: StudySession[];
  futureTodos: FutureTodoItem[];
  personalEvents: PersonalEvent[];
  subjects: Subject[];
}): { items: CalendarItem[]; studyStatsByDate: Record<string, DayStudyStats> } => {
  const { tasks, exams, studySessions, futureTodos, personalEvents, subjects } = params;

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const items: CalendarItem[] = [];

  // 1. Tasks
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const sub = subjectMap.get(t.subjectId);
    items.push({
      id: `task_${t.id}`,
      type: 'task',
      title: t.title,
      date: t.dueDate,
      time: t.dueTime || undefined,
      subjectId: t.subjectId,
      subjectName: sub?.name || 'ทั่วไป',
      subjectCode: sub?.code,
      subjectColor: sub?.color || 'blue',
      isCompleted: t.status === 'submitted' || t.status === 'graded',
      statusText: t.status === 'submitted' || t.status === 'graded' ? 'ส่งแล้ว' : 'ยังไม่เสร็จ',
      notes: t.notes,
      raw: t,
    });
  });

  // 2. Exams
  exams.forEach((e) => {
    if (!e.examDate) return;
    const sub = subjectMap.get(e.subjectId);
    const examLabel = e.examType === 'midterm' ? 'สอบกลางภาค' : 'สอบปลายภาค';
    items.push({
      id: `exam_${e.id}`,
      type: 'exam',
      title: `${examLabel}: ${sub?.name || 'ไม่ระบุวิชา'}`,
      date: e.examDate,
      time: e.startTime,
      endTime: e.endTime,
      subjectId: e.subjectId,
      subjectName: sub?.name || 'ไม่ระบุวิชา',
      subjectCode: sub?.code,
      subjectColor: sub?.color || 'purple',
      statusText: `${e.room ? `ห้อง ${e.room}` : ''} (${e.startTime}-${e.endTime})`.trim(),
      notes: e.tips || (e.topics && e.topics.length > 0 ? `หัวข้อ: ${e.topics.join(', ')}` : ''),
      raw: e,
    });
  });

  // 3. Study Sessions -> Group by date for statistics
  const studyStatsByDate: Record<string, DayStudyStats> = {};
  studySessions.forEach((s) => {
    if (!s.date) return;
    const dKey = s.date;
    if (!studyStatsByDate[dKey]) {
      studyStatsByDate[dKey] = {
        totalMinutes: 0,
        sessionCount: 0,
        subjects: [],
        percentageOfGoal: 0,
        heatLevel: 0,
      };
    }
    studyStatsByDate[dKey].totalMinutes += s.durationMinutes;
    studyStatsByDate[dKey].sessionCount += 1;

    const existingSub = studyStatsByDate[dKey].subjects.find((sub) => sub.name === s.subjectName);
    if (existingSub) {
      existingSub.minutes += s.durationMinutes;
    } else {
      const sub = subjectMap.get(s.subjectId);
      studyStatsByDate[dKey].subjects.push({
        name: s.subjectName,
        minutes: s.durationMinutes,
        color: sub?.color,
      });
    }

    // Also add as individual study item for Day / Agenda / Week view
    items.push({
      id: `study_${s.id}`,
      type: 'study',
      title: `อ่านหนังสือ: ${s.subjectName}${s.topic ? ` (${s.topic})` : ''}`,
      date: s.date,
      time: s.startTime,
      endTime: s.endTime,
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      statusText: `${s.durationMinutes} นาที`,
      notes: s.notes,
      raw: s,
    });
  });

  // Calculate heat levels and percentages based on 60 min default or dynamic goal
  Object.keys(studyStatsByDate).forEach((k) => {
    const stats = studyStatsByDate[k];
    stats.heatLevel = getHeatLevel(stats.totalMinutes);
    stats.percentageOfGoal = Math.min(100, Math.round((stats.totalMinutes / 60) * 100));
  });

  // 4. Goals / Future Todos
  futureTodos.forEach((ft) => {
    if (!ft.dueDate) return;
    items.push({
      id: `goal_${ft.id}`,
      type: 'goal',
      title: `เป้าหมาย: ${ft.title}`,
      date: ft.dueDate,
      priority: ft.priority,
      isCompleted: ft.isCompleted,
      statusText: ft.isCompleted ? 'สำเร็จแล้ว' : `ระดับความสำคัญ: ${ft.priority === 'high' ? 'สูง' : ft.priority === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}`,
      notes: ft.notes,
      raw: ft,
    });
  });

  // 5. Personal Events
  personalEvents.forEach((pe) => {
    if (!pe.date) return;
    items.push({
      id: `personal_${pe.id}`,
      type: 'personal',
      title: pe.title,
      date: pe.date,
      time: pe.startTime,
      endTime: pe.endTime,
      statusText: pe.category || 'กิจกรรมส่วนตัว',
      notes: pe.details,
      raw: pe,
    });
  });

  return { items, studyStatsByDate };
};

/**
 * Generate dynamic smart recommendations from actual user data
 */
export const generateSmartRecommendations = (params: {
  todayStr: string;
  items: CalendarItem[];
  studyStatsByDate: Record<string, DayStudyStats>;
  dailyStudyGoal: number;
}): { text: string; icon: string; highlightSubject?: string; type: 'urgent' | 'warning' | 'study' | 'good' } => {
  const { todayStr, items, studyStatsByDate, dailyStudyGoal } = params;

  // 1. Check tasks due today or overdue
  const todayTasks = items.filter((i) => i.type === 'task' && i.date === todayStr && !i.isCompleted);
  if (todayTasks.length > 0) {
    const task = todayTasks[0];
    return {
      text: `📌 งาน "${task.title}" (${task.subjectName || 'วิชา'}) มีกำหนดส่งวันนี้ ตรวจสอบและส่งให้ทันนะ!`,
      icon: 'AlertTriangle',
      highlightSubject: task.subjectName,
      type: 'urgent',
    };
  }

  // 2. Check exams in next 3 days
  const today = new Date(todayStr);
  const upcomingExams = items.filter((i) => {
    if (i.type !== 'exam') return false;
    const itemDate = new Date(i.date);
    const diffTime = itemDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  if (upcomingExams.length > 0) {
    const exam = upcomingExams[0];
    const itemDate = new Date(exam.date);
    const diffDays = Math.ceil((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const dayText = diffDays === 0 ? 'วันนี้' : diffDays === 1 ? 'พรุ่งนี้' : `อีก ${diffDays} วัน`;
    return {
      text: `📝 ${dayText} มีสอบ "${exam.subjectName || exam.title}" อย่าลืมแบ่งเวลาทบทวนหัวข้อสำคัญ!`,
      icon: 'BookOpen',
      highlightSubject: exam.subjectName,
      type: 'warning',
    };
  }

  // 3. Check study progress today vs daily goal
  const todayStudy = studyStatsByDate[todayStr]?.totalMinutes || 0;
  const targetGoal = dailyStudyGoal > 0 ? dailyStudyGoal : 60;
  if (todayStudy < targetGoal) {
    const remaining = targetGoal - todayStudy;
    return {
      text: `📖 วันนี้อ่านหนังสือไปแล้ว ${todayStudy}/${targetGoal} นาที (เหลืออีก ${remaining} นาทีเพื่อพิชิตเป้าหมายรายวัน ✨)`,
      icon: 'Timer',
      type: 'study',
    };
  } else {
    return {
      text: `🎉 ยอดเยี่ยมมาก! คุณอ่านหนังสือครบเป้าหมาย ${todayStudy}/${targetGoal} นาทีของวันนี้แล้ว`,
      icon: 'Sparkles',
      type: 'good',
    };
  }
};
