export type AttendanceStatus = 'present' | 'absent' | 'no_uniform' | 'excused_absent' | 'late';

export type LessonType = 'maruza' | 'amaliy' | 'laboratoriya' | 'seminar';

export interface LateRecord {
  minutes: number;
  reason?: string;
  recordedAt: string; // ISO string or time string
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  lateMinutes?: number;
  lateReason?: string;
  note?: string;
  grade?: number | string; // Amaliy mashg'ulot bahosi (o'qituvchi o'zi kiritadi)
  hasKonspekt?: boolean; // Amaliy mashg'ulotda konspekti bor/yo'qligi
  atrabotkaDone?: boolean; // Atrabotka (qayta topshirish) qilindi
  atrabotkaScore?: number | string; // Atrabotka bahosi
  atrabotkaDate?: string; // Atrabotka topshirilgan sana (YYYY-MM-DD)
}

export interface LessonSession {
  id: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  weekNumber: number; // 1, 2, 3 ...
  lessonType: LessonType;
  topicId?: string;
  topicTitle: string;
  attendance: Record<string, AttendanceEntry>; // studentId -> AttendanceEntry
  completed: boolean;
  notes?: string;
  room?: string;
}

export interface CurriculumTopic {
  id: string;
  code?: string; // M1, M2, M3 ... yoki A1, A2 ...
  order: number;
  type: LessonType;
  title: string;
  hours: number;
  weekDefault: number;
  description?: string;
  recommendedLiterature?: string;
}

export interface MakeupRecord {
  id: string;
  studentId: string;
  groupId: string;
  missedSessionId?: string;
  missedDate: string; // Qaysi kuni dars qoldirgan
  missedTopic: string; // Qaysi mavzu / ma'ruza
  lessonType: LessonType;
  submittedDate?: string; // Qaysi kuni topshirgan
  status: 'pending' | 'submitted' | 'rejected';
  score?: number; // Baho: 100 ballik yoki 5 baholik
  submissionType?: 'savol_javob' | 'referat' | 'test' | 'ogzaki' | 'yozma';
  teacherNote?: string;
  recordedAt: string;
}

export interface IndependentTopic {
  id: string;
  orderNumber?: number; // 1 dan 15 gacha tartib raqami
  title: string;
  description?: string;
  maxScore: number;
}

export interface PracticalTask {
  id: string;
  practicalNumber: number; // 1 dan 10 gacha (A1 - A10)
  practicalCode: string; // 'A1', 'A2', ... 'A10'
  topicTitle: string; // Amaliy mashg'ulot rasmiy mavzusi
  taskTitle: string; // Vazifa sarlavhasi
  content: string; // Savollar, klinik masala, topshiriq matni
  deadlineDate?: string; // Topshirish muddati (YYYY-MM-DD)
  assignedGroupIds: string[]; // ['all'] yoki guruh ID lari ro'yxati
  maxScore: number; // Maksimal ball (masalan: 100 yoki 5)
  status: 'active' | 'draft';
  createdAt: string;
}

export interface StudentTaskSubmission {
  id: string;
  taskId: string;
  practicalCode: string; // 'A1' - 'A10'
  studentId: string;
  groupId: string;
  status: 'assigned' | 'submitted' | 'graded';
  submittedAt?: string;
  submissionText?: string;
  grade?: number | string;
  teacherFeedback?: string;
}

export interface StudentIndependentAssignment {
  id: string;
  studentId: string;
  groupId: string;
  topicId: string;
  customTopicTitle?: string;
  assignedDate: string;
  deadline: string;
  submissionDate?: string;
  status: 'assigned' | 'in_review' | 'completed' | 'revision_needed';
  score?: number;
  feedback?: string;
}

export interface Student {
  id: string;
  groupId: string;
  fullName: string;
  subGroup?: 'A' | 'B'; // Kichik guruh A yoki Kichik guruh B
  phone?: string;
  studentCode?: string; // Talaba ID yoki reyting raqami
  notes?: string;
}

export interface GroupInternshipInfo {
  isActive: boolean; // Hozir amaliyotdami
  startDate: string; // "2026-10-12"
  endDate: string; // "2026-10-25"
  startWeek: number; // 3-hafta (12-oktyabr)
  durationWeeks: number; // 2 hafta
  pausedLessonNumber: number; // Amaliyotdan oldingi dars raqami (2)
  resumeWeek: number; // 5-hafta (26-oktyabr)
  title: string; // "2 haftalik klinik / dala amaliyoti"
  note?: string; // "Davolash ishi 1-12 guruhlar"
}

export interface StudentGroup {
  id: string;
  name: string; // Masalan: "DI-25-01", "DI-25-08", "PI-25-01"
  faculty: string;
  course: number; // 1, 2, 3, 4
  currentWeek: number; // Ayrim guruhlarga 1-hafta, ayrim guruhlarga 2-hafta!
  shift?: string; // 1-smena, 2-smena
  room?: string;
  isLectureFlow?: boolean; // Oqim ma'ruzasi guruhi
  subGroups?: string[];
  constituentGroupIds?: string[]; // Ushbu oqimga kiruvchi 3 ta guruh ID lari
  hasPractical?: boolean; // Ushbu guruhga o'qituvchi amaliy mashg'ulot o'tadimi
  internship?: GroupInternshipInfo; // 2 haftalik amaliyot ma'lumotlari
}

export interface WeeklyScheduleSlot {
  id: string;
  dayOfWeek: 'dushanba' | 'seshanba' | 'chorshanba' | 'payshanba' | 'juma' | 'shanba';
  dayNameUz: string;
  pairNumber: number; // 1-para, 2-para, 3-para, 4-para, 5-para
  pairTime: string; // "08:30 - 09:50", "10:00 - 11:20", etc.
  groupCode: string; // e.g. "DI- 25-25-26-27", "DI- 25-08"
  room: string; // e.g. "413", "411", "302", "07", "406", "110"
  type: 'maruza' | 'amaliy';
  isLectureFlow: boolean; // green in table
  matchingGroupId?: string;
}
