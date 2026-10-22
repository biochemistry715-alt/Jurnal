import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Share2,
  Send,
  Calendar,
  Layers,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklyScheduleSlot } from '../types';
import {
  calculateSlotDate,
  getAcademicWeekNumber,
  getWeekDates,
  TOTAL_SEMESTER_WEEKS,
  getGroupSlotStatus
} from '../utils/academicCalendar';
import { ShareToStudentsModal } from './modals/ShareToStudentsModal';
import { ScheduleEditModal } from './modals/ScheduleEditModal';
import { InternshipModal } from './modals/InternshipModal';

export const ScheduleView: React.FC = () => {
  const {
    schedule,
    groups,
    curriculum,
    startSessionForGroup,
    teacherName,
    addScheduleSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
    resetScheduleToDefault
  } = useApp();

  // Active week selection (default to Week 4 as requested starting 19-October)
  const currentAcademicWeek = getAcademicWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    // 19-oktyabrdan 4-hafta
    return 4;
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<WeeklyScheduleSlot | null>(null);
  const [targetDayForNewSlot, setTargetDayForNewSlot] = useState<WeeklyScheduleSlot['dayOfWeek']>('dushanba');
  const [confirmDeleteSlotId, setConfirmDeleteSlotId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const days: Array<{
    id: WeeklyScheduleSlot['dayOfWeek'];
    name: string;
    dayNum: number;
  }> = [
    { id: 'dushanba', name: 'Dushanba', dayNum: 1 },
    { id: 'seshanba', name: 'Seshanba', dayNum: 2 },
    { id: 'chorshanba', name: 'Chorshanba', dayNum: 3 },
    { id: 'payshanba', name: 'Payshanba', dayNum: 4 },
    { id: 'juma', name: 'Juma', dayNum: 5 }
  ];

  const handleOpenAttendance = (slot: WeeklyScheduleSlot) => {
    const match =
      groups.find((g) => g.id === slot.matchingGroupId) ||
      groups.find((g) => g.name.toLowerCase().includes(slot.groupCode.toLowerCase().replace(/\s+/g, '')));

    const dateInfo = calculateSlotDate(selectedWeek, slot.dayOfWeek);

    if (match) {
      startSessionForGroup(
        match.id,
        slot.type,
        slot.room ? `${slot.room}-auditoriya` : undefined,
        undefined,
        dateInfo.isoDate
      );
    } else if (groups.length > 0) {
      startSessionForGroup(
        groups[0].id,
        slot.type,
        slot.room ? `${slot.room}-auditoriya` : undefined,
        undefined,
        dateInfo.isoDate
      );
    }
  };

  const handleOpenCreateSlot = (day?: WeeklyScheduleSlot['dayOfWeek']) => {
    setSlotToEdit(null);
    if (day) setTargetDayForNewSlot(day);
    setIsEditModalOpen(true);
  };

  const handleOpenEditSlot = (slot: WeeklyScheduleSlot) => {
    setSlotToEdit(slot);
    setIsEditModalOpen(true);
  };

  const handleSaveSlot = (slotData: Omit<WeeklyScheduleSlot, 'id'>, existingId?: string) => {
    if (existingId) {
      updateScheduleSlot({ ...slotData, id: existingId });
      showToast(`✅ ${slotData.groupCode} darsi (${slotData.dayNameUz}, ${slotData.pairTime}) muvaffaqiyatli saqlandi!`);
    } else {
      addScheduleSlot(slotData);
      showToast(`✅ Yangi dars: ${slotData.groupCode} (${slotData.dayNameUz}, ${slotData.pairTime}) jadvalga qo'shildi!`);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    const slotObj = schedule.find((s) => s.id === slotId);
    deleteScheduleSlot(slotId);
    setConfirmDeleteSlotId(null);
    showToast(`🗑️ ${slotObj?.groupCode || 'Dars'} jadvaldan olib tashlandi!`);
  };

  const totalLectures = schedule.filter((s) => s.type === 'maruza').length;
  const totalPracticals = schedule.filter((s) => s.type === 'amaliy').length;
  const totalSlots = schedule.length;
  const totalHours = totalSlots * 2;
  const weekDates = getWeekDates(selectedWeek);
  const groupsOnInternshipCount = groups.filter((g) => g.internship?.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ======================================================== */}
      {/* TOP BANNER WITH REAL CALENDAR INTEGRATION                */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/30">
                19-oktyabrdan 4-hafta boshlanadi
              </span>
              <span className="text-xs text-slate-300">
                1-semestr / 2026-2027 o'quv yili
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <CalendarDays className="w-6 h-6 text-teal-400" />
              <span>{teacherName} — Dars jadvali</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real kalendar integratsiyasi: har bir kunga mos aniq sanalar, dars raqamlari va tasdiqlangan mavzular avtomatik aks ettiriladi.
            </p>
          </div>

          {/* Action Buttons: Practice, Edit Schedule, Add Slot, Share & Telegram */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AMALIYOT BOSHQARUVI TUGMASI (CLINICAL PRACTICE) */}
            <button
              onClick={() => setIsInternshipModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/25 transition flex items-center space-x-1.5"
              title="Guruhlarni 2 haftalik amaliyotga chiqarish va holatini boshqarish"
            >
              <Briefcase className="w-4 h-4" />
              <span>Amaliyot boshqaruvi</span>
              {groupsOnInternshipCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-slate-950 text-amber-300 rounded-full text-[10px] font-black">
                  {groupsOnInternshipCount} ta guruh
                </span>
              )}
            </button>

            <button
              onClick={() => handleOpenCreateSlot('dushanba')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center space-x-1.5"
              title="Jadvalga yangi dars soati qo'shish"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi dars</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
              title="Dars jadvali va portal havolasini talabalarga ulashish"
            >
              <Share2 className="w-4 h-4 text-teal-400" />
              <span>Guruh linklari (Ulashish)</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            {confirmReset ? (
              <div className="flex items-center space-x-1.5 bg-rose-500/15 border border-rose-500/30 p-1 rounded-xl">
                <span className="text-[10px] text-rose-300 font-bold px-1">Qaytarilsinmi?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetScheduleToDefault();
                    setConfirmReset(false);
                    showToast("Dars jadvali dastlabki holatga qaytarildi");
                  }}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px]"
                >
                  Ha
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                >
                  Yo'q
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="p-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
                title="Dastlabki jadvalga qaytarish"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* TOAST ALERT MESSAGE */}
        {toastMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-xs text-teal-200 flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center space-x-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-teal-300 hover:text-white text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* CLINICAL PRACTICE ANNOUNCEMENT BANNER */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 shrink-0 border border-amber-500/30">
              <Briefcase className="w-4 h-4" />
            </span>
            <div className="space-y-1">
              <div className="text-white font-black text-sm flex items-center space-x-2 flex-wrap">
                <span>Davolash ishi 1–12 guruhlari 12.10.2026 dan 2 haftalik amaliyotda!</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Hozir amaliyotda (12.10 – 25.10)
                </span>
              </div>
              <p className="text-amber-100/90 text-xs leading-relaxed max-w-4xl">
                12-oktyabrdan boshlab Davolash ishi 1-guruhdan 12-guruhgacha bo'lgan barcha 12 ta guruh 2 haftalik amaliyotga chiqqan. Ushbu davrda ularning darslari to'xtatilgan. Amaliyotdan qaytgach (<strong>26-oktyabr, 5-haftadan</strong>), darslari o'tkazib yuborilmay, to'xtatilgan joyidan (<strong>3-darsdan</strong>) navbatma-navbat davom etadi. Qolgan barcha guruhlar odatiy dars jadvali bo'yicha davom etmoqda.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInternshipModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center space-x-1.5 transition self-start md:self-auto shadow-md"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Amaliyotni boshqarish</span>
          </button>
        </div>

        {/* Notice on schedule change & DI-25-22 */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-teal-950/50 border border-teal-500/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start space-x-2.5">
            <span className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400 mt-0.5 border border-teal-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <div className="text-white font-black text-sm flex items-center space-x-2 flex-wrap">
                <span>DI-25-22 guruhi darsi Dushanba 2-paraga (10:00 - 11:20, 312-xona) ko'chirilgan!</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black">
                  Ko'chirilgan
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Dars jadvali: Dushanba (3 dars: 413, 312 [DI-25-22], 101), Seshanba (2 dars), Chorshanba (2 dars), Payshanba (2 dars) va Juma (1 dars). Har bir dars vaqtini o'zgartirish, yangi dars qo'shish yoki olib tashlash mumkin.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleOpenCreateSlot('dushanba')}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md shadow-teal-500/25 flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dars qo'shish</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* WEEK SELECTOR BAR (1 to 12 WEEKS)                        */}
        {/* ======================================================== */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>O'quv haftasini tanlang:</span>
            <span className="text-teal-300 font-mono">({weekDates.formattedRange})</span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
            {Array.from({ length: TOTAL_SEMESTER_WEEKS }, (_, i) => i + 1).map((w) => {
              const isSelected = selectedWeek === w;
              const isWeek4 = w === 4;

              return (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/25'
                      : isWeek4
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  <span>{w}-hafta</span>
                  {isWeek4 && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                      19-okt
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Calendar Banner Info */}
        <div className="mt-3 bg-teal-500/10 border border-teal-500/20 rounded-xl px-3.5 py-2 text-xs text-teal-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/20 font-black text-[10px] uppercase border border-teal-500/30">
              {selectedWeek}-hafta rejasi
            </span>
            <span>
              {selectedWeek === 4 ? (
                <>
                  <strong>19-oktyabr Dushanbadan 4-hafta boshlanadi:</strong> Dushanba, Seshanba, Chorshanba va Juma guruhlariga <strong>4-dars</strong>; Payshanba guruhlariga 1-oktyabr bayrami sababli <strong>3-dars</strong>.
                </>
              ) : (
                <>
                  Hafta sanalari: <strong>{weekDates.formattedRange}</strong>
                </>
              )}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono shrink-0">
            Haftalik yuklama: 10 ta para (20 soat)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISUAL SCHEDULE BOARD WITH REAL DATES AND TOPICS (5 KUNLIK HAFTA) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySlots = schedule.filter((s) => s.dayOfWeek === day.id);
          const hasClasses = daySlots.length > 0;
          const dateInfo = calculateSlotDate(selectedWeek, day.id);

          return (
            <div
              key={day.id}
              className={`rounded-3xl border shadow-xl overflow-hidden flex flex-col ${
                hasClasses ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/60 border-slate-800/60 opacity-80'
              }`}
            >
              {/* Day Header with exact calendar date */}
              <div className="bg-amber-400 text-slate-950 px-4 py-2.5 flex items-center justify-between font-black text-xs sm:text-sm tracking-wide shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="uppercase">{day.name}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/15">
                    {dateInfo.formattedDate}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-950/15">
                    {hasClasses ? `${daySlots.length} ta dars` : "Dars yo'q"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateSlot(day.id)}
                    className="p-1 rounded-md bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition flex items-center"
                    title={`${day.name} kuniga dars qo'shish`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Lessons List */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {hasClasses ? (
                  <div className="space-y-3">
                    {daySlots.map((slot) => {
                      const isLecture = slot.type === 'maruza';
                      const matchGroup =
                        groups.find((g) => g.id === slot.matchingGroupId) ||
                        groups.find((g) => g.name.toLowerCase().includes(slot.groupCode.toLowerCase().replace(/\s+/g, '')));

                      const slotStatus = getGroupSlotStatus(matchGroup, selectedWeek, day.id);
                      const effectiveLessonNum = slotStatus.effectiveLessonNumber;

                      // Find topic for this week & type
                      const matchingTopic = curriculum.find(
                        (c) => c.type === slot.type && c.order === effectiveLessonNum
                      );

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                            slotStatus.isOnInternship
                              ? 'bg-amber-950/25 border-amber-500/60 shadow-lg shadow-amber-950/30'
                              : isLecture
                              ? 'bg-purple-950/25 border-purple-800/50 hover:border-purple-600/70'
                              : 'bg-teal-950/20 border-teal-800/50 hover:border-teal-600/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                slotStatus.isOnInternship
                                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                  : isLecture
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}
                            >
                              {slot.pairNumber}-para ({slot.pairTime})
                            </span>

                            <span className="flex items-center space-x-1 text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              <span>{slot.room}-xona</span>
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-black text-base text-white tracking-wide flex items-center space-x-2 flex-wrap gap-y-1">
                                <span>{slot.groupCode}</span>
                                {slot.groupCode === 'DI-25-22' && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-teal-400 text-slate-950 shadow">
                                    Dushanba 2-para
                                  </span>
                                )}
                                {slotStatus.isOnInternship && (
                                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                                    Amaliyotda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1.5 flex-wrap">
                                <span>{isLecture ? "🟣 Oqim ma'ruzasi" : "🟢 Amaliy mashg'ulot"}</span>
                                <span>•</span>
                                {slotStatus.isOnInternship ? (
                                  <span className="text-amber-300 font-bold flex items-center space-x-1">
                                    <Briefcase className="w-3 h-3 text-amber-400" />
                                    <span>Klinik amaliyotda</span>
                                  </span>
                                ) : slotStatus.isResumedAfterInternship ? (
                                  <span className="text-emerald-300 font-bold">
                                    {effectiveLessonNum}-dars (Qaytgan)
                                  </span>
                                ) : (
                                  <strong className="text-amber-300">{effectiveLessonNum}-dars</strong>
                                )}
                              </div>
                            </div>

                            {/* Actions: Edit, Delete, Attendance */}
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSlot(slot)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Dars vaqti va xonasini tahrirlash"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteSlotId(confirmDeleteSlotId === slot.id ? null : slot.id)}
                                className={`p-1.5 rounded-xl transition ${
                                  confirmDeleteSlotId === slot.id
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                }`}
                                title="Darsni jadvaldan olib tashlash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAttendance(slot)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1 shadow shrink-0 ${
                                  slotStatus.isOnInternship
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    : isLecture
                                    ? 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                                }`}
                                title={slotStatus.isOnInternship ? "Guruh amaliyotda" : "Ushbu dars uchun davomat qilish"}
                              >
                                <span>{slotStatus.isOnInternship ? "Amaliyot" : "Davomat"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* INLINE DELETE CONFIRMATION BOX */}
                          {confirmDeleteSlotId === slot.id && (
                            <div className="bg-rose-950/90 border border-rose-500/50 p-2.5 rounded-xl text-center space-y-2 animate-in fade-in">
                              <div className="text-xs font-bold text-rose-200">
                                {slot.groupCode} ({slot.pairTime}) darsi jadvaldan olib tashlansinmi?
                              </div>
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow"
                                >
                                  Ha, olib tashlash
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteSlotId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs"
                                >
                                  Bekor
                                </button>
                              </div>
                            </div>
                          )}

                          {/* INTERNSHIP NOTICE OR TOPIC PREVIEW */}
                          {slotStatus.isOnInternship ? (
                            <div className="bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/30 text-xs space-y-1">
                              <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center space-x-1">
                                <Briefcase className="w-3 h-3" />
                                <span>2 haftalik amaliyotda (12.10 – 25.10):</span>
                              </div>
                              <p className="text-amber-100/90 text-xs leading-snug">
                                Darslar to'xtatilgan. Amaliyotdan so'ng (26-oktyabrdan) dars <strong>3-darsdan</strong> davom etadi.
                              </p>
                            </div>
                          ) : (
                            matchingTopic && (
                              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{matchingTopic.code || `${effectiveLessonNum}-mavzu`}:</span>
                                  {slotStatus.isResumedAfterInternship && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                                      Amaliyotdan qaytgan
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-slate-200 text-xs leading-snug line-clamp-2">
                                  {matchingTopic.title}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs italic">
                    Ushbu kunda dars mashg'ulotlari rejalashtirilmagan.
                  </div>
                )}

                {hasClasses && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Kunlik yuklama:</span>
                    <strong className="text-slate-300">{daySlots.length * 2} akademik soat</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* COMPLETE TIMETABLE TABLE FOR PRINT / EXPORT              */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="font-black text-white text-base flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-400" />
              <span>{selectedWeek}-hafta darslarining to'liq jadvali va mavzulari</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sana: {weekDates.formattedRange} • 10 ta para (20 soat)
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Guruhlarga ulashish</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-850 text-slate-300 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-3">Sana & Kun</th>
                <th className="py-3 px-3">Para</th>
                <th className="py-3 px-3">Vaqt</th>
                <th className="py-3 px-4">Guruh / Oqim</th>
                <th className="py-3 px-3">Xona</th>
                <th className="py-3 px-3">Turi & Dars №</th>
                <th className="py-3 px-4">O'tiladigan rasmiy mavzu</th>
                <th className="py-3 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {schedule.map((slot) => {
                const isLecture = slot.type === 'maruza';
                const dateInfo = calculateSlotDate(selectedWeek, slot.dayOfWeek);
                const matchGroup =
                  groups.find((g) => g.id === slot.matchingGroupId) ||
                  groups.find((g) => g.name.toLowerCase().includes(slot.groupCode.toLowerCase().replace(/\s+/g, '')));
                const slotStatus = getGroupSlotStatus(matchGroup, selectedWeek, slot.dayOfWeek);
                const effectiveLesson = slotStatus.effectiveLessonNumber;
                const topic = curriculum.find(
                  (c) => c.type === slot.type && c.order === effectiveLesson
                );

                return (
                  <tr
                    key={slot.id}
                    className={`transition ${
                      slotStatus.isOnInternship ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'hover:bg-slate-850/60'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-amber-300 whitespace-nowrap">
                      {dateInfo.dayNameUz}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {dateInfo.formattedDate}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">{slot.pairNumber}-para</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{slot.pairTime}</td>
                    <td className="py-3 px-4 font-black text-white">
                      <div className="flex items-center space-x-1.5">
                        <span className={isLecture ? 'text-purple-300' : 'text-teal-300'}>
                          {slot.groupCode}
                        </span>
                        {slotStatus.isOnInternship && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                            Amaliyot
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">{slot.room}</td>
                    <td className="py-3 px-3">
                      {slotStatus.isOnInternship ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🏥 Amaliyotda
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLecture
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {isLecture ? `Ma'ruza (${effectiveLesson}-dars)` : `Amaliyot (${effectiveLesson}-dars)`}
                          {slotStatus.isResumedAfterInternship && ' (Qaytgan)'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {slotStatus.isOnInternship ? (
                        <span className="text-amber-200/90 text-xs italic font-medium">
                          2 haftalik amaliyotda — dars to'xtatilgan (26-oktdan 3-darsdan davom etadi)
                        </span>
                      ) : topic ? (
                        <div className="font-semibold text-slate-200 text-xs truncate" title={topic.title}>
                          {topic.code ? `${topic.code}: ` : ''}{topic.title}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditSlot(slot)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Dars vaqtini tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteSlotId === slot.id ? (
                          <div className="flex items-center space-x-1 bg-rose-500/20 border border-rose-500/40 p-1 rounded-lg">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                            >
                              O'chirish
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSlotId(null)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteSlotId(slot.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Darsni jadvaldan olib tashlash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenAttendance(slot)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                            slotStatus.isOnInternship
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                              : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30'
                          }`}
                        >
                          {slotStatus.isOnInternship ? 'Amaliyot' : 'Davomat'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      <ShareToStudentsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        groups={groups}
        schedule={schedule}
        curriculum={curriculum}
        selectedWeek={selectedWeek}
        teacherName={teacherName}
      />

      {/* Schedule Edit Modal */}
      <ScheduleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        slotToEdit={slotToEdit}
        initialDay={targetDayForNewSlot}
        groups={groups}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
      />

      {/* Internship Management Modal (Amaliyot boshqaruvi) */}
      <InternshipModal
        isOpen={isInternshipModalOpen}
        onClose={() => setIsInternshipModalOpen(false)}
      />
    </div>
  );
};
