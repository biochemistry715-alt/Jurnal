import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Shirt,
  Search,
  User,
  GraduationCap,
  Layers,
  MapPin,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Award,
  ArrowRight,
  Info,
  Send,
  Filter,
  Phone,
  Shield,
  Lock,
  Unlock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LessonType, Student } from '../types';
import { calculateSlotDate, getWeekDates } from '../utils/academicCalendar';
import { ShareToStudentsModal } from './modals/ShareToStudentsModal';
import { getPublicStudentLink, copyTextFallback } from '../utils/shareUtils';

export const StudentPortalView: React.FC = () => {
  const {
    groups,
    schedule,
    students,
    curriculum,
    sessions,
    makeups,
    assignments,
    independentTopics,
    practicalTasks,
    taskSubmissions,
    submitStudentTask,
    teacherName,
    setActiveTab
  } = useApp();

  const teacherPhone = '+998 99 839 98 80';
  const teacherPhoneClean = '+998998399880';
  const teacherTelegram = '@Biochemistry715';
  const teacherTelegramUrl = 'https://t.me/Biochemistry715';

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionTextInput, setSubmissionTextInput] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [topicFilterTab, setTopicFilterTab] = useState<'all' | 'unsubmitted' | 'submitted'>('unsubmitted');

  // Check if URL has group param for locking to this specific group
  const [isUrlGroupLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return Boolean(urlParams.get('group'));
    }
    return false;
  });

  const [allowTeacherGroupOverride, setAllowTeacherGroupOverride] = useState<boolean>(false);

  // Read URL parameters on mount (?view=student&group=DI-25-22&student=st-22-01)
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qGroup = urlParams.get('group');
      if (qGroup) {
        const found = groups.find(
          (g) =>
            g.id === qGroup ||
            g.name.toLowerCase().replace(/\s+/g, '') === qGroup.toLowerCase().replace(/\s+/g, '')
        );
        if (found) return found.id;
      }
    }
    return groups[0]?.id || '';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qStudent = urlParams.get('student');
      if (qStudent) {
        const found = students.find(
          (s) =>
            s.id === qStudent ||
            (s.studentCode && s.studentCode.toLowerCase() === qStudent.toLowerCase()) ||
            s.fullName.toLowerCase().includes(qStudent.toLowerCase())
        );
        if (found) return found.id;
      }
    }
    return '';
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [practicalFilter, setPracticalFilter] = useState<'all' | string>('all');

  // Active selected group
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0];
  }, [groups, selectedGroupId]);

  // Students in selected group
  const groupStudents = useMemo(() => {
    if (!activeGroup) return [];
    if (activeGroup.isLectureFlow && activeGroup.constituentGroupIds && activeGroup.constituentGroupIds.length > 0) {
      return students.filter((s) => activeGroup.constituentGroupIds!.includes(s.groupId));
    }
    return students.filter((s) => s.groupId === activeGroup.id);
  }, [activeGroup, students]);

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return groupStudents;
    const q = studentSearch.toLowerCase();
    return groupStudents.filter(
      (s) => s.fullName.toLowerCase().includes(q) || (s.studentCode && s.studentCode.toLowerCase().includes(q))
    );
  }, [groupStudents, studentSearch]);

  // Selected student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Today's Date Info
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const dayNamesUz = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
  const dayNamesUzCapital = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const todayDayName = dayNamesUz[today.getDay()];
  const todayDayUzCapital = dayNamesUzCapital[today.getDay()];

  // Format date with day of week
  const formatUzDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dayName = dayNamesUzCapital[d.getDay()] || '';
      return `${dateStr} (${dayName})`;
    } catch {
      return dateStr;
    }
  };

  // Today's scheduled classes from weekly timetable
  const todayScheduleSlots = useMemo(() => {
    return schedule.filter((s) => s.dayOfWeek.toLowerCase() === todayDayName);
  }, [schedule, todayDayName]);

  // Current topics for activeGroup based on its current week
  const activeGroupWeek = activeGroup?.currentWeek || 2;

  const currentLectureTopic = useMemo(() => {
    return (
      curriculum.find((c) => c.type === 'maruza' && c.weekDefault === activeGroupWeek) ||
      curriculum.find((c) => c.type === 'maruza')
    );
  }, [curriculum, activeGroupWeek]);

  const currentPracticalTopic = useMemo(() => {
    return (
      curriculum.find((c) => c.type === 'amaliy' && c.weekDefault === activeGroupWeek) ||
      curriculum.find((c) => c.type === 'amaliy')
    );
  }, [curriculum, activeGroupWeek]);

  // Timetable slots for activeGroup (both practical and lecture stream)
  const activeGroupSlots = useMemo(() => {
    if (!activeGroup) return [];

    return schedule.filter((s) => {
      // Direct match
      if (s.matchingGroupId === activeGroup.id) return true;
      const cleanGrp = activeGroup.name.replace(/\s+/g, '').toLowerCase();
      const cleanSlot = s.groupCode.replace(/\s+/g, '').toLowerCase();
      if (cleanSlot === cleanGrp || cleanSlot.includes(cleanGrp)) return true;

      // If activeGroup is an individual group, find if this slot belongs to its parent stream
      if (!activeGroup.isLectureFlow) {
        const parentStream = groups.find(
          (g) =>
            g.isLectureFlow &&
            (g.constituentGroupIds?.includes(activeGroup.id) ||
              g.subGroups?.some((sg) => cleanGrp.includes(sg.replace(/\s+/g, '').toLowerCase())))
        );
        if (
          parentStream &&
          (s.matchingGroupId === parentStream.id ||
            cleanSlot.includes(parentStream.name.replace(/\s+/g, '').toLowerCase()))
        ) {
          return true;
        }
      }

      // If activeGroup is stream, find slots for this stream or its constituents
      if (activeGroup.isLectureFlow) {
        if (activeGroup.constituentGroupIds?.includes(s.matchingGroupId || '')) return true;
        if (activeGroup.subGroups?.some((sg) => cleanSlot.includes(sg.replace(/\s+/g, '').toLowerCase()))) return true;
      }

      return false;
    });
  }, [schedule, activeGroup, groups]);

  // Missed sessions (NBs) for selected student
  const studentMissedSessions = useMemo(() => {
    if (!activeStudent) return [];

    const missedList: Array<{
      sessionId: string;
      date: string;
      formattedDate: string;
      lessonType: LessonType;
      groupName: string;
      topicTitle: string;
      topicDescription?: string;
      hours: number;
      room?: string;
      status: 'absent' | 'excused_absent' | 'late' | 'no_uniform';
      lateMinutes?: number;
      makeupStatus: 'pending' | 'submitted' | 'rejected' | 'not_required';
      makeupGrade?: number;
      teacherNote?: string;
    }> = [];

    sessions.forEach((ses) => {
      const entry = ses.attendance[activeStudent.id];
      if (
        entry &&
        (entry.status === 'absent' ||
          entry.status === 'excused_absent' ||
          entry.status === 'late' ||
          entry.status === 'no_uniform')
      ) {
        const matchingGroup = groups.find((g) => g.id === ses.groupId);

        // Find matching topic in curriculum for full official description
        const matchedTopic = curriculum.find(
          (c) =>
            (ses.topicId && c.id === ses.topicId) ||
            (c.title && ses.topicTitle && c.title.toLowerCase().includes(ses.topicTitle.toLowerCase().slice(0, 15))) ||
            (ses.topicTitle && c.title && ses.topicTitle.toLowerCase().includes(c.title.toLowerCase().slice(0, 15)))
        );

        // Check makeup record
        const mk = makeups.find((m) => m.studentId === activeStudent.id && m.missedSessionId === ses.id);

        missedList.push({
          sessionId: ses.id,
          date: ses.date,
          formattedDate: formatUzDate(ses.date),
          lessonType: ses.lessonType,
          groupName: matchingGroup ? matchingGroup.name : 'Biokimyo',
          topicTitle: ses.topicTitle,
          topicDescription: matchedTopic?.description || (matchedTopic?.code ? `${matchedTopic.code} mavzusi` : undefined),
          hours: 2,
          room: ses.room || matchingGroup?.room,
          status: entry.status,
          lateMinutes: entry.lateMinutes,
          makeupStatus: mk ? mk.status : entry.atrabotkaDone ? 'submitted' : entry.status === 'absent' ? 'pending' : 'not_required',
          makeupGrade: mk?.score || (entry.atrabotkaScore as number | undefined),
          teacherNote: mk?.teacherNote || entry.note
        });
      }
    });

    return missedList;
  }, [activeStudent, sessions, groups, curriculum, makeups]);

  // Practical grades & konspekt records for selected student (Grades numbers are strictly hidden from students!)
  const studentPracticalRecords = useMemo(() => {
    if (!activeStudent) return [];

    const records: Array<{
      sessionId: string;
      date: string;
      formattedDate: string;
      topicTitle: string;
      isSubmitted: boolean;
      hasKonspekt?: boolean;
    }> = [];

    sessions
      .filter((s) => s.lessonType === 'amaliy')
      .forEach((ses) => {
        const entry = ses.attendance[activeStudent.id];
        if (entry && (entry.grade !== undefined || entry.hasKonspekt !== undefined || entry.atrabotkaDone)) {
          records.push({
            sessionId: ses.id,
            date: ses.date,
            formattedDate: formatUzDate(ses.date),
            topicTitle: ses.topicTitle,
            isSubmitted: entry.grade !== undefined || Boolean(entry.atrabotkaDone),
            hasKonspekt: entry.hasKonspekt
          });
        }
      });

    return records;
  }, [activeStudent, sessions]);

  // Comprehensive analysis of topics: which ones the student has submitted vs NOT submitted
  const studentTopicAnalysis = useMemo(() => {
    if (!activeStudent || !activeGroup) {
      return { unsubmittedList: [], submittedList: [], allList: [] };
    }

    const unsubmittedList: Array<{
      id: string;
      code: string;
      title: string;
      type: LessonType;
      date?: string;
      formattedDate?: string;
      reason: string;
      status: 'absent_nb' | 'not_graded' | 'excused_nb';
      description?: string;
    }> = [];

    const submittedList: Array<{
      id: string;
      code: string;
      title: string;
      type: LessonType;
      date: string;
      formattedDate: string;
      hasKonspekt?: boolean;
      statusText: string;
    }> = [];

    // Process all sessions that belong to this group or its lecture stream
    sessions.forEach((ses) => {
      const isForThisGroup =
        ses.groupId === activeGroup.id ||
        (activeGroup.constituentGroupIds && activeGroup.constituentGroupIds.includes(ses.groupId)) ||
        (activeGroup.isLectureFlow && ses.groupId === activeGroup.id);

      if (!isForThisGroup) return;

      const entry = ses.attendance[activeStudent.id];
      if (!entry) return;

      const matchedTopic = curriculum.find(
        (c) =>
          (ses.topicId && c.id === ses.topicId) ||
          (c.title && ses.topicTitle && c.title.toLowerCase().includes(ses.topicTitle.toLowerCase().slice(0, 15))) ||
          (ses.topicTitle && c.title && ses.topicTitle.toLowerCase().includes(c.title.toLowerCase().slice(0, 15)))
      );

      const topicCode = matchedTopic?.code || (ses.lessonType === 'maruza' ? 'M' : 'A');
      const mk = makeups.find((m) => m.studentId === activeStudent.id && m.missedSessionId === ses.id);
      const isMakeupDone = entry.atrabotkaDone || (mk && mk.status === 'submitted');

      if (entry.status === 'absent' || entry.status === 'excused_absent') {
        if (isMakeupDone) {
          submittedList.push({
            id: ses.id,
            code: topicCode,
            title: ses.topicTitle,
            type: ses.lessonType,
            date: ses.date,
            formattedDate: formatUzDate(ses.date),
            hasKonspekt: entry.hasKonspekt,
            statusText: "Otrabotka topshirildi (Muvaffaqiyatli qabul qilindi)"
          });
        } else {
          unsubmittedList.push({
            id: ses.id,
            code: topicCode,
            title: ses.topicTitle,
            type: ses.lessonType,
            date: ses.date,
            formattedDate: formatUzDate(ses.date),
            reason: entry.status === 'absent'
              ? "🔴 2 soat NB (Dars qoldirilgan, otrabotka topshirilmagan)"
              : "🔵 Sababli NB (Otrabotka topshirilmagan)",
            status: entry.status === 'absent' ? 'absent_nb' : 'excused_nb',
            description: matchedTopic?.description
          });
        }
      } else {
        // Student was present
        if (ses.lessonType === 'amaliy') {
          if (entry.grade !== undefined || entry.atrabotkaDone) {
            submittedList.push({
              id: ses.id,
              code: topicCode,
              title: ses.topicTitle,
              type: ses.lessonType,
              date: ses.date,
              formattedDate: formatUzDate(ses.date),
              hasKonspekt: entry.hasKonspekt,
              statusText: "Dars topshirilgan va hisobga olingan"
            });
          } else {
            unsubmittedList.push({
              id: ses.id,
              code: topicCode,
              title: ses.topicTitle,
              type: ses.lessonType,
              date: ses.date,
              formattedDate: formatUzDate(ses.date),
              reason: "⚠️ Amaliyot topshirilmagan (Baho qo'yilmagan / Qarzdorlik)",
              status: 'not_graded',
              description: matchedTopic?.description
            });
          }
        } else {
          // Lecture session attended
          submittedList.push({
            id: ses.id,
            code: topicCode,
            title: ses.topicTitle,
            type: ses.lessonType,
            date: ses.date,
            formattedDate: formatUzDate(ses.date),
            statusText: "Ma'ruzada to'liq qatnashgan"
          });
        }
      }
    });

    return {
      unsubmittedList,
      submittedList,
      totalCount: unsubmittedList.length + submittedList.length
    };
  }, [activeStudent, activeGroup, sessions, curriculum, makeups]);

  // Assigned independent study topic for selected student
  const studentIndependentAsg = useMemo(() => {
    if (!activeStudent) return null;
    const asg = assignments.find((a) => a.studentId === activeStudent.id);
    const studentIdxInGroup = groupStudents.findIndex((s) => s.id === activeStudent.id);
    const cyclicIdx = studentIdxInGroup >= 0 ? studentIdxInGroup % 15 : 0;
    const cyclicTopic = independentTopics[cyclicIdx] || independentTopics[0];

    if (asg) {
      const topic = independentTopics.find((t) => t.id === asg.topicId) || cyclicTopic;
      const topicIdx = independentTopics.findIndex((t) => t.id === topic?.id);
      return {
        ...asg,
        topic,
        studentNumberInGroup: studentIdxInGroup >= 0 ? studentIdxInGroup + 1 : 1,
        orderNumber: topic?.orderNumber || (topicIdx >= 0 ? topicIdx + 1 : 1)
      };
    }

    if (cyclicTopic) {
      return {
        id: `asg-cyclic-${activeStudent.id}`,
        studentId: activeStudent.id,
        groupId: activeStudent.groupId,
        topicId: cyclicTopic.id,
        assignedDate: '2026-09-20',
        deadline: '2026-10-25',
        status: 'assigned' as const,
        topic: cyclicTopic,
        studentNumberInGroup: studentIdxInGroup >= 0 ? studentIdxInGroup + 1 : 1,
        orderNumber: cyclicTopic.orderNumber || cyclicIdx + 1
      };
    }

    return null;
  }, [activeStudent, assignments, independentTopics, groupStudents]);

  // Copy share link with group parameter
  const handleCopyLink = async () => {
    const link = getPublicStudentLink(activeGroup ? activeGroup.name : undefined);
    await copyTextFallback(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareTelegram = () => {
    const link = getPublicStudentLink(activeGroup ? activeGroup.name : undefined);
    const msg = `📢 Biologik kimyo fani: ${activeGroup ? activeGroup.name : 'Biokimyo'} guruhi talabalari uchun dars jadvali, mavzular, vazifalar va davomat portali:\n👉 ${link}\n\n🔒 Maxfiylik: Talabalar baho raqamlarini ko'rmaydi, faqat dars topshirilganligi va topshirmagan qarzdor mavzulari ko'rinadi.\n\n📞 O'qituvchi bilan aloqa: ${teacherPhone} | Telegram: ${teacherTelegram}`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}`;
    window.open(tgUrl, '_blank');
  };

  const isGroupRestricted = isUrlGroupLocked && !allowTeacherGroupOverride;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ======================================================== */}
      {/* HEADER BANNER FOR STUDENTS                               */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider border border-purple-500/30 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Talabalar uchun ochiq portal</span>
              </span>
              <span className="text-xs text-slate-300">
                Kafedra: <strong className="text-white">Biologik kimyo</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                19-oktyabrdan 4-hafta
              </span>
              {isGroupRestricted && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>{activeGroup.name} portali</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-3">
              <span>Biokimyo fani darslari & Davomat portali</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Hurmatli talaba! Bu yerda bugun o'tilayotgan dars mavzusini, dars topshirganligingizni va aynan <strong>qaysi mavzularni topshirmaganligingizni (qarzdorliklar)</strong> aniq bilib olishingiz mumkin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* Direct Group Share Modal */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition flex items-center space-x-1.5"
              title="Har bir guruh uchun alohida linklarni ko'rish"
            >
              <Shield className="w-4 h-4" />
              <span>Guruh havolalari</span>
            </button>

            {/* Telegram share button */}
            <button
              onClick={handleShareTelegram}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center space-x-1.5"
              title="Guruh Telegram chatiga ulashish"
            >
              <Send className="w-4 h-4" />
              <span>Telegramga ulashish</span>
            </button>

            {/* Share Link Button */}
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 flex items-center space-x-2"
              title="Talabalar uchun to'g'ridan-to'g'ri havolani nusxalash"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Havola nusxalandi!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Havolani nusxalash</span>
                </>
              )}
            </button>

            {/* Back to teacher journal */}
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="O'qituvchi elektron jurnaliga qaytish"
            >
              Ustoz jurnali
            </button>
          </div>
        </div>

        {/* Teacher Contact Info Strip */}
        <div className="mt-4 pt-3 border-t border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 flex items-center space-x-2 flex-wrap">
            <span className="text-slate-400">O'qituvchi bilan aloqa va dars topshirish:</span>
            <span className="font-bold text-white">{teacherName}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <a
              href={`tel:${teacherPhoneClean}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 flex items-center space-x-1.5 transition shadow"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{teacherPhone}</span>
            </a>

            <a
              href={teacherTelegramUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold border border-sky-500/40 flex items-center space-x-1.5 transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{teacherTelegram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BUGUN O'TILAYOTGAN DARSLAR VA MAVZULAR                 */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-6 h-6 text-teal-400" />
            <div>
              <h2 className="text-lg font-black text-white">1. Bugun o'tilayotgan darslar va mavzular</h2>
              <p className="text-xs text-slate-400">
                Bugungi sana: <strong className="text-teal-300">{todayIso} ({todayDayUzCapital})</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
            {todayScheduleSlots.length > 0 ? `${todayScheduleSlots.length} ta dars rejalashtirilgan` : "Bugun jadval bo'yicha dars yo'q"}
          </span>
        </div>

        {todayScheduleSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayScheduleSlots.map((slot) => {
              const matchedGroup = groups.find(
                (g) => g.id === slot.matchingGroupId || g.name.toLowerCase().includes(slot.groupCode.toLowerCase())
              );
              const groupWeek = matchedGroup?.currentWeek || 4;
              const isLecture = slot.type === 'maruza';
              const matchedTopic = curriculum.find(
                (c) => c.type === slot.type && c.weekDefault === groupWeek
              );

              return (
                <div
                  key={slot.id}
                  className={`p-5 rounded-2xl border transition shadow-lg ${
                    isLecture
                      ? 'bg-purple-950/20 border-purple-800/50'
                      : 'bg-teal-950/20 border-teal-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        isLecture
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {isLecture ? "🟣 Ma'ruza (Oqim)" : "🟢 Amaliy mashg'ulot"}
                    </span>
                    <span className="text-xs font-bold text-amber-300 flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{slot.room}-auditoriya</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                    <span className="text-white font-black text-sm">{slot.groupCode}</span>
                    <span>•</span>
                    <span>{slot.pairNumber}-para ({slot.pairTime})</span>
                  </div>

                  {matchedTopic && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60">
                      <div className="text-[11px] font-bold text-slate-400">Bugungi mavzu:</div>
                      <div className="text-sm font-black text-white leading-snug">
                        {matchedTopic.title}
                      </div>
                      {matchedTopic.description && (
                        <div className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-teal-400 font-bold block mb-0.5 text-[11px]">Mavzu rejasi:</span>
                          <p className="whitespace-pre-line">{matchedTopic.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Bugun haftalik jadvalda darsingiz yo'q yoki dam olish kuni. Quyida o'z guruhingiz dars jadvali va mavzularini ko'rishingiz mumkin.</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. SIZNING GURUHINGIZ UCHUN JORIY HAFTA MAVZULARI         */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-black text-white">
                2. Sizning guruhingiz ({activeGroup.name}) uchun joriy ({activeGroupWeek}-hafta) o'tilayotgan mavzular
              </h2>
              <p className="text-xs text-slate-400">
                Guruh: <strong className="text-teal-300">{activeGroup.name}</strong> ({activeGroup.faculty}) • Dars raqami: <strong className="text-emerald-300">{activeGroupWeek}-dars</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            {activeGroupWeek}-hafta darslari
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lecture Card */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-purple-300 uppercase px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px]">
                🟣 Ma'ruza mashg'uloti
              </span>
              <span className="text-slate-400 font-medium">2 soat</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Mavzu kodi: <strong className="text-purple-300">{currentLectureTopic?.code || `M${activeGroupWeek}`}</strong>
            </div>

            <h3 className="text-sm font-black text-white leading-snug">
              {currentLectureTopic?.title}
            </h3>

            {currentLectureTopic?.description && (
              <div className="mt-2 text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                <span className="text-purple-300 font-bold block mb-1 text-[11px]">Ma'ruza rasmiy rejasi:</span>
                <p className="whitespace-pre-line">{currentLectureTopic.description}</p>
              </div>
            )}
          </div>

          {/* Practical Card */}
          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-teal-300 uppercase px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30 text-[10px]">
                🟢 Amaliy mashg'ulot
              </span>
              <span className="text-slate-400 font-medium">2 soat</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Mavzu kodi: <strong className="text-teal-300">{currentPracticalTopic?.code || `A${activeGroupWeek}`}</strong>
            </div>

            <h3 className="text-sm font-black text-white leading-snug">
              {currentPracticalTopic?.title}
            </h3>

            {currentPracticalTopic?.description && (
              <div className="mt-2 text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                <span className="text-teal-300 font-bold block mb-1 text-[11px]">Amaliyot rejasi va topshiriqlari:</span>
                <p className="whitespace-pre-line">{currentPracticalTopic.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Guruhingizning haftalik dars jadvali */}
        {activeGroupSlots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeGroup.name} guruhi uchun dars jadvali va sanalari:</span>
              </h3>
              <span className="text-[11px] text-teal-400 font-mono font-bold">
                19 – 24-oktyabr 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeGroupSlots.map((slot) => {
                const dateInfo = calculateSlotDate(4, slot.dayOfWeek);
                const isLecture = slot.type === 'maruza';
                const effectiveLesson = dateInfo.effectiveLessonNumber;
                const slotTopic = curriculum.find(
                  (c) => c.type === slot.type && c.order === effectiveLesson
                );

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 ${
                      isLecture
                        ? 'bg-purple-950/30 border-purple-800/50'
                        : 'bg-teal-950/20 border-teal-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                          {dateInfo.dayNameUz}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {dateInfo.formattedDate}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-amber-300 flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{slot.room}-auditoriya</span>
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-black text-white flex items-center space-x-1.5">
                        <span className={isLecture ? 'text-purple-300' : 'text-teal-300'}>
                          {isLecture ? "🟣 Ma'ruza (Oqim)" : "🟢 Amaliy mashg'ulot"}
                        </span>
                        <span className="text-slate-400 font-normal">•</span>
                        <span className="text-slate-200">{slot.pairNumber}-para ({slot.pairTime})</span>
                      </div>

                      {slotTopic && (
                        <div className="mt-1.5 text-xs text-slate-200 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                          <strong className="text-teal-400">{slotTopic.code || `${effectiveLesson}-mavzu`}:</strong> {slotTopic.title}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. TALABANING SHAXSIY JURNALI VA MAVZULARNI TOPSHIRISH   */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-black text-white">3. Shaxsiy davomat va darslarni topshirish nazorati</h2>
              <p className="text-xs text-slate-400">
                O'z ism-familiyangizni tanlang va <strong>qaysi mavzularni topshirmaganligingizni</strong> hamda dars topshirganlik holatingizni ko'ring.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Baholar maxfiy saqlanadi</span>
            </span>
          </div>
        </div>

        {/* Group Selector & Student Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>1. Guruhingiz:</span>
              {isGroupRestricted && (
                <span className="text-[10px] text-teal-400 font-bold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Cheklangan guruh</span>
                </span>
              )}
            </label>

            {isGroupRestricted ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-teal-800/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white flex items-center space-x-1.5">
                    <span>{activeGroup.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      🔒 Faol guruh
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">{activeGroup.faculty}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setAllowTeacherGroupOverride(true)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline font-medium"
                  title="O'qituvchi boshqaruvi uchun guruhni o'zgartirish"
                >
                  Ustoz rejimi
                </button>
              </div>
            ) : (
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full bg-slate-950 text-slate-100 font-bold rounded-xl p-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                <optgroup label="🌊 Ma'ruza Oqimlari">
                  {groups
                    .filter((g) => g.isLectureFlow)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        🌊 {g.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📋 Amaliyot Guruhlari">
                  {groups
                    .filter((g) => !g.isLectureFlow && g.hasPractical)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            )}
          </div>

          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              2. Familiyangizni qidiring yoki ro'yxatdan tanlang:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Familiya va ismingizni yozing..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Student Selection Chips */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>{activeGroup.name} guruhi talabalari ({filteredStudents.length} nafar):</span>
            <span className="text-[11px] text-teal-400">O'z ismingiz ustiga bosing</span>
          </div>

          <div className="max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-wrap gap-1.5">
            {filteredStudents.map((st) => {
              const isSelected = selectedStudentId === st.id;
              // Check if student has any unsubmitted topic or missed session
              const hasMissed = sessions.some(
                (ses) => ses.attendance[st.id]?.status === 'absent' || ses.attendance[st.id]?.status === 'excused_absent'
              );

              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/20'
                      : hasMissed
                      ? 'bg-slate-900 text-rose-300 border border-rose-900/40 hover:bg-slate-800'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{st.fullName}</span>
                  {hasMissed && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Qoldirilgan dars (NB) mavjud" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Student Detailed Dossier */}
        {activeStudent ? (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-6">
            {/* Student Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-black text-base">
                  {activeStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeStudent.fullName}</h3>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>Kod: <strong className="text-slate-300">{activeStudent.studentCode || 'ST'}</strong></span>
                    <span>•</span>
                    <span>Guruh: <strong className="text-teal-300">{activeGroup?.name}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Topshirilmagan mavzular</div>
                  <div className="text-base font-black text-rose-400">
                    {studentTopicAnalysis.unsubmittedList.length} ta
                  </div>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Topshirilgan darslar</div>
                  <div className="text-base font-black text-emerald-400">
                    {studentTopicAnalysis.submittedList.length} ta
                  </div>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Qoldirilgan NB</div>
                  <div className="text-base font-black text-amber-300">
                    {studentMissedSessions.filter((m) => m.status === 'absent').length * 2} soat
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notification Banner */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl flex items-center space-x-2.5 text-xs text-indigo-200">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Maxfiylik eslatmasi:</strong> O'qituvchi tomonidan qo'yilgan baho ballari (nechi olingani) maxfiy tutiladi. Portalda dars topshirilganligi tasdig'i va qaysi mavzulardan qarzdorlik borligi aks etadi.
              </span>
            </div>

            {/* ======================================================== */}
            {/* TOPIC SUBMISSION MONITORING (SUBMITTED vs UNSUBMITTED)    */}
            {/* ======================================================== */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-black text-white flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>Darslarni topshirish holati va topshirilmagan mavzular</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Qaysi mavzular topshirilgan va qaysilari hali topshirilmaganligini tekshiring.
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTopicFilterTab('unsubmitted')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      topicFilterTab === 'unsubmitted'
                        ? 'bg-rose-500 text-white font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>❌ Topshirilmagan</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60">
                      {studentTopicAnalysis.unsubmittedList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTopicFilterTab('submitted')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      topicFilterTab === 'submitted'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>✅ Topshirilgan</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60">
                      {studentTopicAnalysis.submittedList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTopicFilterTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      topicFilterTab === 'all'
                        ? 'bg-slate-800 text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Barchasi ({studentTopicAnalysis.totalCount})
                  </button>
                </div>
              </div>

              {/* UNSUBMITTED TOPICS LIST */}
              {(topicFilterTab === 'unsubmitted' || topicFilterTab === 'all') && (
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Topshirilmagan mavzular ro'yxati (Qarzdorliklar — {studentTopicAnalysis.unsubmittedList.length} ta):</span>
                  </div>

                  {studentTopicAnalysis.unsubmittedList.length > 0 ? (
                    <div className="space-y-3">
                      {studentTopicAnalysis.unsubmittedList.map((item, idx) => (
                        <div
                          key={`unsub-${idx}`}
                          className="p-4 rounded-2xl bg-slate-950 border border-rose-900/50 hover:border-rose-700 transition space-y-3 shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                {item.code}
                              </span>

                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                  item.type === 'maruza'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                }`}
                              >
                                {item.type === 'maruza' ? "🟣 Ma'ruza mashg'uloti" : "🟢 Amaliy mashg'ulot"}
                              </span>

                              {item.formattedDate && (
                                <span className="text-xs font-bold text-amber-300 flex items-center space-x-1 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Dars sanasi: {item.formattedDate}</span>
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-black text-rose-400 bg-rose-500/15 px-3 py-1 rounded-lg border border-rose-500/30">
                              {item.reason}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-400 mb-0.5">Topshirilmagan mavzu nomi:</div>
                            <div className="text-base font-black text-white leading-snug">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <span className="text-teal-400 font-bold block mb-1 text-[11px]">Mavzu rejasi va nazorat savollari:</span>
                                <p className="whitespace-pre-line">{item.description}</p>
                              </div>
                            )}
                          </div>

                          {/* Action to contact teacher for this specific topic */}
                          <div className="pt-2.5 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-slate-400">
                              Ushbu mavzudan otrabotka topshirish uchun ustoz bilan bog'laning:
                            </span>

                            <div className="flex items-center space-x-2">
                              <a
                                href={`tel:${teacherPhoneClean}`}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1.5 transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{teacherPhone}</span>
                              </a>

                              <a
                                href={teacherTelegramUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-bold border border-sky-500/30 flex items-center space-x-1.5 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{teacherTelegram}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>🎉 Ajoyib natija! Ushbu talabada hozircha birorta ham topshirilmagan mavzu yoki NB qarzdorligi yo'q.</span>
                    </div>
                  )}
                </div>
              )}

              {/* SUBMITTED TOPICS LIST */}
              {(topicFilterTab === 'submitted' || topicFilterTab === 'all') && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Muvaffaqiyatli topshirilgan darslar ({studentTopicAnalysis.submittedList.length} ta):</span>
                  </div>

                  {studentTopicAnalysis.submittedList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studentTopicAnalysis.submittedList.map((item, idx) => (
                        <div
                          key={`sub-${idx}`}
                          className="p-4 rounded-2xl bg-slate-950 border border-emerald-900/40 hover:border-emerald-700/60 transition space-y-2 shadow"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-teal-400">{item.formattedDate}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>{item.statusText}</span>
                            </span>
                          </div>

                          <div className="text-xs font-black text-white leading-snug">
                            {item.title}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                            <span className="text-slate-400">
                              {item.type === 'maruza' ? "🟣 Ma'ruza" : "🟢 Amaliyot"}
                            </span>

                            {item.hasKonspekt !== undefined && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  item.hasKonspekt
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                }`}
                              >
                                {item.hasKonspekt ? '📒 Konspekt tekshirilgan' : '📕 Konspektsiz'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                      Hozircha topshirilgan darslar mavjud emas.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ASSIGNED INDEPENDENT STUDY TOPIC CARD */}
            {studentIndependentAsg && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-teal-800/50 space-y-2.5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-black text-xs border border-teal-500/30 flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Sizning Mustaqil ta'lim mavzuingiz: #{studentIndependentAsg.orderNumber}-mavzu</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      Guruhdagi №{studentIndependentAsg.studentNumberInGroup}-talaba
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      Dedlayn: {studentIndependentAsg.deadline}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        studentIndependentAsg.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : studentIndependentAsg.status === 'in_review'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {studentIndependentAsg.status === 'completed'
                        ? '✅ Qabul qilindi'
                        : studentIndependentAsg.status === 'in_review'
                        ? '🔍 Tekshiruvda'
                        : '⏳ Biriktirilgan'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-teal-400/90 font-medium bg-teal-950/30 px-2.5 py-1 rounded-lg border border-teal-800/30">
                  🎯 Taqsimot qoidasi: 1-talabaga 1-mavzu, 2-talabaga 2-mavzu ... 15-talabaga 15-mavzu, 15-dan keyin (16-talabaga) yana 1-mavzu tartibida biriktirilgan.
                </div>

                <div className="text-sm font-black text-white leading-snug">
                  {studentIndependentAsg.topic?.title}
                </div>
                {studentIndependentAsg.topic?.description && (
                  <p className="text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-850 leading-relaxed">
                    {studentIndependentAsg.topic.description}
                  </p>
                )}
                {studentIndependentAsg.feedback && (
                  <div className="text-xs text-teal-400 bg-teal-950/40 p-2 rounded-lg border border-teal-800/40 italic">
                    Ustoz taqrizi: {studentIndependentAsg.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            Yuqoridagi ro'yxatdan o'z ism-familiyangiz ustiga bosing — qaysi mavzularni topshirmaganligingiz (qarzdorliklar) va dars topshirganlik holatingiz ochiladi.
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. AMALIY MASHG'ULOTLAR VAZIFALARI (A1 – A10)             */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2.5">
            <Send className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-black text-white">4. Amaliy mashg'ulotlar uchun vazifalar va topshiriqlar (A1 – A10)</h2>
              <p className="text-xs text-slate-400">
                Ustozingiz tomonidan har bir amaliy mashg'ulot uchun yuborilgan klinik masalalar, topshiriqlar va savollar.
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
            {practicalTasks.length} ta faol topshiriq
          </span>
        </div>

        {/* Practical Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setPracticalFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              practicalFilter === 'all'
                ? 'bg-purple-500 text-slate-950 font-black shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Barchasi ({practicalTasks.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const code = `A${num}`;
            const isSelected = practicalFilter === code;
            return (
              <button
                key={code}
                onClick={() => setPracticalFilter(code)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-purple-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practicalTasks
            .filter((task) => practicalFilter === 'all' || task.practicalCode === practicalFilter)
            .map((task) => {
            const submission = activeStudent
              ? taskSubmissions.find((s) => s.taskId === task.id && s.studentId === activeStudent.id)
              : null;
            const isSubmittingThis = submittingTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-slate-950 border border-purple-900/40 hover:border-purple-700/60 transition shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs border border-purple-500/30">
                      {task.practicalCode}
                    </span>
                    <span className="text-xs text-slate-200 font-bold">
                      {task.taskTitle}
                    </span>
                  </div>

                  <span className="text-[11px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Dedlayn: {task.deadlineDate || 'Belgilanmagan'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Mavzu: <strong className="text-slate-200">{task.topicTitle}</strong>
                </div>

                {/* Content / Questions */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {task.content}
                </div>

                {/* Student Submission Form & Status */}
                {activeStudent ? (
                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    {submission ? (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Javobingiz topshirilgan ({submission.submittedAt || 'Bugun'})</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Qabul qilindi</span>
                          </span>
                        </div>

                        {submission.submissionText && (
                          <p className="text-xs text-slate-300 italic bg-slate-950 p-2 rounded-lg border border-slate-855 whitespace-pre-line">
                            "{submission.submissionText}"
                          </p>
                        )}

                        {submission.teacherFeedback && (
                          <div className="text-[11px] text-teal-400 bg-teal-950/40 p-2 rounded-lg border border-teal-800/40">
                            Ustoz taqrizi: {submission.teacherFeedback}
                          </div>
                        )}
                      </div>
                    ) : isSubmittingThis ? (
                      <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-purple-800/50">
                        <label className="block text-[11px] font-bold text-purple-300">
                          Javobingiz, yechimingiz yoki xulosangizni yozing:
                        </label>
                        <textarea
                          rows={3}
                          value={submissionTextInput}
                          onChange={(e) => setSubmissionTextInput(e.target.value)}
                          placeholder="Savollarga javoblar, masala yechimi..."
                          className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSubmittingTaskId(null);
                              setSubmissionTextInput('');
                            }}
                            className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white"
                          >
                            Bekor qilish
                          </button>
                          <button
                            onClick={() => {
                              if (!submissionTextInput.trim()) {
                                return;
                              }
                              submitStudentTask({
                                taskId: task.id,
                                practicalCode: task.practicalCode,
                                studentId: activeStudent.id,
                                groupId: activeStudent.groupId,
                                submissionText: submissionTextInput.trim(),
                                status: 'submitted'
                              });
                              setSubmittingTaskId(null);
                              setSubmissionTextInput('');
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-black bg-purple-500 hover:bg-purple-400 text-slate-950 shadow"
                          >
                            Javobni yuborish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmittingTaskId(task.id);
                          setSubmissionTextInput('');
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition flex items-center justify-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Vazifani bajarish / Javob yuborish</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded-lg border border-slate-855 text-center">
                    Javob topshirish uchun yuqoridagi ro'yxatdan o'z ism-familiyangizni tanlang.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. TO'LIQ SILLABUS: 12 TA MA'RUZA VA 10 TA AMALIYOT      */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <div>
            <h2 className="text-lg font-black text-white">5. Semestr o'quv dasturi (Sillabus)</h2>
            <p className="text-xs text-slate-400">
              Biologik kimyo fani bo'yicha 12 ta ma'ruza va 10 ta amaliy mashg'ulotning rasmiy mavzulari va rejalari.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lectures list */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Ma'ruzalar (12 ta rasmiy mavzu)</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {curriculum.filter((t) => t.type === 'maruza').map((t, idx) => (
                <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                    <span>{t.code || `M${idx + 1}`} • {t.weekDefault}-hafta</span>
                    <span>2 soat</span>
                  </div>
                  <div className="text-xs font-bold text-white">{t.title}</div>
                  {t.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{t.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practicals list */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase text-teal-400 tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Amaliy mashg'ulotlar (10 ta rasmiy mavzu)</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {curriculum.filter((t) => t.type === 'amaliy').map((t, idx) => (
                <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-teal-300 font-bold">
                    <span>{t.code || `A${idx + 1}`} • {t.weekDefault}-hafta</span>
                    <span>2 soat</span>
                  </div>
                  <div className="text-xs font-bold text-white">{t.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. O'QITUVCHI BILAN ALOQA VA QABUL MARKAZI               */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-800/50 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">6. O'qituvchi bilan aloqa va dars topshirish markazi</h2>
              <p className="text-xs text-slate-300">
                Otrabotka topshirish, qoldirilgan darslar, tushunarsiz savollar yoki mustaqil ta'lim bo'yicha to'g'ridan-to'g'ri bog'lanishingiz mumkin.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 self-start sm:self-auto">
            Rasmiy aloqa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Phone card */}
          <a
            href={`tel:${teacherPhoneClean}`}
            className="p-4 rounded-2xl bg-slate-950 border border-emerald-900/50 hover:border-emerald-600 transition group space-y-2 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                📞 Telefon raqami
              </span>
              <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="text-lg font-black text-white group-hover:text-emerald-300 transition">
              {teacherPhone}
            </div>
            <p className="text-[11px] text-slate-400">
              Qo'ng'iroq qilish yoki SMS orqali bog'lanish uchun bosing.
            </p>
          </a>

          {/* Telegram card */}
          <a
            href={teacherTelegramUrl}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-slate-950 border border-sky-900/50 hover:border-sky-600 transition group space-y-2 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                💬 Telegram manzili
              </span>
              <span className="text-xs text-sky-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <div className="text-lg font-black text-white group-hover:text-sky-300 transition">
              {teacherTelegram}
            </div>
            <p className="text-[11px] text-slate-400">
              Telegramdan shaxsiy xabar yuborish va savollar berish uchun bosing.
            </p>
          </a>

          {/* Department Info */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-lg sm:col-span-2 md:col-span-1">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
              🏛 Kafedra va O'qituvchi
            </span>
            <div className="text-sm font-black text-white">
              {teacherName}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Biologik kimyo kafedrasi • Tibbiyot fakultetlari talabalari uchun dars va otrabotka qabuli.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal Triggered from inside Student Portal */}
      <ShareToStudentsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        groups={groups}
        schedule={schedule}
        curriculum={curriculum}
        selectedWeek={activeGroupWeek}
        teacherName={teacherName}
      />
    </div>
  );
};
