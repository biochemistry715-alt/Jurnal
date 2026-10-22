/**
 * AKADEMIK REAL KALENDAR INTEGRATSIYASI
 * 2026-2027 o'quv yili, 1-semestr
 * 
 * Kalendar qoidalari:
 * - Semestr boshlanishi: 2026-09-28 (Dushanba, 1-hafta)
 * - 1-oktyabr (Payshanba) — O'qituvchi va murabbiylar kuni (bayram/dam olish kuni)
 *   Shu sababli Payshanba darslari 1 hafta surilgan holda kechadi.
 * - 19-oktyabrdan (2026-10-19) — 4-HAFTA BOSHLANADI!
 *   (Dushanba, Seshanba, Chorshanba, Juma guruhlariga 4-dars; Payshanbaga 3-dars)
 */

import { StudentGroup } from '../types';

export const SEMESTER_START_MONDAY = '2026-09-28';
export const TOTAL_SEMESTER_WEEKS = 12;

export interface AcademicWeekInfo {
  weekNumber: number;
  startDateIso: string;
  endDateIso: string;
  formattedRange: string;
  isCurrent: boolean;
  thursdayLessonNumber: number;
  regularLessonNumber: number;
}

export const DAY_OFFSETS: Record<string, number> = {
  dushanba: 0,
  seshanba: 1,
  chorshanba: 2,
  payshanba: 3,
  juma: 4,
  shanba: 5,
  yakshanba: 6
};

export const UZ_DAY_NAMES: Record<string, string> = {
  dushanba: 'Dushanba',
  seshanba: 'Seshanba',
  chorshanba: 'Chorshanba',
  payshanba: 'Payshanba',
  juma: 'Juma',
  shanba: 'Shanba',
  yakshanba: 'Yakshanba'
};

export const UZ_MONTH_NAMES_GENITIVE = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
];

/**
 * Berilgan sana bo'yicha akademik hafta raqamini hisoblash (1..12)
 * 19-oktyabr 2026 ➔ 4-hafta
 */
export function getAcademicWeekNumber(targetDate: Date = new Date()): number {
  const base = new Date(SEMESTER_START_MONDAY + 'T00:00:00');
  const d = new Date(targetDate);
  d.setHours(0, 0, 0, 0);

  const diffTime = d.getTime() - base.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;
  const calculated = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(calculated, 1), TOTAL_SEMESTER_WEEKS);
}

/**
 * Hafta raqami uchun sana oralig'ini hisoblash (Dushanbadan Jumagacha - 5 kunlik dars haftasi)
 */
export function getWeekDates(weekNumber: number): {
  monday: Date;
  friday: Date;
  saturday: Date;
  mondayIso: string;
  fridayIso: string;
  saturdayIso: string;
  formattedRange: string;
} {
  const base = new Date(SEMESTER_START_MONDAY + 'T00:00:00');
  const monday = new Date(base);
  monday.setDate(base.getDate() + (weekNumber - 1) * 7);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const formatIso = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const mondayDay = monday.getDate();
  const fridayDay = friday.getDate();
  const mondayMonth = UZ_MONTH_NAMES_GENITIVE[monday.getMonth()];
  const fridayMonth = UZ_MONTH_NAMES_GENITIVE[friday.getMonth()];

  let formattedRange = '';
  if (mondayMonth === fridayMonth) {
    formattedRange = `${mondayDay} – ${fridayDay}-${mondayMonth} ${friday.getFullYear()}`;
  } else {
    formattedRange = `${mondayDay}-${mondayMonth} – ${fridayDay}-${fridayMonth} ${friday.getFullYear()}`;
  }

  return {
    monday,
    friday,
    saturday,
    mondayIso: formatIso(monday),
    fridayIso: formatIso(friday),
    saturdayIso: formatIso(saturday),
    formattedRange
  };
}

/**
 * Barcha 12 ta haftaning ma'lumotlari ro'yxati
 */
export function getAllAcademicWeeks(currentDate: Date = new Date()): AcademicWeekInfo[] {
  const currentWeek = getAcademicWeekNumber(currentDate);

  const list: AcademicWeekInfo[] = [];
  for (let w = 1; w <= TOTAL_SEMESTER_WEEKS; w++) {
    const dates = getWeekDates(w);
    list.push({
      weekNumber: w,
      startDateIso: dates.mondayIso,
      endDateIso: dates.saturdayIso,
      formattedRange: dates.formattedRange,
      isCurrent: w === currentWeek,
      thursdayLessonNumber: Math.max(w - 1, 1), // 1-oktyabr bayrami sababli payshanba 1 dars orqada
      regularLessonNumber: w
    });
  }
  return list;
}

/**
 * Aniq hafta va kun uchun sana hisoblash (masalan: 4-hafta Dushanba ➔ 2026-10-19)
 */
export function calculateSlotDate(weekNumber: number, dayOfWeek: string): {
  isoDate: string;
  formattedDate: string;
  dayNameUz: string;
  isHoliday?: boolean;
  holidayName?: string;
  effectiveLessonNumber: number;
} {
  const dates = getWeekDates(weekNumber);
  const offset = DAY_OFFSETS[dayOfWeek.toLowerCase()] ?? 0;

  const target = new Date(dates.monday);
  target.setDate(dates.monday.getDate() + offset);

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const isoDate = `${year}-${month}-${day}`;

  // 1-oktyabr bayram tekshiruvi
  const isOct1Holiday = isoDate === '2026-10-01';

  // Payshanba guruhlarining dars raqami: 1-oktyabrda dars o'tilmagan, shuning uchun
  // 8-oktyabr (2-hafta) -> 1-dars
  // 15-oktyabr (3-hafta) -> 2-dars
  // 22-oktyabr (4-hafta) -> 3-dars
  const isThursday = dayOfWeek.toLowerCase() === 'payshanba';
  const effectiveLessonNumber = isThursday
    ? (isOct1Holiday ? 0 : Math.max(weekNumber - 1, 1))
    : weekNumber;

  return {
    isoDate,
    formattedDate: `${day}.${month}.${year}`,
    dayNameUz: UZ_DAY_NAMES[dayOfWeek.toLowerCase()] || dayOfWeek,
    isHoliday: isOct1Holiday,
    holidayName: isOct1Holiday ? "1-oktyabr — O'qituvchilar va murabbiylar kuni (Dam olish kuni)" : undefined,
    effectiveLessonNumber
  };
}

export interface GroupSlotStatusInfo {
  isoDate: string;
  formattedDate: string;
  dayNameUz: string;
  isHoliday?: boolean;
  holidayName?: string;
  isOnInternship: boolean;
  internshipTitle?: string;
  internshipNote?: string;
  effectiveLessonNumber: number;
  statusLabel: string;
  isPaused: boolean;
  isResumedAfterInternship: boolean;
}

/**
 * Guruhning amaliyot davrini inobatga olgan holda haftalik slot holatini hisoblash:
 * - Agar guruh ayni haftada amaliyotda bo'lsa: darslar to'xtatilgan, isOnInternship = true
 * - Agar guruh amaliyotdan qaytgan bo'lsa (masalan 5-haftadan): darslar kelgan joyidan (3-darsdan) davom etadi!
 */
export function getGroupSlotStatus(
  group: StudentGroup | undefined,
  weekNumber: number,
  dayOfWeek: string
): GroupSlotStatusInfo {
  const baseSlot = calculateSlotDate(weekNumber, dayOfWeek);

  if (!group || !group.internship?.isActive) {
    return {
      ...baseSlot,
      isOnInternship: false,
      statusLabel: `${baseSlot.effectiveLessonNumber}-dars`,
      isPaused: false,
      isResumedAfterInternship: false
    };
  }

  const { startWeek, resumeWeek, durationWeeks, pausedLessonNumber, title, note } = group.internship;

  // Guruh ayni paytda amaliyotda bo'lgan haftalar (masalan: 3 va 4-haftalar, 12.10 - 25.10)
  if (weekNumber >= startWeek && weekNumber < resumeWeek) {
    return {
      ...baseSlot,
      isOnInternship: true,
      internshipTitle: title || '2 haftalik klinik amaliyot',
      internshipNote: note || "Klinik amaliyotda — darslar to'xtatilgan",
      effectiveLessonNumber: pausedLessonNumber,
      statusLabel: 'Klinik amaliyotda',
      isPaused: true,
      isResumedAfterInternship: false
    };
  }

  // Amaliyotdan qaytgan haftalar (masalan: 5-hafta va undan keyin, 26-oktyabrdan boshlab)
  if (weekNumber >= resumeWeek) {
    const adjustedLessonNumber = Math.max(baseSlot.effectiveLessonNumber - durationWeeks, 1);
    return {
      ...baseSlot,
      isOnInternship: false,
      internshipTitle: title,
      internshipNote: note,
      effectiveLessonNumber: adjustedLessonNumber,
      statusLabel: `${adjustedLessonNumber}-dars (Qaytgan)`,
      isPaused: false,
      isResumedAfterInternship: true
    };
  }

  // Amaliyotdan oldingi haftalar (1 va 2-haftalar)
  return {
    ...baseSlot,
    isOnInternship: false,
    statusLabel: `${baseSlot.effectiveLessonNumber}-dars`,
    isPaused: false,
    isResumedAfterInternship: false
  };
}
