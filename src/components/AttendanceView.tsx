import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shirt,
  Calendar,
  BookOpen,
  Check,
  Search,
  UserCheck,
  FileCheck2,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowRight,
  Award,
  SlidersHorizontal,
  Send,
  Share2,
  Copy,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceEntry, AttendanceStatus, LessonSession, Student, StudentGroup } from '../types';
import { LateArrivalModal } from './modals/LateArrivalModal';
import { StudentDetailsModal } from './modals/StudentDetailsModal';
import { ShareToStudentsModal } from './modals/ShareToStudentsModal';
import { getPublicStudentLink, copyTextFallback } from '../utils/shareUtils';

export const AttendanceView: React.FC<{ onOpenMakeupModal?: (makeupId?: string) => void }> = ({
  onOpenMakeupModal
}) => {
  const {
    activeGroup,
    groups,
    schedule,
    teacherName,
    students,
    curriculum,
    sessions,
    saveSessionAttendance,
    updateGroupWeek,
    getGroupStudents,
    getGroupConstituents,
    setSelectedGroupId,
    pendingSession,
    setPendingSession,
    setActiveTab,
    markAtrabotkaForStudent
  } = useApp();

  // All students belonging to activeGroup (if it's an oqim, includes all constituent groups)
  const allStreamStudents = getGroupStudents(activeGroup);
  const constituentGroups = getGroupConstituents(activeGroup);
  const isStream = Boolean(activeGroup?.isLectureFlow && constituentGroups.length > 1);

  // Filter inside oqim: 'all' to show all 3 groups sectioned, or a specific groupId
  const [activeStreamGroupId, setActiveStreamGroupId] = useState<'all' | string>('all');

  // Reset activeStreamGroupId when activeGroup changes
  useEffect(() => {
    setActiveStreamGroupId('all');
  }, [activeGroup?.id]);

  // Lesson session setup states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [lessonType, setLessonType] = useState<'maruza' | 'amaliy' | 'laboratoriya' | 'seminar'>(
    activeGroup?.isLectureFlow ? 'maruza' : 'amaliy'
  );
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  // Local attendance state: studentId -> AttendanceEntry
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceEntry>>({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [subGroupFilter, setSubGroupFilter] = useState<'all' | 'A' | 'B'>('all');

  // Modals & Options state
  const [lateModalStudent, setLateModalStudent] = useState<Student | null>(null);
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedCurrentGroupLink, setCopiedCurrentGroupLink] = useState(false);

  const handleCopyCurrentGroupLink = async () => {
    if (!activeGroup) return;
    const link = getPublicStudentLink(activeGroup.name);
    await copyTextFallback(link);
    setCopiedCurrentGroupLink(true);
    setTimeout(() => setCopiedCurrentGroupLink(false), 3000);
  };

  const toggleStudentExpanded = (stId: string) => {
    setExpandedStudentIds((prev) => ({ ...prev, [stId]: !prev[stId] }));
  };

  // Immediate auto-save persistence helper so no change is ever lost
  const autoPersistAttendance = (updatedAttendance: Record<string, AttendanceEntry>, overrideNotes?: string) => {
    if (!activeGroup) return;
    const sessionToSave: LessonSession = {
      id: activeSessionId,
      groupId: activeGroup.id,
      date: selectedDate,
      weekNumber: activeGroup.currentWeek,
      lessonType,
      topicTitle: topicTitle.trim() || 'Biologik kimyo mavzusi',
      attendance: updatedAttendance,
      completed: true,
      notes: overrideNotes !== undefined ? overrideNotes : sessionNotes,
      room: activeGroup.room
    };
    saveSessionAttendance(sessionToSave);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Apply pending session if launched from CalendarPlanView or Schedule
  useEffect(() => {
    if (pendingSession) {
      if (pendingSession.date) setSelectedDate(pendingSession.date);
      if (pendingSession.lessonType) setLessonType(pendingSession.lessonType);
      if (pendingSession.topicTitle) setTopicTitle(pendingSession.topicTitle);
      setPendingSession(null);
    }
  }, [pendingSession, setPendingSession]);

  // Sync with current group, date, and curriculum
  useEffect(() => {
    if (!activeGroup) return;

    // Check if an existing session exists for this group and date
    const existing = sessions.find(
      (s) => s.groupId === activeGroup.id && s.date === selectedDate
    );

    if (existing) {
      setActiveSessionId(existing.id);
      setLessonType(existing.lessonType);
      setTopicTitle(existing.topicTitle);
      setSessionNotes(existing.notes || '');

      // Make sure all current students have an entry in attendanceState
      const mergedAttendance: Record<string, AttendanceEntry> = { ...existing.attendance };
      allStreamStudents.forEach((st) => {
        if (!mergedAttendance[st.id]) {
          mergedAttendance[st.id] = { studentId: st.id, status: 'present' };
        }
      });
      setAttendanceState(mergedAttendance);
    } else {
      // Find matching topic from curriculum for group's currentWeek and lessonType
      const targetType = activeGroup.isLectureFlow ? 'maruza' : 'amaliy';
      const matchingTopic =
        curriculum.find((c) => c.weekDefault === activeGroup.currentWeek && c.type === targetType) ||
        curriculum.find((c) => c.weekDefault === activeGroup.currentWeek) ||
        curriculum[0];

      setActiveSessionId(`ses-${Date.now()}`);
      setLessonType(targetType);
      setTopicTitle(matchingTopic ? matchingTopic.title : 'Biokimyo ma\'ruzasi');
      setSessionNotes('');

      // Initialize all students in oqim/group to 'present' (default)
      const initialMap: Record<string, AttendanceEntry> = {};
      allStreamStudents.forEach((st) => {
        initialMap[st.id] = { studentId: st.id, status: 'present' };
      });
      setAttendanceState(initialMap);
    }
  }, [activeGroup?.id, selectedDate, activeGroup?.currentWeek, allStreamStudents.length]);

  if (!activeGroup) {
    return (
      <div className="p-8 text-center text-slate-400">
        Iltimos, yuqoridan guruhni tanlang.
      </div>
    );
  }

  // Quick action: set single student status and auto-save instantly
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    const updated: Record<string, AttendanceEntry> = {
      ...attendanceState,
      [studentId]: {
        ...(attendanceState[studentId] || { studentId }),
        status,
        lateMinutes: status === 'late' ? attendanceState[studentId]?.lateMinutes || 15 : undefined,
        lateReason: status === 'late' ? attendanceState[studentId]?.lateReason : undefined,
      }
    };
    setAttendanceState(updated);
    autoPersistAttendance(updated);

    if (status === 'present') {
      setExpandedStudentIds((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // Assign custom grade for practical class and auto-save instantly
  const handleSetGrade = (studentId: string, gradeInput: string | number | undefined) => {
    const cleaned = typeof gradeInput === 'string' ? gradeInput.trim() : gradeInput;
    const finalVal = cleaned === '' ? undefined : cleaned;
    const updated: Record<string, AttendanceEntry> = {
      ...attendanceState,
      [studentId]: {
        ...(attendanceState[studentId] || { studentId, status: 'present' }),
        grade: finalVal
      }
    };
    setAttendanceState(updated);
    autoPersistAttendance(updated);
  };

  // Mark or unmark atrabotka (makeup debt) directly on student row and sync
  const handleToggleAtrabotka = (studentId: string, isDone: boolean, score?: number | string) => {
    const today = new Date().toISOString().split('T')[0];
    const finalScore = score !== undefined ? score : 5;
    const current = attendanceState[studentId] || { studentId, status: 'absent' };
    const updated: Record<string, AttendanceEntry> = {
      ...attendanceState,
      [studentId]: {
        ...current,
        atrabotkaDone: isDone,
        atrabotkaScore: isDone ? finalScore : undefined,
        atrabotkaDate: isDone ? today : undefined
      }
    };
    setAttendanceState(updated);
    autoPersistAttendance(updated);
    markAtrabotkaForStudent(activeSessionId, studentId, isDone, finalScore, today);
  };

  const handleManualSave = () => {
    autoPersistAttendance(attendanceState);
  };

  // Toggle konspekt (lecture notebook) for practical class (only for present students)
  const handleToggleKonspekt = (studentId: string) => {
    const cur = attendanceState[studentId]?.hasKonspekt;
    const nextVal = cur === true ? false : cur === false ? undefined : true;
    const updated: Record<string, AttendanceEntry> = {
      ...attendanceState,
      [studentId]: {
        ...(attendanceState[studentId] || { studentId, status: 'present' }),
        hasKonspekt: nextVal
      }
    };
    setAttendanceState(updated);
    autoPersistAttendance(updated);
  };

  // Open late modal for specific student
  const handleOpenLateModal = (student: Student) => {
    setLateModalStudent(student);
  };

  const handleSaveLateModal = (minutes: number, reason: string) => {
    if (!lateModalStudent) return;
    const updated: Record<string, AttendanceEntry> = {
      ...attendanceState,
      [lateModalStudent.id]: {
        ...(attendanceState[lateModalStudent.id] || { studentId: lateModalStudent.id }),
        status: 'late',
        lateMinutes: minutes,
        lateReason: reason
      }
    };
    setAttendanceState(updated);
    autoPersistAttendance(updated);
    setLateModalStudent(null);
  };

  // Batch actions for ALL students in stream/group
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceState };
    allStreamStudents.forEach((st) => {
      updated[st.id] = { ...(updated[st.id] || { studentId: st.id }), status: 'present' };
    });
    setAttendanceState(updated);
    setExpandedStudentIds({});
    autoPersistAttendance(updated);
  };

  const handleMarkAllAbsent = () => {
    const updated = { ...attendanceState };
    allStreamStudents.forEach((st) => {
      updated[st.id] = { ...(updated[st.id] || { studentId: st.id }), status: 'absent' };
    });
    setAttendanceState(updated);
    autoPersistAttendance(updated);
  };

  // Batch actions for a SPECIFIC constituent group
  const handleMarkGroupPresent = (targetGroupId: string) => {
    const updated = { ...attendanceState };
    const targetStudents = allStreamStudents.filter((s) => s.groupId === targetGroupId);
    targetStudents.forEach((st) => {
      updated[st.id] = { ...(updated[st.id] || { studentId: st.id }), status: 'present' };
    });
    setAttendanceState(updated);
    autoPersistAttendance(updated);
  };

  const handleMarkGroupAbsent = (targetGroupId: string) => {
    const updated = { ...attendanceState };
    const targetStudents = allStreamStudents.filter((s) => s.groupId === targetGroupId);
    targetStudents.forEach((st) => {
      updated[st.id] = { ...(updated[st.id] || { studentId: st.id }), status: 'absent' };
    });
    setAttendanceState(updated);
    autoPersistAttendance(updated);
  };

  // Save entire session
  const handleSaveSession = () => {
    const sessionToSave: LessonSession = {
      id: activeSessionId,
      groupId: activeGroup.id,
      date: selectedDate,
      weekNumber: activeGroup.currentWeek,
      lessonType,
      topicTitle: topicTitle.trim() || 'Biologik kimyo mavzusi',
      attendance: attendanceState,
      completed: true,
      notes: sessionNotes,
      room: activeGroup.room
    };

    saveSessionAttendance(sessionToSave);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  // Overall statistics for all students in this stream/group
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalNoUniform = 0;
  let totalExcused = 0;
  let totalLate = 0;
  let totalLateMinutes = 0;

  allStreamStudents.forEach((st) => {
    const entry = attendanceState[st.id];
    const stat = entry?.status || 'present';
    if (stat === 'present') totalPresent++;
    else if (stat === 'absent') totalAbsent++;
    else if (stat === 'no_uniform') totalNoUniform++;
    else if (stat === 'excused_absent') totalExcused++;
    else if (stat === 'late') {
      totalLate++;
      totalLateMinutes += entry?.lateMinutes || 15;
    }
  });

  // Helper to filter students within a specific group
  const getFilteredStudentsForGroup = (grpId: string) => {
    return allStreamStudents
      .filter((s) => s.groupId === grpId)
      .filter((st) => {
        const matchesSearch =
          st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (st.studentCode && st.studentCode.toLowerCase().includes(searchQuery.toLowerCase()));

        const currentStatus = attendanceState[st.id]?.status || 'present';
        const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
        const matchesSubGroup = subGroupFilter === 'all' || st.subGroup === subGroupFilter;

        return matchesSearch && matchesStatus && matchesSubGroup;
      });
  };

  // Render a student card / row
  const renderStudentRow = (student: Student, index: number) => {
    const currentEntry = attendanceState[student.id] || { status: 'present' };
    const isLate = currentEntry.status === 'late';
    const isAbsent = currentEntry.status === 'absent';
    const isNoUniform = currentEntry.status === 'no_uniform';
    const isExcused = currentEntry.status === 'excused_absent';
    const isPresent = currentEntry.status === 'present';
    const isExpanded = !isPresent || Boolean(expandedStudentIds[student.id]);

    return (
      <div
        key={student.id}
        className={`p-3.5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 ${
          isAbsent
            ? 'bg-rose-950/25 border-rose-900/30'
            : isLate
            ? 'bg-amber-950/25 border-amber-900/30'
            : isNoUniform
            ? 'bg-orange-950/25 border-orange-900/30'
            : 'hover:bg-slate-850/60'
        }`}
      >
        {/* Student Dossier / Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <span className="text-xs font-mono font-bold text-slate-500 w-6 text-right shrink-0">
            {index + 1}.
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={() => setDetailsStudent(student)}
                className="font-bold text-sm text-slate-100 hover:text-teal-400 transition text-left truncate"
              >
                {student.fullName}
              </button>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                {student.studentCode || 'ST'}
              </span>
              {student.subGroup && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${
                    student.subGroup === 'A'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  Guruh {student.subGroup}
                </span>
              )}

              {/* Practical Grade & Konspekt Badge if assigned (faqat amaliyotda) */}
              {lessonType !== 'maruza' && currentEntry.grade !== undefined && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-500/40 bg-amber-500/20 text-amber-300 flex items-center space-x-1 shrink-0">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Baho: {currentEntry.grade}</span>
                </span>
              )}

              {lessonType !== 'maruza' && currentEntry.hasKonspekt !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center space-x-1 shrink-0 ${
                    currentEntry.hasKonspekt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{currentEntry.hasKonspekt ? 'Konspekt bor' : 'Konspektsiz'}</span>
                </span>
              )}

              {currentEntry.atrabotkaDone && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 flex items-center space-x-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Otrabotka yopilgan ({currentEntry.atrabotkaScore || 5} baho)</span>
                </span>
              )}
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center space-x-2 mt-1">
              {isLate && (
                <span className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <Clock className="w-3 h-3" />
                  <span>⏱ {currentEntry.lateMinutes || 15} daqiqa kechikkan</span>
                  {currentEntry.lateReason && (
                    <span className="text-amber-200/70 font-normal">({currentEntry.lateReason})</span>
                  )}
                </span>
              )}

              {isAbsent && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  🔴 NB: Darsda yo'q (Sababsiz, 2 soat qarzdorlik)
                </span>
              )}

              {isNoUniform && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                  🟡 Formasiz kelgan (xalatsiz)
                </span>
              )}

              {isExcused && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  🔵 Sababli dars qoldirgan (spravka)
                </span>
              )}

              {isPresent && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Darsda hozir (Bor)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Attendance Action + Practical Grading & Konspekt */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
          {/* ======================================================== */}
          {/* AMALIYOT: DARSDA BOR TALABA UCHUN KONSPEKT VA BAHO      */}
          {/* (Ma'ruzalarda umuman ko'rinmaydi, yo'q talabada ham yo'q) */}
          {/* ======================================================== */}
          {lessonType !== 'maruza' && isPresent && (
            <div className="flex items-center space-x-2">
              {/* KONSPEKTNI BELGILASH TUGMASI (User requirement) */}
              <button
                type="button"
                onClick={() => handleToggleKonspekt(student.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border shadow-sm ${
                  currentEntry.hasKonspekt === true
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : currentEntry.hasKonspekt === false
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
                title="Talabaning amaliy darsga konspekti bor yoki yo'qligini belgilash (bosing)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {currentEntry.hasKonspekt === true
                    ? '📒 Konspekt: Bor'
                    : currentEntry.hasKonspekt === false
                    ? '📕 Konspekt: Yo\'q'
                    : '📓 Konspekt ?'}
                </span>
              </button>

              {/* BAHO QO'YISH JOYI: Tezkor 5, 4, 3 tugmalari va erkin kiritish */}
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase font-bold text-amber-300">Baho:</span>
                </span>
                <div className="flex items-center space-x-1">
                  {[5, 4, 3].map((gVal) => (
                    <button
                      key={gVal}
                      type="button"
                      onClick={() => handleSetGrade(student.id, String(currentEntry.grade) === String(gVal) ? undefined : gVal)}
                      className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center border ${
                        String(currentEntry.grade) === String(gVal)
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-750 hover:bg-slate-700'
                      }`}
                      title={`${gVal} baho qo'yish (bosing)`}
                    >
                      {gVal}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={currentEntry.grade !== undefined ? String(currentEntry.grade) : ''}
                  onChange={(e) => handleSetGrade(student.id, e.target.value)}
                  placeholder="—"
                  className="w-10 bg-slate-950 text-amber-300 font-black text-center text-xs py-1 px-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  title="Bahoni o'zingiz kiriting (avtomatik saqlanadi)"
                />
                {currentEntry.grade !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleSetGrade(student.id, undefined)}
                    className="text-[11px] text-slate-500 hover:text-rose-400 px-1 font-bold"
                    title="Bahoni tozalash"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* DAVOMAT: ODDIYDA FAQAT 'DARSDA YO'Q', BOSILSA QOLGANLARI */}
          {/* ======================================================== */}
          {isPresent && !expandedStudentIds[student.id] ? (
            <div className="flex items-center space-x-1.5">
              {/* PRIMARY SINGLE BUTTON: DARSDA YO'Q */}
              <button
                type="button"
                onClick={() => handleSetStatus(student.id, 'absent')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 transition shadow-sm flex items-center space-x-1.5"
                title="Talabani darsda yo'q deb belgilash (bosilganda qo'shimcha tugmalar ochiladi)"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>🔴 Darsda yo'q (NB)</span>
              </button>

              {/* Quick toggle to expand options (Formasiz / Kechikkan) without making absent */}
              <button
                type="button"
                onClick={() => toggleStudentExpanded(student.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
                title="Boshqa holatlar (Formasiz, Kechikkan)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* SUB-BUTTONS OPENED UPON CLICKING DARSDA YO'Q OR EXPAND */
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700/80 animate-in fade-in">
              {/* BOR QILISH (REVERT) */}
              <button
                type="button"
                onClick={() => handleSetStatus(student.id, 'present')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center space-x-1 shadow"
                title="Darsda bor holatiga qaytarish"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Bor qilish</span>
              </button>

              {/* FORMASIZ */}
              <button
                type="button"
                onClick={() => handleSetStatus(student.id, 'no_uniform')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  isNoUniform
                    ? 'bg-orange-500 text-slate-950 ring-2 ring-orange-300 font-extrabold shadow'
                    : 'bg-slate-800 text-orange-400 border border-slate-700 hover:bg-slate-750'
                }`}
                title="Xalatsiz / formasiz kelgan"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Formasiz</span>
              </button>

              {/* KECH QOLDI */}
              <button
                type="button"
                onClick={() => handleOpenLateModal(student)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                  isLate
                    ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-300 font-extrabold shadow'
                    : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-750'
                }`}
                title="Kechikkan vaqtini kiritish"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isLate ? `⏱ ${currentEntry.lateMinutes}m` : 'Kech qoldi'}</span>
              </button>

              {/* SABABLI */}
              <button
                type="button"
                onClick={() => handleSetStatus(student.id, 'excused_absent')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                  isExcused
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 font-bold shadow'
                    : 'bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-750'
                }`}
                title="Sababli ruxsatnoma yoki spravka bilan"
              >
                Sababli
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* OTRABOTKA (QAYTA TOPSHIRISH) TEZKOR AMALLARI (NB UCHUN)   */}
          {/* ======================================================== */}
          {(isAbsent || isExcused) && (
            <div className="flex items-center space-x-1.5 animate-in fade-in">
              {currentEntry.atrabotkaDone ? (
                <div className="flex items-center space-x-1.5 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-xl shadow">
                  <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Otrabotka:</span>
                    <strong className="text-amber-300 font-black">{currentEntry.atrabotkaScore || 5} baho</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAtrabotka(student.id, false)}
                    className="text-[10px] text-slate-400 hover:text-rose-400 ml-1 font-bold underline"
                    title="Otrabotkani bekor qilish"
                  >
                    Bekor
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 px-1">Otrabotka:</span>
                  {[5, 4, 3].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => handleToggleAtrabotka(student.id, true, sc)}
                      className={`w-6 h-6 rounded-lg text-xs font-black transition flex items-center justify-center border ${
                        sc === 5
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500 hover:text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-750'
                      }`}
                      title={`${sc} baho bilan otrabotka topshirdi deb belgilash`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dossier details */}
          <button
            type="button"
            onClick={() => setDetailsStudent(student)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Talaba dars qoldirishlari va natijalari"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Session Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wide border border-teal-500/30">
                {activeGroup.name}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wide border border-emerald-500/30">
                {activeGroup.currentWeek}-hafta
              </span>
              {isStream && (
                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>3 ta guruh oqimi ({allStreamStudents.length} nafar talaba)</span>
                </span>
              )}
              {activeGroup.internship?.isActive && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center space-x-1">
                  <span>🏥 2 haftalik amaliyotda ({activeGroup.internship.startDate} — {activeGroup.internship.endDate})</span>
                </span>
              )}
              <span className="text-xs text-slate-400">
                ({activeGroup.faculty}, {activeGroup.course}-kurs)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center space-x-2">
              <span>Davomat qaydnomasi (Bor / Yo'q va Kechikish jurnali)</span>
            </h2>
            {activeGroup.internship?.isActive && (
              <p className="text-xs text-amber-300/90 font-medium mt-1 flex items-center space-x-1.5">
                <span>⚠️ Ushbu guruh 12.10.2026 dan 2 haftalik amaliyotda. Amaliyotdan qaytgach ({activeGroup.internship.resumeWeek}-haftadan), darslar kelgan joyidan ({activeGroup.internship.pausedLessonNumber + 1}-darsdan) davom etadi.</span>
              </p>
            )}
          </div>

          {/* Week Quick Setter: ALL 12 WEEKS */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-850 p-2 rounded-2xl border border-slate-750 self-start lg:self-auto">
            <span className="text-xs text-slate-300 font-bold pl-1 whitespace-nowrap flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Hafta:</span>
            </span>
            <div className="flex space-x-1 overflow-x-auto scrollbar-none py-0.5 max-w-[340px] sm:max-w-[420px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateGroupWeek(activeGroup.id, w)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap shrink-0 ${
                    activeGroup.currentWeek === w
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                  title={`${w}-hafta (dars) etib belgilash`}
                >
                  {w}-h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 19-OKTYABRDAN 4-HAFTA VA TAQVIM QOIDASI BANNERI */}
        <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[10px]">
              19-oktyabrdan 4-hafta
            </span>
            <span>
              Real kalendar: <strong>19-oktyabr Dushanbadan 4-hafta</strong> boshlanadi. Dushanba, Seshanba, Chorshanba, Juma guruhlariga <strong>4-dars</strong>; Payshanba guruhlariga (1-oktyabr bayrami hisobiga) <strong>3-dars</strong>.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {saveSuccessMsg && (
              <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Baho, NB va Otrabotka saqlandi</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleManualSave}
              className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-md flex items-center space-x-1 transition"
              title="Kiritilgan barcha baho, NB va otrabotkalarni xotirada saqlash"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Saqlash</span>
            </button>
          </div>
        </div>

        {/* Quick Link Sharing for this group and all groups */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-teal-900/40">
          <div className="flex items-center space-x-2 text-slate-300 flex-wrap gap-y-1">
            <span className="text-teal-400 font-black flex items-center space-x-1.5 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              <Share2 className="w-3.5 h-3.5" />
              <span>Guruh uchun maxsus havola:</span>
            </span>
            <span className="text-white font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-750">
              ?view=student&group={activeGroup.name}
            </span>
            <span className="text-slate-400 text-[11px]">
              🔒 Talabalar faqat <strong>{activeGroup.name}</strong> ma'lumotlarini ko'ra oladilar
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyCurrentGroupLink}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                copiedCurrentGroupLink
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow'
              }`}
              title={`${activeGroup.name} guruhi uchun to'g'ridan-to'g'ri havolani nusxalash`}
            >
              {copiedCurrentGroupLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{activeGroup.name} linkini nusxalash</span>
                </>
              )}
            </button>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(getPublicStudentLink(activeGroup.name))}&text=${encodeURIComponent(`📢 Biologik kimyo fani: ${activeGroup.name} guruhi dars jadvali va talabalar portali:\n👉 ${getPublicStudentLink(activeGroup.name)}\n\n🔒 Eslatma: Ushbu havola orqali faqat ${activeGroup.name} guruhi ma'lumotlari ko'rinadi.\n\n📞 O'qituvchi bilan aloqa: +998 99 839 98 80 | @Biochemistry715`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center space-x-1 shrink-0"
              title={`${activeGroup.name} guruhi Telegram chatiga yuborish`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition flex items-center space-x-1.5 shadow"
              title="Barcha guruhlarning alohida linklarini ko'rish va Telegramga ulashish"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Barcha guruhlar linklari ({groups.length} ta)</span>
            </button>
          </div>
        </div>

        {/* Date, Type, Topic Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Dars sanasi:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Mashg'ulot turi:
            </label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value as any)}
              className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="maruza">Ma'ruza (Oqim / Umumiy)</option>
              <option value="amaliy">Amaliy mashg'ulot</option>
              <option value="laboratoriya">Laboratoriya ishi</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>O'tilayotgan mavzu (Kalendar rejadan):</span>
              </span>
              <span className="text-[10px] text-teal-400 font-mono">
                {activeGroup.currentWeek}-hafta mavzusi
              </span>
            </label>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="Masalan: Biologik kimyoga kirish. Oqsillar biokimyosi..."
              className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Amaliy mashg'ulot bo'lganda vazifalar yuborish tezkor tugmasi */}
        {lessonType === 'amaliy' && (
          <div className="mt-3.5 bg-gradient-to-r from-purple-950/50 to-slate-900 border border-purple-800/40 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2.5 text-xs text-purple-200">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white">Amaliy mashg'ulot vazifalari (A1 – A10):</strong>
                <p className="text-purple-300/80 text-[11px] mt-0.5">
                  Ushbu dars uchun talabalarga klinik masalalar, topshiriqlar va savollar yuboring yoki topshirilgan javoblarni tekshiring.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('independent')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-purple-500 hover:bg-purple-400 text-slate-950 transition flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Vazifalar yuborish / tekshirish</span>
            </button>
          </div>
        )}
      </div>

      {/* TOP OVERALL STATISTICS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'all'
              ? 'bg-slate-800 border-teal-500 ring-2 ring-teal-500/20'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Jami talabalar</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{allStreamStudents.length} nafar</div>
          <span className="text-[11px] text-slate-400">
            {isStream ? `${constituentGroups.length} ta guruh birga` : 'Ro\'yxatdagi talabalar'}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'present'
              ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-300 font-bold uppercase">🟢 Darsda BOR</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalPresent} ta</div>
          <span className="text-[11px] text-emerald-300/80">
            {allStreamStudents.length > 0
              ? `${Math.round((totalPresent / allStreamStudents.length) * 100)}% qatnashuv`
              : '100%'}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'absent'
              ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-rose-950/30 border-rose-800/40 hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rose-300 font-bold uppercase">🔴 Darsda YO'Q (NB)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{totalAbsent} ta</div>
          <span className="text-[11px] text-rose-300/80">{totalAbsent * 2} soat NB qarzdorlik</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'late'
              ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-950/30 border-amber-800/40 hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-bold uppercase">⏱ Kech qoldi</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalLate} ta</div>
          <span className="text-[11px] text-amber-300/80">
            {totalLateMinutes > 0 ? `${totalLateMinutes} daqiqa jami` : 'Kechikishlar'}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'no_uniform' ? 'all' : 'no_uniform')}
          className={`p-3.5 rounded-xl border text-left transition ${
            statusFilter === 'no_uniform'
              ? 'bg-orange-950/60 border-orange-500 ring-2 ring-orange-500/20'
              : 'bg-orange-950/30 border-orange-800/40 hover:border-orange-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-orange-300 font-bold uppercase">🟡 Formasiz</span>
            <Shirt className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 mt-1">{totalNoUniform} ta</div>
          <span className="text-[11px] text-orange-300/80">Xalatsiz talabalar</span>
        </button>
      </div>

      {/* OQIM GURUHLARI TABS (User's specific core requirement: "har bir oqimni tanlaganda 3 ta guruh talabalari alohida alohida guruh sifatida ochilsin") */}
      {isStream && (
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/50 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Oqim tarkibidagi 3 ta guruh ko'rinishi:
              </h3>
              <span className="text-xs text-purple-300/80">
                (Har bir guruhni alohida yoki barchasini ajratilgan holda ko'rish)
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Oqim: <span className="text-purple-300 font-bold">{activeGroup.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStreamGroupId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeStreamGroupId === 'all'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Barcha 3 ta guruh (Ajratilgan bloklar, {allStreamStudents.length} talaba)</span>
            </button>

            {constituentGroups.map((grp, idx) => {
              const count = allStreamStudents.filter((s) => s.groupId === grp.id).length;
              const isSelected = activeStreamGroupId === grp.id;
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => setActiveStreamGroupId(grp.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 ring-2 ring-teal-400'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900/60 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{grp.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900/80 text-teal-300 font-mono">
                    {count} talaba
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch Operations & Global Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Talabani qidirish (F.I.Sh yoki ID)..."
            className="w-full bg-slate-800 text-sm text-slate-100 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Global batch actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center space-x-1"
            title="Ushbu darsdagi barcha talabalarni bor (qatnashmoqda) deb belgilash"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Barchasini BOR qilish</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllAbsent}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition flex items-center space-x-1"
            title="Barcha talabalarni darsda yo'q deb belgilash"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Barchasini NB qilish</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSession}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-emerald-400 transition flex items-center space-x-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Davomatni saqlash</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center space-x-2 text-sm font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Davomat va qoldirilgan darslar (NB) muvaffaqiyatli saqlandi! Kelmagan talabalar avtomatik ravishda Otrabotka (qayta topshirish) hisobiga kiritildi.
          </span>
        </div>
      )}

      {/* STUDENT LIST RENDER SECTION:
          When viewing an oqim and activeStreamGroupId === 'all', we render EACH constituent group as its own distinct card/container.
          Otherwise we render the single selected group container! */}
      {constituentGroups
        .filter((grp) => activeStreamGroupId === 'all' || grp.id === activeStreamGroupId)
        .map((groupItem, gIdx) => {
          const groupStudentsList = getFilteredStudentsForGroup(groupItem.id);
          const totalInThisGroup = allStreamStudents.filter((s) => s.groupId === groupItem.id).length;

          // Group-specific counts
          let grpPresent = 0;
          let grpAbsent = 0;
          let grpLate = 0;
          let grpNoUniform = 0;

          allStreamStudents
            .filter((s) => s.groupId === groupItem.id)
            .forEach((st) => {
              const stat = attendanceState[st.id]?.status || 'present';
              if (stat === 'present') grpPresent++;
              else if (stat === 'absent') grpAbsent++;
              else if (stat === 'late') grpLate++;
              else if (stat === 'no_uniform') grpNoUniform++;
            });

          return (
            <div
              key={groupItem.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all"
            >
              {/* Distinct Group Header Card */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
                      {gIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-white text-base">
                          Guruh: {groupItem.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {groupItem.faculty}
                        </span>
                        {groupItem.room && (
                          <span className="text-[11px] text-teal-400">
                            Auditoriya: {groupItem.room}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span>Jami: <strong className="text-white">{totalInThisGroup} nafar</strong> talaba</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">Bor: {grpPresent}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">NB: {grpAbsent}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">Kech: {grpLate}</span>
                        {grpNoUniform > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-400 font-semibold">Formasiz: {grpNoUniform}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subgroup A / B filter buttons */}
                  <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs ml-auto lg:ml-4">
                    <button
                      type="button"
                      onClick={() => setSubGroupFilter('all')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        subGroupFilter === 'all'
                          ? 'bg-teal-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Barchasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubGroupFilter('A')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        subGroupFilter === 'A'
                          ? 'bg-indigo-500 text-white shadow'
                          : 'text-indigo-300 hover:text-white'
                      }`}
                    >
                      Kichik A
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubGroupFilter('B')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        subGroupFilter === 'B'
                          ? 'bg-purple-500 text-white shadow'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      Kichik B
                    </button>
                  </div>
                </div>

                {/* Group-specific quick batch operations */}
                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleMarkGroupPresent(groupItem.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center space-x-1"
                    title={`${groupItem.name} barcha talabalarini bor qilish`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Shu guruhni BOR qilish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkGroupAbsent(groupItem.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition flex items-center space-x-1"
                    title={`${groupItem.name} barcha talabalarini darsda yo'q qilish`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Shu guruhni NB qilish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(groupItem.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition"
                    title="Ushbu guruhni asosiy guruh qilib ochish"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Group Student Rows */}
              {groupStudentsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  {searchQuery || statusFilter !== 'all' || subGroupFilter !== 'all'
                    ? "Ushbu filtr bo'yicha bu guruhda talabalar topilmadi."
                    : "Bu guruhda hali talabalar mavjud emas."}
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {groupStudentsList.map((st, sIdx) => renderStudentRow(st, sIdx))}
                </div>
              )}
            </div>
          );
        })}

      {/* Late Arrival Recording Modal */}
      <LateArrivalModal
        isOpen={Boolean(lateModalStudent)}
        onClose={() => setLateModalStudent(null)}
        student={lateModalStudent}
        currentMinutes={lateModalStudent ? attendanceState[lateModalStudent.id]?.lateMinutes : undefined}
        currentReason={lateModalStudent ? attendanceState[lateModalStudent.id]?.lateReason : undefined}
        onSave={handleSaveLateModal}
      />

      {/* Student Dossier Modal */}
      <StudentDetailsModal
        isOpen={Boolean(detailsStudent)}
        onClose={() => setDetailsStudent(null)}
        student={detailsStudent}
        onOpenMakeup={onOpenMakeupModal}
      />

      {/* Share To Students Modal with individual group links */}
      <ShareToStudentsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        groups={groups}
        schedule={schedule}
        curriculum={curriculum}
        selectedWeek={activeGroup?.currentWeek || 4}
        teacherName={teacherName}
      />
    </div>
  );
};
