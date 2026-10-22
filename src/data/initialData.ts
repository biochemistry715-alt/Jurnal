import {
  StudentGroup,
  Student,
  CurriculumTopic,
  IndependentTopic,
  LessonSession,
  MakeupRecord,
  StudentIndependentAssignment,
  WeeklyScheduleSlot,
  GroupInternshipInfo
} from '../types';
import { DAVOLASH_STUDENTS } from './davolashStudents';
import { ADDITIONAL_STREAM_STUDENTS } from './streamGroupsData';
import { PEDIATRIYA_STUDENTS } from './pediatriyaStudents';
import { OFFICIAL_CURRICULUM } from './officialCurriculum';
import { OFFICIAL_INDEPENDENT_TOPICS, INITIAL_PRACTICAL_TASKS } from './independentTopicsData';

export const TEACHER_FULL_NAME = "Mamazulunov Nurmuhammad Xusanboy o'g'li";

/**
 * Davolash ishi 1-guruhdan 12-guruhgacha 12.10.2026 sanadan boshlab
 * 2 haftalik klinik / dala amaliyotiga chiqqan.
 * 12.10.2026 - 25.10.2026 (3 va 4-haftalar) oralig'ida darslar to'xtatilgan.
 * Amaliyotdan so'ng (26.10.2026, 5-haftadan) darslar kelgan joyidan (3-darsdan) davom etadi!
 */
export const DAVOLASH_1_12_INTERNSHIP: GroupInternshipInfo = {
  isActive: true,
  startDate: '2026-10-12',
  endDate: '2026-10-25',
  startWeek: 3,
  durationWeeks: 2,
  pausedLessonNumber: 2,
  resumeWeek: 5,
  title: '2 haftalik klinik / dala amaliyoti',
  note: 'Davolash ishi 1–12 guruhlar (12.10.2026 dan 2 hafta)'
};

export const INITIAL_GROUPS: StudentGroup[] = [
  // 1-oqim individual guruhlari (12.10.2026 dan 2 haftalik amaliyotda!)
  {
    id: 'grp-di-25-01',
    name: 'DI-25-01',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '07-auditoriya',
    hasPractical: true,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-02',
    name: 'DI-25-02',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '413-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-03',
    name: 'DI-25-03',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '413-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-04',
    name: 'DI-25-04',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-05',
    name: 'DI-25-05',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-06',
    name: 'DI-25-06',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-07',
    name: 'DI-25-07',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  // 8-guruh: DI-25-08 (12.10.2026 dan 2 haftalik amaliyotda!)
  {
    id: 'grp-di-25-08',
    name: 'DI-25-08',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Seshanba 3-para amaliyot (12:00) -> 4-haftada amaliyotda
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: true,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-09',
    name: 'DI-25-09',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-10',
    name: 'DI-25-10',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-11',
    name: 'DI-25-11',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-12',
    name: 'DI-25-12',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '411-auditoriya',
    hasPractical: false,
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-25-22',
    name: 'DI-25-22',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Dushanba 2-para amaliyot (10:00 - 11:20) -> 4-dars
    shift: '1-smena',
    room: '312-auditoriya',
    hasPractical: true
  },
  {
    id: 'grp-di-25-13',
    name: 'DI-25-13',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 3, // Payshanba 3-para amaliyot (12:00) (1-oktyabr bayram bo'lgani sababli 3-dars)
    shift: '2-smena',
    room: '406-auditoriya',
    hasPractical: true
  },
  {
    id: 'grp-di-25-14',
    name: 'DI-25-14',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 3, // Payshanba 2-oqim (3-dars)
    shift: '2-smena',
    room: '413-auditoriya',
    hasPractical: false
  },
  {
    id: 'grp-di-25-15',
    name: 'DI-25-15',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 3, // Payshanba 2-oqim (3-dars)
    shift: '2-smena',
    room: '413-auditoriya',
    hasPractical: false
  },
  // 3-oqim individual guruhlari
  {
    id: 'grp-di-25-20',
    name: 'DI-25-20',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '2-smena',
    room: '406-auditoriya',
    hasPractical: false
  },
  {
    id: 'grp-di-25-25',
    name: 'DI-25-25',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Chorshanba 3-para amaliyot (12:00) -> 4-dars
    shift: '1-smena',
    room: '302-auditoriya',
    hasPractical: true
  },
  {
    id: 'grp-di-25-26',
    name: 'DI-25-26',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '413-auditoriya',
    hasPractical: false
  },
  {
    id: 'grp-di-25-27',
    name: 'DI-25-27',
    faculty: 'Davolash ishi (2-bosqich)',
    course: 2,
    currentWeek: 4,
    shift: '1-smena',
    room: '413-auditoriya',
    hasPractical: false
  },
  // Pediatriya individual guruhlari
  {
    id: 'grp-pi-25-01',
    name: 'PI-25-01',
    faculty: 'Pediatriya ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Dushanba 3-para amaliyot (12:00) -> 4-dars
    shift: '1-smena',
    room: '101-auditoriya',
    hasPractical: true
  },
  {
    id: 'grp-pi-25-02',
    name: 'PI-25-02',
    faculty: 'Pediatriya ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Juma oqim -> 4-dars
    shift: '1-smena',
    room: '110-auditoriya',
    hasPractical: false
  },
  {
    id: 'grp-pi-25-03',
    name: 'PI-25-03',
    faculty: 'Pediatriya ishi (2-bosqich)',
    course: 2,
    currentWeek: 4, // Juma oqim -> 4-dars
    shift: '1-smena',
    room: '110-auditoriya',
    hasPractical: false
  },

  // =======================================================
  // OQIMLAR (Davolash ishi bo'yicha 3 ta Oqim + 1 ta Pediatriya)
  // =======================================================
  {
    id: 'grp-di-stream-01-03',
    name: 'DI-25-01-02-03 (1-Oqim)',
    faculty: 'Davolash ishi (1-oqim: 01, 02, 03-guruhlar)',
    course: 2,
    currentWeek: 4, // Seshanba ma'ruza -> 4-dars
    shift: '2-smena',
    room: '413-auditoriya',
    isLectureFlow: true,
    subGroups: ['DI-25-01', 'DI-25-02', 'DI-25-03'],
    constituentGroupIds: ['grp-di-25-01', 'grp-di-25-02', 'grp-di-25-03'],
    internship: DAVOLASH_1_12_INTERNSHIP
  },
  {
    id: 'grp-di-stream-13-15',
    name: 'DI-25-13-14-15 (2-Oqim)',
    faculty: 'Davolash ishi (2-oqim: 13, 14, 15-guruhlar)',
    course: 2,
    currentWeek: 3, // Payshanba ma'ruza (1-oktyabr bayram bo'lgani sababli 3-dars)
    shift: '2-smena',
    room: '413-auditoriya',
    isLectureFlow: true,
    subGroups: ['DI-25-13', 'DI-25-14', 'DI-25-15'],
    constituentGroupIds: ['grp-di-25-13', 'grp-di-25-14', 'grp-di-25-15']
  },
  {
    id: 'grp-di-stream-25-27',
    name: 'DI-25-25-26-27 (3-Oqim)',
    faculty: 'Davolash ishi (3-oqim: 25, 26, 27-guruhlar)',
    course: 2,
    currentWeek: 4, // Dushanba 19-oktyabr ma'ruza -> 4-dars
    shift: '1-smena',
    room: '413-auditoriya',
    isLectureFlow: true,
    subGroups: ['DI-25-25', 'DI-25-26', 'DI-25-27'],
    constituentGroupIds: ['grp-di-25-25', 'grp-di-25-26', 'grp-di-25-27']
  },
  {
    id: 'grp-pi-stream-01-03',
    name: 'PI-25-01-02-03 (Pediatriya Oqimi)',
    faculty: 'Pediatriya ishi (Oqim: 01, 02, 03-guruhlar)',
    course: 2,
    currentWeek: 4, // Juma ma'ruza -> 4-dars
    shift: '1-smena',
    room: '110-auditoriya',
    isLectureFlow: true,
    subGroups: ['PI-25-01', 'PI-25-02', 'PI-25-03'],
    constituentGroupIds: ['grp-pi-25-01', 'grp-pi-25-02', 'grp-pi-25-03']
  }
];

export const INITIAL_SCHEDULE: WeeklyScheduleSlot[] = [
  // ==========================================
  // DUSHANBA (1-kun: 3 dars)
  // ==========================================
  {
    id: 'sch-mon-1',
    dayOfWeek: 'dushanba',
    dayNameUz: 'Dushanba',
    pairNumber: 1,
    pairTime: '08:30 - 09:50',
    groupCode: 'DI-25-25-26-27',
    room: '413',
    type: 'maruza',
    isLectureFlow: true,
    matchingGroupId: 'grp-di-stream-25-27'
  },
  {
    id: 'sch-mon-2',
    dayOfWeek: 'dushanba',
    dayNameUz: 'Dushanba',
    pairNumber: 2,
    pairTime: '10:00 - 11:20',
    groupCode: 'DI-25-22',
    room: '312',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-di-25-22'
  },
  {
    id: 'sch-mon-3',
    dayOfWeek: 'dushanba',
    dayNameUz: 'Dushanba',
    pairNumber: 3,
    pairTime: '12:00 - 13:20',
    groupCode: 'PI-25-01',
    room: '101',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-pi-25-01'
  },

  // ==========================================
  // SESHANBA (2-kun: 2 dars)
  // ==========================================
  {
    id: 'sch-tue-3',
    dayOfWeek: 'seshanba',
    dayNameUz: 'Seshanba',
    pairNumber: 3,
    pairTime: '12:00 - 13:20',
    groupCode: 'DI-25-08',
    room: '411',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-di-25-08'
  },
  {
    id: 'sch-tue-4',
    dayOfWeek: 'seshanba',
    dayNameUz: 'Seshanba',
    pairNumber: 4,
    pairTime: '13:30 - 14:50',
    groupCode: 'DI-25-01-02-03',
    room: '413',
    type: 'maruza',
    isLectureFlow: true,
    matchingGroupId: 'grp-di-stream-01-03'
  },

  // ==========================================
  // CHORSHANBA (3-kun: 2 dars)
  // ==========================================
  {
    id: 'sch-wed-3',
    dayOfWeek: 'chorshanba',
    dayNameUz: 'Chorshanba',
    pairNumber: 3,
    pairTime: '12:00 - 13:20',
    groupCode: 'DI-25-25',
    room: '302',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-di-25-25'
  },
  {
    id: 'sch-wed-5',
    dayOfWeek: 'chorshanba',
    dayNameUz: 'Chorshanba',
    pairNumber: 5,
    pairTime: '15:00 - 16:20',
    groupCode: 'DI-25-01',
    room: '07',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-di-25-01'
  },

  // ==========================================
  // PAYSHANBA (4-kun: 2 dars)
  // ==========================================
  {
    id: 'sch-thu-3',
    dayOfWeek: 'payshanba',
    dayNameUz: 'Payshanba',
    pairNumber: 3,
    pairTime: '12:00 - 13:20',
    groupCode: 'DI-25-13',
    room: '406',
    type: 'amaliy',
    isLectureFlow: false,
    matchingGroupId: 'grp-di-25-13'
  },
  {
    id: 'sch-thu-5',
    dayOfWeek: 'payshanba',
    dayNameUz: 'Payshanba',
    pairNumber: 5,
    pairTime: '15:00 - 16:20',
    groupCode: 'DI-25-13-14-15',
    room: '413',
    type: 'maruza',
    isLectureFlow: true,
    matchingGroupId: 'grp-di-stream-13-15'
  },

  // ==========================================
  // JUMA (5-kun: 1 dars)
  // ==========================================
  {
    id: 'sch-fri-1',
    dayOfWeek: 'juma',
    dayNameUz: 'Juma',
    pairNumber: 1,
    pairTime: '08:30 - 09:50',
    groupCode: 'PI-25-01-02-03',
    room: '110',
    type: 'maruza',
    isLectureFlow: true,
    matchingGroupId: 'grp-pi-stream-01-03'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  ...DAVOLASH_STUDENTS,
  ...ADDITIONAL_STREAM_STUDENTS,
  ...PEDIATRIYA_STUDENTS
];

export function getStudentsForGroup(group: StudentGroup | undefined, allStudents: Student[]): Student[] {
  if (!group) return [];
  if (group.isLectureFlow && group.constituentGroupIds && group.constituentGroupIds.length > 0) {
    return allStudents.filter(s => group.constituentGroupIds!.includes(s.groupId));
  }
  return allStudents.filter(s => s.groupId === group.id);
}

export const INITIAL_CURRICULUM: CurriculumTopic[] = OFFICIAL_CURRICULUM;

export const INITIAL_INDEPENDENT_TOPICS: IndependentTopic[] = OFFICIAL_INDEPENDENT_TOPICS;
export { INITIAL_PRACTICAL_TASKS };

export const INITIAL_SESSIONS: LessonSession[] = [
  // Session 1: DI- 25-01 (Amaliyot, 07-xona, 1-hafta)
  {
    id: 'ses-di01-1',
    groupId: 'grp-di-25-01',
    date: '2026-09-23',
    weekNumber: 1,
    lessonType: 'amaliy',
    topicId: 'prac-a1',
    topicTitle: 'Biokimyo fani, fermentlar va moddalar almashinuviga kirish.',
    room: '07-auditoriya',
    completed: true,
    attendance: {
      'st-01-01': { studentId: 'st-01-01', status: 'present', grade: 5, hasKonspekt: true },
      'st-01-02': { studentId: 'st-01-02', status: 'present', grade: 4, hasKonspekt: true },
      'st-01-03': { studentId: 'st-01-03', status: 'absent', note: 'Sababsiz kelmagan (2 soat NB)' },
      'st-01-04': { studentId: 'st-01-04', status: 'present', grade: 5, hasKonspekt: false },
      'st-01-05': { studentId: 'st-01-05', status: 'no_uniform', note: 'Formasiz keldi' },
      'st-01-06': { studentId: 'st-01-06', status: 'late', lateMinutes: 15, lateReason: 'Transport kechikishi' },
      'st-01-07': { studentId: 'st-01-07', status: 'present', grade: 4, hasKonspekt: true },
      'st-01-08': { studentId: 'st-01-08', status: 'present', grade: 5, hasKonspekt: true }
    }
  },
  // Session 2: DI- 25-22 (Amaliyot, 411-xona, 2-hafta)
  {
    id: 'ses-di22-1',
    groupId: 'grp-di-25-22',
    date: '2026-09-29',
    weekNumber: 2,
    lessonType: 'amaliy',
    topicId: 'prac-a2',
    topicTitle: 'Biologik oksidlanish.',
    room: '411-auditoriya',
    completed: true,
    attendance: {
      'st-22-01': { studentId: 'st-22-01', status: 'present', grade: 5, hasKonspekt: true },
      'st-22-02': { studentId: 'st-22-02', status: 'late', lateMinutes: 10, lateReason: 'Kechikdi' },
      'st-22-03': { studentId: 'st-22-03', status: 'absent', note: 'Darsda yo\'q (2 soat NB)' },
      'st-22-04': { studentId: 'st-22-04', status: 'present', grade: 4, hasKonspekt: true },
      'st-22-05': { studentId: 'st-22-05', status: 'present', grade: 5, hasKonspekt: true },
      'st-22-06': { studentId: 'st-22-06', status: 'no_uniform', note: 'Formasiz kelgan' }
    }
  },
  // Session 3: DI-25-01-02-03 (1-Oqim Ma'ruzasi, 413-xona, 2-hafta)
  {
    id: 'ses-lec-stream1-1',
    groupId: 'grp-di-stream-01-03',
    date: '2026-10-02',
    weekNumber: 2,
    lessonType: 'maruza',
    topicId: 'lec-m2',
    topicTitle: 'Biologik oksidlanish. Mitoxondriyal nafas zanjiri. ATF biosintezi.',
    room: '413-auditoriya',
    completed: true,
    attendance: {
      'st-01-01': { studentId: 'st-01-01', status: 'present' },
      'st-01-02': { studentId: 'st-01-02', status: 'present' },
      'st-01-03': { studentId: 'st-01-03', status: 'absent', note: 'Ma\'ruzada qatnashmadi (2 soat NB)' },
      'st-01-04': { studentId: 'st-01-04', status: 'present' },
      'st-01-05': { studentId: 'st-01-05', status: 'present' }
    }
  }
];

export const INITIAL_MAKEUPS: MakeupRecord[] = [
  {
    id: 'mk-di01-03-amaliy',
    studentId: 'st-01-03',
    groupId: 'grp-di-25-01',
    missedSessionId: 'ses-di01-1',
    missedDate: '2026-09-23',
    missedTopic: 'Biokimyo fani, fermentlar va moddalar almashinuviga kirish.',
    lessonType: 'amaliy',
    submittedDate: '2026-09-27',
    status: 'submitted',
    score: 85,
    submissionType: 'ogzaki',
    teacherNote: 'Amaliyot bo\'yicha og\'zaki so\'rovda to\'liq topshirdi.',
    recordedAt: '2026-09-27T12:00:00Z'
  },
  {
    id: 'mk-di01-03-maruza',
    studentId: 'st-01-03',
    groupId: 'grp-di-25-01',
    missedSessionId: 'ses-lec-stream1-1',
    missedDate: '2026-10-02',
    missedTopic: 'Biologik oksidlanish. Mitoxondriyal nafas zanjiri. ATF biosintezi.',
    lessonType: 'maruza',
    status: 'pending',
    submissionType: 'savol_javob',
    teacherNote: 'Ma\'ruza konspektini taqdim etishi va savol-javob topshirishi zarur.',
    recordedAt: '2026-10-02T15:00:00Z'
  },
  {
    id: 'mk-di22-03',
    studentId: 'st-22-03',
    groupId: 'grp-di-25-22',
    missedSessionId: 'ses-di22-1',
    missedDate: '2026-09-29',
    missedTopic: 'Biologik oksidlanish.',
    lessonType: 'amaliy',
    status: 'pending',
    submissionType: 'savol_javob',
    teacherNote: 'Laboratoriya ishini qayta topshirishi lozim.',
    recordedAt: '2026-09-29T16:00:00Z'
  }
];

export const INITIAL_ASSIGNMENTS: StudentIndependentAssignment[] = (() => {
  const result: StudentIndependentAssignment[] = [];
  const groupMap: Record<string, Student[]> = {};

  INITIAL_STUDENTS.forEach((st) => {
    if (!groupMap[st.groupId]) groupMap[st.groupId] = [];
    groupMap[st.groupId].push(st);
  });

  Object.entries(groupMap).forEach(([grpId, studentList]) => {
    studentList.forEach((st, idx) => {
      // 1-tartibdagi talaba 1-mavzu, 2-tartibdagi 2-mavzu, 15-dan keyingi (16-talaba) yana 1-mavzu
      const topic = OFFICIAL_INDEPENDENT_TOPICS[idx % OFFICIAL_INDEPENDENT_TOPICS.length];
      result.push({
        id: `asg-${st.id}`,
        studentId: st.id,
        groupId: grpId,
        topicId: topic.id,
        assignedDate: '2026-09-20',
        deadline: '2026-10-25',
        status: idx === 0 ? 'completed' : idx === 1 ? 'in_review' : 'assigned',
        score: idx === 0 ? 25 : undefined,
        submissionDate: idx === 0 ? '2026-10-02' : undefined,
        feedback: idx === 0 ? "A'lo darajada tayyorlangan referat va taqdimot." : undefined
      });
    });
  });

  return result;
})();
