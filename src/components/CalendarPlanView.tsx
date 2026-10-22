import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  CalendarDays,
  MapPin,
  Printer,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  Filter,
  Users,
  GraduationCap,
  SlidersHorizontal,
  Share2,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CurriculumTopic, LessonType, StudentGroup, WeeklyScheduleSlot } from '../types';
import { ShareToStudentsModal } from './modals/ShareToStudentsModal';

export const CalendarPlanView: React.FC = () => {
  const {
    groups,
    schedule,
    curriculum,
    sessions,
    startSessionForGroup,
    teacherName
  } = useApp();

  // Primary Tab: 'maruza' (12 topics) vs 'amaliy' (10 topics)
  const [activePlanTab, setActivePlanTab] = useState<'maruza' | 'amaliy'>('maruza');

  // Sub-filter: selected group or 'all'
  const [selectedPlanGroupId, setSelectedPlanGroupId] = useState<string>('all');

  // View Mode: 'list' (Detailed thematic plan with dates) vs 'calendar' (Monthly calendar view)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Semester start date (Monday of Week 1). Defaults to 2026-09-28
  const [semesterStartDate, setSemesterStartDate] = useState<string>('2026-09-28');
  const [showDateSettings, setShowDateSettings] = useState(false);

  // Month navigation for Calendar mode
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(9); // 9 = October (0-indexed)
  const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(2026);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 4 Lecture Streams (Oqimlar)
  const lectureStreams = useMemo(() => {
    return groups.filter((g) => g.isLectureFlow);
  }, [groups]);

  // 6 Practical Groups (hasPractical: true)
  const practicalGroups = useMemo(() => {
    return groups.filter((g) => !g.isLectureFlow && g.hasPractical === true);
  }, [groups]);

  // Topics for active tab
  const lectureTopics = useMemo(() => {
    return curriculum.filter((t) => t.type === 'maruza').sort((a, b) => a.order - b.order);
  }, [curriculum]);

  const practicalTopics = useMemo(() => {
    return curriculum.filter((t) => t.type === 'amaliy').sort((a, b) => a.order - b.order);
  }, [curriculum]);

  const activeTopics = activePlanTab === 'maruza' ? lectureTopics : practicalTopics;

  // Day offset helper from Monday (0 to 6)
  const DAY_OFFSET: Record<string, number> = {
    dushanba: 0,
    seshanba: 1,
    chorshanba: 2,
    payshanba: 3,
    juma: 4,
    shanba: 5
  };

  const UZ_MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  // Helper to find the schedule slot for a given group
  const getSlotForGroup = (groupId: string, lessonType: LessonType): WeeklyScheduleSlot | undefined => {
    const grp = groups.find((g) => g.id === groupId);
    if (!grp) return undefined;

    return schedule.find((s) => {
      if (s.type !== lessonType) return false;
      if (s.matchingGroupId === grp.id) return true;
      const cleanGrp = grp.name.replace(/\s+/g, '').toLowerCase();
      const cleanSlot = s.groupCode.replace(/\s+/g, '').toLowerCase();
      return cleanSlot.includes(cleanGrp) || cleanGrp.includes(cleanSlot);
    });
  };

  // Helper to calculate exact date string for a given week and schedule slot
  const calculateDateForWeek = (weekNumber: number, slot?: WeeklyScheduleSlot): {
    isoDate: string;
    formattedDate: string;
    dayNameUz: string;
  } => {
    if (!semesterStartDate) {
      return { isoDate: '', formattedDate: `${weekNumber}-hafta`, dayNameUz: '' };
    }

    const baseMonday = new Date(semesterStartDate);
    const dayOffset = slot ? (DAY_OFFSET[slot.dayOfWeek] ?? 0) : 0;
    const targetDate = new Date(baseMonday);

    // 1-oktyabr (Payshanba) bayram bo'lgani sababli, Payshanba guruhlarining 1-darsi 8-oktyabrdan boshlanadi (+1 hafta suriladi)
    const isThursdayHolidayShift = slot?.dayOfWeek === 'payshanba';
    const effectiveWeekOffset = isThursdayHolidayShift ? weekNumber : (weekNumber - 1);
    targetDate.setDate(baseMonday.getDate() + effectiveWeekOffset * 7 + dayOffset);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    const dayNameUz = slot?.dayNameUz || 'Dars kuni';
    const formattedDate = `${day}.${month}.${year}`;

    return { isoDate, formattedDate, dayNameUz };
  };

  // Check if a topic was taught for a specific group
  const getTopicCompletion = (groupId: string, topic: CurriculumTopic, scheduledIsoDate: string) => {
    // Check if session exists for this group with this topicId or similar topicTitle
    return sessions.find((s) => {
      const groupMatch = s.groupId === groupId;
      const topicMatch =
        s.topicId === topic.id ||
        s.topicTitle.toLowerCase().includes(topic.title.toLowerCase().slice(0, 15)) ||
        s.date === scheduledIsoDate;
      return groupMatch && topicMatch && s.completed;
    });
  };

  // Group filter items based on active tab
  const currentFilterGroups = activePlanTab === 'maruza' ? lectureStreams : practicalGroups;

  // Handle clicking "Dars o'tish (Davomat)"
  const handleLaunchAttendance = (
    targetGroupId: string,
    topic: CurriculumTopic,
    scheduledIsoDate: string,
    slot?: WeeklyScheduleSlot
  ) => {
    startSessionForGroup(
      targetGroupId,
      activePlanTab,
      slot?.room ? `${slot.room}-auditoriya` : undefined,
      scheduledIsoDate,
      topic.title
    );
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Calendar Month Generator
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDayOfMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Monday-based starting day (0 = Monday, 6 = Sunday)
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const days: Array<{
      dayNum: number;
      isoDate: string;
      isCurrentMonth: boolean;
      items: Array<{
        groupId: string;
        groupName: string;
        topic: CurriculumTopic;
        slot?: WeeklyScheduleSlot;
        isCovered: boolean;
      }>;
    }> = [];

    // Empty lead days
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ dayNum: 0, isoDate: '', isCurrentMonth: false, items: [] });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const year = currentCalendarYear;
      const month = String(currentCalendarMonth + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;

      // Find all scheduled lessons on this date
      const items: Array<{
        groupId: string;
        groupName: string;
        topic: CurriculumTopic;
        slot?: WeeklyScheduleSlot;
        isCovered: boolean;
      }> = [];

      // Check for each group and topic
      const groupsToCheck = selectedPlanGroupId === 'all'
        ? currentFilterGroups
        : currentFilterGroups.filter((g) => g.id === selectedPlanGroupId);

      groupsToCheck.forEach((grp) => {
        const slot = getSlotForGroup(grp.id, activePlanTab);
        activeTopics.forEach((top) => {
          const calc = calculateDateForWeek(top.weekDefault, slot);
          if (calc.isoDate === isoDate) {
            const isCovered = Boolean(getTopicCompletion(grp.id, top, isoDate));
            items.push({
              groupId: grp.id,
              groupName: grp.name,
              topic: top,
              slot,
              isCovered
            });
          }
        });
      });

      days.push({
        dayNum: d,
        isoDate,
        isCurrentMonth: true,
        items
      });
    }

    return days;
  }, [currentCalendarYear, currentCalendarMonth, semesterStartDate, selectedPlanGroupId, activePlanTab, currentFilterGroups, activeTopics]);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP HEADER: 2 MAIN TABS (MA'RUZALAR vs AMALIYOT)         */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wider border border-teal-500/30 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>O'quv yili 2026/2027 • Biologik kimyo</span>
              </span>
              <span className="text-xs text-slate-400">
                Ustoz: <strong className="text-slate-200">{teacherName}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2.5">
              <Calendar className="w-7 h-7 text-teal-400" />
              <span>Kalendar-tematik o'quv rejasi</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dars jadvaliga integratsiyalashgan rasmiy reja: qaysi guruhga qaysi sanada qaysi mavzu o'qilishi, auditoriyasi va dars o'tilish nazorati.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowDateSettings(!showDateSettings)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
              title="Semestr boshlanish sanasi sozlamasi"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-400" />
              <span>Semestr sanasi</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-teal-500 hover:bg-teal-400 text-slate-950 transition flex items-center space-x-1.5 shadow-md shadow-teal-500/20"
              title="Dars jadvali va portal havolasini talabalarga ulashish"
            >
              <Share2 className="w-4 h-4" />
              <span>Talabalarga ulashish</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
              title="Kafedraga topshirish uchun chop etish"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Chop etish</span>
            </button>
          </div>
        </div>

        {/* Date Settings Collapsible */}
        {showDateSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs">
              <CalendarDays className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300 font-semibold">Semestr boshlanish sanasi (1-hafta Dushanba):</span>
            </div>
            <input
              type="date"
              value={semesterStartDate}
              onChange={(e) => setSemesterStartDate(e.target.value)}
              className="bg-slate-900 text-teal-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-[11px] text-slate-400">
              Ushbu sana bo'yicha barcha haftalik darslarning kalendar kunlari avtomatik qayta taqsimlanadi.
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2 DISTINCT BIG TABS (MA'RUZALAR vs AMALIY MASHG'ULOTLAR) */}
        {/* ======================================================== */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 sm:w-auto">
            {/* 1. MA'RUZALAR TUGMASI */}
            <button
              onClick={() => {
                setActivePlanTab('maruza');
                setSelectedPlanGroupId('all');
              }}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2.5 ${
                activePlanTab === 'maruza'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 ring-2 ring-purple-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-5 h-5 text-purple-300" />
              <span>Ma'ruzalar</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activePlanTab === 'maruza'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-purple-300'
                }`}
              >
                12 ta mavzu
              </span>
            </button>

            {/* 2. AMALIY MASHG'ULOTLAR TUGMASI */}
            <button
              onClick={() => {
                setActivePlanTab('amaliy');
                setSelectedPlanGroupId('all');
              }}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center space-x-2.5 ${
                activePlanTab === 'amaliy'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-xl shadow-teal-500/30 ring-2 ring-teal-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-5 h-5 text-teal-900" />
              <span>Amaliy mashg'ulotlar</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activePlanTab === 'amaliy'
                    ? 'bg-slate-950/30 text-slate-950'
                    : 'bg-slate-800 text-teal-300'
                }`}
              >
                10 ta mavzu
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Detailed List vs Monthly Calendar */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-end sm:self-center">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-teal-300 shadow border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sana bo'yicha jadval</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-slate-800 text-teal-300 shadow border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Oylik Taqvim</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GROUP SELECTION CHIPS (OQIMLAR YOKI AMALIYOT GURUHLARI)  */}
        {/* ======================================================== */}
        <div className="mt-4 pt-4 border-t border-slate-800/70">
          <div className="text-xs text-slate-400 font-semibold mb-2.5 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {activePlanTab === 'maruza'
                ? "Ma'ruza o'qiladigan Oqimni tanlang:"
                : "Amaliy mashg'ulot o'tiladigan Guruhni tanlang:"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedPlanGroupId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                selectedPlanGroupId === 'all'
                  ? activePlanTab === 'maruza'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                    : 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 ring-2 ring-teal-300'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activePlanTab === 'maruza' ? 'Barcha 4 ta Oqim' : 'Barcha 6 ta Amaliyot guruhi'}
              </span>
            </button>

            {currentFilterGroups.map((grp) => {
              const isSelected = selectedPlanGroupId === grp.id;
              const slot = getSlotForGroup(grp.id, activePlanTab);

              return (
                <button
                  key={grp.id}
                  onClick={() => setSelectedPlanGroupId(grp.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    isSelected
                      ? activePlanTab === 'maruza'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                        : 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 ring-2 ring-teal-300'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span>{grp.name}</span>
                  {slot && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 font-mono">
                      {slot.dayNameUz.slice(0, 3)}, {slot.pairNumber}-para ({slot.room})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW MODE 1: LIST VIEW (DETAILED TOPIC LIST WITH DATES)   */}
      {/* ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Active groups to display in list */}
          {(selectedPlanGroupId === 'all' ? currentFilterGroups : currentFilterGroups.filter((g) => g.id === selectedPlanGroupId)).map(
            (groupItem) => {
              const slot = getSlotForGroup(groupItem.id, activePlanTab);

              return (
                <div
                  key={groupItem.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
                >
                  {/* Group Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          activePlanTab === 'maruza'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}
                      >
                        {groupItem.name.split('-')[2] || groupItem.name.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-black text-white">{groupItem.name}</h2>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                            {groupItem.faculty}
                          </span>
                        </div>
                        {slot && (
                          <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                            <span className="flex items-center space-x-1 text-teal-300">
                              <CalendarDays className="w-3.5 h-3.5" />
                              <strong>Har {slot.dayNameUz}</strong>
                            </span>
                            <span className="flex items-center space-x-1 text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{slot.pairNumber}-para ({slot.pairTime})</span>
                            </span>
                            <span className="flex items-center space-x-1 text-amber-300">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{slot.room}-auditoriya</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className="text-xs font-bold text-slate-400">
                        Jami reja: <strong className="text-white">{activeTopics.length} ta mavzu</strong> ({activeTopics.length * 2} soat)
                      </span>
                    </div>
                  </div>

                  {/* Topic Rows */}
                  <div className="space-y-3">
                    {activeTopics.map((topic, index) => {
                      const dateInfo = calculateDateForWeek(topic.weekDefault, slot);
                      const completedSession = getTopicCompletion(groupItem.id, topic, dateInfo.isoDate);
                      const isCovered = Boolean(completedSession);

                      return (
                        <div
                          key={topic.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isCovered
                              ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            {/* Left Meta & Content */}
                            <div className="flex items-start space-x-3.5 min-w-0">
                              {/* Topic Code & Week Badge */}
                              <div className="flex flex-col items-center shrink-0">
                                <span
                                  className={`w-12 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                                    activePlanTab === 'maruza'
                                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                      : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                                  }`}
                                >
                                  {topic.code || `${activePlanTab === 'maruza' ? 'M' : 'A'}${index + 1}`}
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1 font-mono font-bold">
                                  {topic.weekDefault}-hafta
                                </span>
                              </div>

                              {/* Main Topic Information */}
                              <div className="min-w-0 space-y-1.5">
                                {/* Calendar Date & Schedule Tags */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-bold border border-teal-500/30 flex items-center space-x-1">
                                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                                    <span>
                                      {dateInfo.formattedDate} ({dateInfo.dayNameUz})
                                    </span>
                                  </span>

                                  {slot && (
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700 flex items-center space-x-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{slot.pairNumber}-para ({slot.pairTime})</span>
                                    </span>
                                  )}

                                  {slot && (
                                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 text-[11px] font-bold border border-amber-500/20 flex items-center space-x-1">
                                      <MapPin className="w-3 h-3 text-amber-400" />
                                      <span>{slot.room}-xona</span>
                                    </span>
                                  )}

                                  {isCovered ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Dars o'tildi ({completedSession?.date})</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium border border-slate-700">
                                      Rejadagi dars
                                    </span>
                                  )}
                                </div>

                                {/* MAVZU NOMI (QALIN HARFLARDA) */}
                                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                                  {topic.title}
                                </h3>

                                {/* MAVZU REJASI (ODDIY HARFLARDA, ALOHIDA BLOK) */}
                                {topic.description && (
                                  <div className="mt-2 text-xs leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800/90 text-slate-300">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1 flex items-center space-x-1">
                                      <BookOpen className="w-3 h-3" />
                                      <span>Mavzu rejasi:</span>
                                    </div>
                                    <p className="font-normal text-slate-300 leading-relaxed">
                                      {topic.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Action Button */}
                            <div className="shrink-0 self-end lg:self-center">
                              <button
                                onClick={() => handleLaunchAttendance(groupItem.id, topic, dateInfo.isoDate, slot)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg ${
                                  isCovered
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                                }`}
                              >
                                {isCovered ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Davomatni ko'rish</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Davomat qilish (Dars o'tish)</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 2: MONTHLY CALENDAR GRID                       */}
      {/* ======================================================== */}
      {viewMode === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          {/* Calendar Month Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-teal-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {UZ_MONTH_NAMES[currentCalendarMonth]} {currentCalendarYear}
                </h2>
                <p className="text-xs text-slate-400">
                  {activePlanTab === 'maruza' ? "Ma'ruzalar" : "Amaliy mashg'ulotlar"} oylik kalendari
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (currentCalendarMonth === 0) {
                    setCurrentCalendarMonth(11);
                    setCurrentCalendarYear((y) => y - 1);
                  } else {
                    setCurrentCalendarMonth((m) => m - 1);
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentCalendarMonth(8);
                  setCurrentCalendarYear(2026);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 border border-slate-700"
              >
                Sentyabr 2026 (Semestr boshi)
              </button>

              <button
                onClick={() => {
                  if (currentCalendarMonth === 11) {
                    setCurrentCalendarMonth(0);
                    setCurrentCalendarYear((y) => y + 1);
                  } else {
                    setCurrentCalendarMonth((m) => m + 1);
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header (Mon to Sun) */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400 pb-2">
            <span>Dushanba</span>
            <span>Seshanba</span>
            <span>Chorshanba</span>
            <span>Payshanba</span>
            <span>Juma</span>
            <span className="text-slate-500">Shanba</span>
            <span className="text-slate-600">Yakshanba</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cd, idx) => {
              if (!cd.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[110px] bg-slate-950/30 border border-slate-850/50 rounded-2xl p-2 opacity-30"
                  />
                );
              }

              const hasLessons = cd.items.length > 0;

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] rounded-2xl p-2.5 border transition-all flex flex-col justify-between ${
                    hasLessons
                      ? 'bg-slate-850/90 border-teal-500/30 hover:border-teal-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                        hasLessons
                          ? 'bg-teal-500 text-slate-950 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {cd.dayNum}
                    </span>
                    {hasLessons && (
                      <span className="text-[10px] text-teal-400 font-bold">
                        {cd.items.length} ta dars
                      </span>
                    )}
                  </div>

                  {/* Scheduled lessons on this date */}
                  <div className="space-y-1.5 mt-2 flex-1">
                    {cd.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        onClick={() => handleLaunchAttendance(item.groupId, item.topic, cd.isoDate, item.slot)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition hover:scale-[1.02] ${
                          item.isCovered
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : activePlanTab === 'maruza'
                            ? 'bg-purple-500/20 text-purple-200 border-purple-500/30'
                            : 'bg-teal-500/20 text-teal-200 border-teal-500/30'
                        }`}
                        title={`${item.groupName}: ${item.topic.code} - ${item.topic.title}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono">{item.topic.code}</span>
                          <span>{item.slot?.pairNumber}-para</span>
                        </div>
                        <div className="truncate font-semibold text-white mt-0.5">
                          {item.groupName}
                        </div>
                        <div className="truncate text-[9px] text-slate-300">
                          {item.topic.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareToStudentsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        groups={groups}
        schedule={schedule}
        curriculum={curriculum}
        selectedWeek={4}
        teacherName={teacherName}
      />
    </div>
  );
};
