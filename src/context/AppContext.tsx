import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentGroup,
  Student,
  CurriculumTopic,
  IndependentTopic,
  LessonSession,
  MakeupRecord,
  StudentIndependentAssignment,
  AttendanceStatus,
  LessonType,
  WeeklyScheduleSlot,
  PracticalTask,
  StudentTaskSubmission,
  GroupInternshipInfo
} from '../types';
import {
  INITIAL_GROUPS,
  INITIAL_SCHEDULE,
  INITIAL_STUDENTS,
  INITIAL_CURRICULUM,
  INITIAL_INDEPENDENT_TOPICS,
  INITIAL_SESSIONS,
  INITIAL_MAKEUPS,
  INITIAL_ASSIGNMENTS,
  INITIAL_PRACTICAL_TASKS,
  TEACHER_FULL_NAME
} from '../data/initialData';

const STORAGE_KEY = 'mamazulunov_journal_data_v30';

export type AppTab = 'schedule' | 'attendance' | 'makeups' | 'independent' | 'curriculum' | 'students' | 'reports' | 'student_portal';

export interface PendingSessionParams {
  groupId: string;
  lessonType?: LessonType;
  room?: string;
  date?: string;
  topicTitle?: string;
}

interface AppContextType {
  // Data
  teacherName: string;
  groups: StudentGroup[];
  schedule: WeeklyScheduleSlot[];
  students: Student[];
  curriculum: CurriculumTopic[];
  independentTopics: IndependentTopic[];
  sessions: LessonSession[];
  makeups: MakeupRecord[];
  assignments: StudentIndependentAssignment[];
  practicalTasks: PracticalTask[];
  taskSubmissions: StudentTaskSubmission[];

  // Helpers for Oqim (streams) and regular groups
  getGroupStudents: (groupOrId?: StudentGroup | string) => Student[];
  getGroupConstituents: (groupOrId?: StudentGroup | string) => StudentGroup[];

  // Active navigation & view state
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  activeGroup: StudentGroup | undefined;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  pendingSession: PendingSessionParams | null;
  setPendingSession: (params: PendingSessionParams | null) => void;
  startSessionForGroup: (groupId: string, lessonType?: LessonType, room?: string, date?: string, topicTitle?: string) => void;

  // Schedule Management
  addScheduleSlot: (slot: Omit<WeeklyScheduleSlot, 'id'>) => void;
  updateScheduleSlot: (slot: WeeklyScheduleSlot) => void;
  deleteScheduleSlot: (slotId: string) => void;
  resetScheduleToDefault: () => void;

  // Actions
  updateGroupWeek: (groupId: string, week: number) => void;
  addGroup: (group: Omit<StudentGroup, 'id'>) => void;
  updateGroup: (group: StudentGroup) => void;
  deleteGroup: (groupId: string) => void;
  setGroupInternship: (groupId: string, internship: GroupInternshipInfo | undefined) => void;
  bulkSetGroupInternship: (groupIds: string[], internship: GroupInternshipInfo | undefined) => void;

  addStudent: (student: Omit<Student, 'id'>) => void;
  bulkAddStudents: (groupId: string, rawText: string) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;

  saveSessionAttendance: (session: LessonSession) => void;
  quickSetStatus: (sessionId: string, studentId: string, status: AttendanceStatus, lateMinutes?: number, lateReason?: string) => void;
  recordLateArrival: (sessionId: string, studentId: string, minutes: number, reason: string) => void;
  markAtrabotkaForStudent: (sessionId: string, studentId: string, isDone: boolean, score?: number | string, date?: string) => void;

  saveMakeup: (makeup: Omit<MakeupRecord, 'id' | 'recordedAt'> & { id?: string }) => void;
  deleteMakeup: (makeupId: string) => void;

  addCurriculumTopic: (topic: Omit<CurriculumTopic, 'id'>) => void;
  updateCurriculumTopic: (topic: CurriculumTopic) => void;
  deleteCurriculumTopic: (topicId: string) => void;
  bulkImportCurriculum: (text: string) => void;

  addIndependentTopic: (topic: Omit<IndependentTopic, 'id'>) => void;
  assignIndependentTopicToStudent: (studentId: string, groupId: string, topicId: string, deadline: string) => void;
  autoAssignIndependentTopics: (groupId: string, deadline: string) => void;
  autoAssignAllGroupsIndependent: (deadline?: string) => void;
  updateAssignment: (assignment: StudentIndependentAssignment) => void;

  // Practical Tasks (10 ta amaliy mashg'ulot vazifalari)
  createPracticalTask: (task: Omit<PracticalTask, 'id' | 'createdAt'>) => void;
  updatePracticalTask: (task: PracticalTask) => void;
  deletePracticalTask: (taskId: string) => void;
  submitStudentTask: (submission: Omit<StudentTaskSubmission, 'id'>) => void;
  gradeStudentTask: (submissionId: string, grade: number | string, feedback?: string) => void;

  // Utilities
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDemoData: () => void;
  syncOfficialRosters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const teacherName = TEACHER_FULL_NAME;

  const [groups, setGroups] = useState<StudentGroup[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_groups`);
    if (!saved) return INITIAL_GROUPS;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return INITIAL_GROUPS;
      }
      return parsed;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [schedule, setSchedule] = useState<WeeklyScheduleSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schedule`);
    if (!saved) return INITIAL_SCHEDULE;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return INITIAL_SCHEDULE;
      }
      return parsed;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return INITIAL_STUDENTS;
      }
      return parsed;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [curriculum, setCurriculum] = useState<CurriculumTopic[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_curriculum`);
    return saved ? JSON.parse(saved) : INITIAL_CURRICULUM;
  });

  const [independentTopics, setIndependentTopics] = useState<IndependentTopic[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_independentTopics`);
    return saved ? JSON.parse(saved) : INITIAL_INDEPENDENT_TOPICS;
  });

  const [sessions, setSessions] = useState<LessonSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [makeups, setMakeups] = useState<MakeupRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_makeups`);
    return saved ? JSON.parse(saved) : INITIAL_MAKEUPS;
  });

  const [assignments, setAssignments] = useState<StudentIndependentAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [practicalTasks, setPracticalTasks] = useState<PracticalTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_practicalTasks`);
    return saved ? JSON.parse(saved) : INITIAL_PRACTICAL_TASKS;
  });

  const [taskSubmissions, setTaskSubmissions] = useState<StudentTaskSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_taskSubmissions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qGroup = urlParams.get('group');
      if (qGroup) {
        const found = INITIAL_GROUPS.find(
          (g) =>
            g.id === qGroup ||
            g.name.toLowerCase().replace(/\s+/g, '') === qGroup.toLowerCase().replace(/\s+/g, '')
        );
        if (found) return found.id;
      }
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_selectedGroupId`);
    return saved || (INITIAL_GROUPS[0]?.id ?? '');
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'teacher' || urlParams.get('role') === 'teacher') {
        return 'attendance';
      }
      if (
        urlParams.get('view') === 'student' ||
        urlParams.get('role') === 'student' ||
        urlParams.get('group')
      ) {
        return 'student_portal';
      }
    }
    return 'attendance';
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schedule`, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_curriculum`, JSON.stringify(curriculum));
  }, [curriculum]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_independentTopics`, JSON.stringify(independentTopics));
  }, [independentTopics]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_makeups`, JSON.stringify(makeups));
  }, [makeups]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_practicalTasks`, JSON.stringify(practicalTasks));
  }, [practicalTasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_taskSubmissions`, JSON.stringify(taskSubmissions));
  }, [taskSubmissions]);

  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem(`${STORAGE_KEY}_selectedGroupId`, selectedGroupId);
    }
  }, [selectedGroupId]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const getGroupStudents = (groupOrId?: StudentGroup | string): Student[] => {
    const targetGroup = typeof groupOrId === 'string'
      ? groups.find((g) => g.id === groupOrId)
      : (groupOrId || activeGroup);

    if (!targetGroup) return [];
    if (targetGroup.isLectureFlow && targetGroup.constituentGroupIds && targetGroup.constituentGroupIds.length > 0) {
      return students.filter((s) => targetGroup.constituentGroupIds!.includes(s.groupId));
    }
    return students.filter((s) => s.groupId === targetGroup.id);
  };

  const getGroupConstituents = (groupOrId?: StudentGroup | string): StudentGroup[] => {
    const targetGroup = typeof groupOrId === 'string'
      ? groups.find((g) => g.id === groupOrId)
      : (groupOrId || activeGroup);

    if (!targetGroup) return [];
    if (targetGroup.isLectureFlow && targetGroup.constituentGroupIds && targetGroup.constituentGroupIds.length > 0) {
      return groups.filter((g) => targetGroup.constituentGroupIds!.includes(g.id));
    }
    return [targetGroup];
  };

  const [pendingSession, setPendingSession] = useState<PendingSessionParams | null>(null);

  const startSessionForGroup = (
    groupId: string,
    lessonType?: LessonType,
    room?: string,
    date?: string,
    topicTitle?: string
  ) => {
    setSelectedGroupId(groupId);
    setPendingSession({ groupId, lessonType, room, date, topicTitle });
    setActiveTab('attendance');
  };

  // Actions implementation
  const updateGroupWeek = (groupId: string, week: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, currentWeek: Math.max(1, week) } : g))
    );
  };

  const addGroup = (groupData: Omit<StudentGroup, 'id'>) => {
    const newGroup: StudentGroup = {
      ...groupData,
      id: `grp-${Date.now()}`
    };
    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
  };

  const updateGroup = (updated: StudentGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (selectedGroupId === groupId) {
      const remaining = groups.filter((g) => g.id !== groupId);
      if (remaining.length > 0) {
        setSelectedGroupId(remaining[0].id);
      }
    }
  };

  const setGroupInternship = (groupId: string, internship: GroupInternshipInfo | undefined) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, internship } : g))
    );
  };

  const bulkSetGroupInternship = (groupIds: string[], internship: GroupInternshipInfo | undefined) => {
    setGroups((prev) =>
      prev.map((g) => (groupIds.includes(g.id) ? { ...g, internship } : g))
    );
  };

  const addScheduleSlot = (slotData: Omit<WeeklyScheduleSlot, 'id'>) => {
    const newSlot: WeeklyScheduleSlot = {
      ...slotData,
      id: `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setSchedule((prev) => [...prev, newSlot]);
  };

  const updateScheduleSlot = (updated: WeeklyScheduleSlot) => {
    setSchedule((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteScheduleSlot = (slotId: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== slotId));
  };

  const resetScheduleToDefault = () => {
    setSchedule(INITIAL_SCHEDULE);
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const bulkAddStudents = (groupId: string, rawText: string) => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const targetGrp = groups.find((g) => g.id === groupId);
    const grpPrefix = targetGrp?.name.split('-')[1]?.trim() || targetGrp?.name.slice(0, 4) || 'ST';

    const newStudents: Student[] = lines.map((line, idx) => {
      const cleanName = line.replace(/^\d+[\.\)\-\s]+/, '').trim();
      const parts = cleanName.split(/[,;\t]/).map((p) => p.trim());
      const fullName = parts[0];
      const phone = parts[1] || '';
      return {
        id: `st-${Date.now()}-${idx}`,
        groupId,
        fullName,
        phone,
        studentCode: `${grpPrefix}-${(students.filter(s => s.groupId === groupId).length + idx + 1).toString().padStart(2, '0')}`
      };
    });

    setStudents((prev) => [...prev, ...newStudents]);
  };

  const updateStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const saveSessionAttendance = (session: LessonSession) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = session;
        return next;
      }
      return [...prev, session];
    });

    // Automatically check for absent students (NB) and ensure makeup records exist and stay in sync
    Object.entries(session.attendance).forEach(([stId, entry]) => {
      const studentObj = students.find((s) => s.id === stId);
      const studentGroupId = studentObj ? studentObj.groupId : session.groupId;

      if (entry.status === 'absent' || entry.status === 'excused_absent' || entry.atrabotkaDone) {
        setMakeups((prevMakeups) => {
          const existing = prevMakeups.find(
            (m) => m.studentId === stId && m.missedSessionId === session.id
          );
          if (existing) {
            return prevMakeups.map((m) =>
              m.id === existing.id
                ? {
                    ...m,
                    status: entry.atrabotkaDone ? 'submitted' : m.status,
                    score: entry.atrabotkaDone ? Number(entry.atrabotkaScore || entry.grade || m.score || 5) : m.score,
                    submittedDate: entry.atrabotkaDone ? entry.atrabotkaDate || m.submittedDate || session.date : m.submittedDate
                  }
                : m
            );
          } else {
            const newMakeup: MakeupRecord = {
              id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              studentId: stId,
              groupId: studentGroupId,
              missedSessionId: session.id,
              missedDate: session.date,
              missedTopic: session.topicTitle,
              lessonType: session.lessonType,
              status: entry.atrabotkaDone ? 'submitted' : 'pending',
              score: entry.atrabotkaDone ? Number(entry.atrabotkaScore || entry.grade || 5) : undefined,
              submittedDate: entry.atrabotkaDone ? entry.atrabotkaDate || session.date : undefined,
              recordedAt: new Date().toISOString(),
              teacherNote: entry.note || (entry.status === 'excused_absent' ? 'Sababli dars qoldirgan' : 'Sababsiz NB (2 soat)')
            };
            return [...prevMakeups, newMakeup];
          }
        });
      } else {
        // If status changed from absent to present/late without atrabotka, clean up automatic pending makeup
        setMakeups((prevMakeups) =>
          prevMakeups.filter(
            (m) => !(m.studentId === stId && m.missedSessionId === session.id && m.status === 'pending')
          )
        );
      }
    });
  };

  const quickSetStatus = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    lateMinutes?: number,
    lateReason?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [studentId]: {
              studentId,
              status,
              lateMinutes: status === 'late' ? lateMinutes || 15 : undefined,
              lateReason: status === 'late' ? lateReason : undefined,
              note: s.attendance[studentId]?.note,
              grade: s.attendance[studentId]?.grade,
              hasKonspekt: s.attendance[studentId]?.hasKonspekt,
              atrabotkaDone: s.attendance[studentId]?.atrabotkaDone,
              atrabotkaScore: s.attendance[studentId]?.atrabotkaScore,
              atrabotkaDate: s.attendance[studentId]?.atrabotkaDate
            }
          }
        };
      })
    );

    // Sync makeup record
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (targetSession) {
      if (status === 'absent' || status === 'excused_absent') {
        setMakeups((prevMakeups) => {
          const exists = prevMakeups.some(
            (m) => m.studentId === studentId && m.missedSessionId === sessionId
          );
          if (!exists) {
            const newMakeup: MakeupRecord = {
              id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              studentId,
              groupId: targetSession.groupId,
              missedSessionId: sessionId,
              missedDate: targetSession.date,
              missedTopic: targetSession.topicTitle,
              lessonType: targetSession.lessonType,
              status: 'pending',
              recordedAt: new Date().toISOString()
            };
            return [...prevMakeups, newMakeup];
          }
          return prevMakeups;
        });
      } else {
        setMakeups((prev) =>
          prev.filter(
            (m) => !(m.studentId === studentId && m.missedSessionId === sessionId && m.status === 'pending')
          )
        );
      }
    }
  };

  const markAtrabotkaForStudent = (
    sessionId: string,
    studentId: string,
    isDone: boolean,
    score?: number | string,
    date?: string
  ) => {
    const todayIso = date || new Date().toISOString().split('T')[0];
    const finalScore = score !== undefined ? score : 5;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const currentEntry = s.attendance[studentId] || { studentId, status: 'absent' };
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [studentId]: {
              ...currentEntry,
              atrabotkaDone: isDone,
              atrabotkaScore: isDone ? finalScore : undefined,
              atrabotkaDate: isDone ? todayIso : undefined
            }
          }
        };
      })
    );

    setMakeups((prevMakeups) => {
      const existing = prevMakeups.find(
        (m) => m.studentId === studentId && m.missedSessionId === sessionId
      );
      if (existing) {
        return prevMakeups.map((m) =>
          m.id === existing.id
            ? {
                ...m,
                status: isDone ? 'submitted' : 'pending',
                score: isDone ? Number(finalScore) : undefined,
                submittedDate: isDone ? todayIso : undefined,
                teacherNote: isDone ? "Atrabotka topshirildi va qabul qilindi" : "Qayta topshirish kutilmoqda"
              }
            : m
        );
      } else if (isDone) {
        const studentObj = students.find((st) => st.id === studentId);
        const targetSession = sessions.find((s) => s.id === sessionId);
        const newMakeup: MakeupRecord = {
          id: `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId,
          groupId: studentObj?.groupId || targetSession?.groupId || '',
          missedSessionId: sessionId,
          missedDate: targetSession?.date || todayIso,
          missedTopic: targetSession?.topicTitle || 'Biokimyo mavzusi',
          lessonType: targetSession?.lessonType || 'amaliy',
          status: 'submitted',
          score: Number(finalScore),
          submittedDate: todayIso,
          recordedAt: new Date().toISOString(),
          teacherNote: "Atrabotka topshirildi va baholandi"
        };
        return [...prevMakeups, newMakeup];
      }
      return prevMakeups;
    });
  };

  const recordLateArrival = (sessionId: string, studentId: string, minutes: number, reason: string) => {
    quickSetStatus(sessionId, studentId, 'late', minutes, reason);
  };

  const saveMakeup = (makeupData: Omit<MakeupRecord, 'id' | 'recordedAt'> & { id?: string }) => {
    let makeupId = makeupData.id;
    if (makeupData.id) {
      setMakeups((prev) =>
        prev.map((m) =>
          m.id === makeupData.id
            ? { ...m, ...makeupData, recordedAt: m.recordedAt || new Date().toISOString() }
            : m
        )
      );
    } else {
      makeupId = `mk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newRec: MakeupRecord = {
        ...makeupData,
        id: makeupId,
        recordedAt: new Date().toISOString()
      };
      setMakeups((prev) => [newRec, ...prev]);
    }

    // Two-way sync: update corresponding session attendance if missedSessionId is present
    if (makeupData.missedSessionId) {
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id !== makeupData.missedSessionId) return s;
          const currentEntry = s.attendance[makeupData.studentId] || { studentId: makeupData.studentId, status: 'absent' };
          const isSubmitted = makeupData.status === 'submitted';
          return {
            ...s,
            attendance: {
              ...s.attendance,
              [makeupData.studentId]: {
                ...currentEntry,
                atrabotkaDone: isSubmitted,
                atrabotkaScore: isSubmitted ? makeupData.score : undefined,
                atrabotkaDate: isSubmitted ? (makeupData.submittedDate || new Date().toISOString().split('T')[0]) : undefined
              }
            }
          };
        })
      );
    }
  };

  const deleteMakeup = (makeupId: string) => {
    const target = makeups.find((m) => m.id === makeupId);
    if (target && target.missedSessionId) {
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id !== target.missedSessionId) return s;
          const currentEntry = s.attendance[target.studentId];
          if (!currentEntry) return s;
          return {
            ...s,
            attendance: {
              ...s.attendance,
              [target.studentId]: {
                ...currentEntry,
                atrabotkaDone: false,
                atrabotkaScore: undefined,
                atrabotkaDate: undefined
              }
            }
          };
        })
      );
    }
    setMakeups((prev) => prev.filter((m) => m.id !== makeupId));
  };

  const addCurriculumTopic = (topicData: Omit<CurriculumTopic, 'id'>) => {
    const newTopic: CurriculumTopic = {
      ...topicData,
      id: `top-${Date.now()}`
    };
    setCurriculum((prev) => [...prev, newTopic].sort((a, b) => a.order - b.order));
  };

  const updateCurriculumTopic = (topic: CurriculumTopic) => {
    setCurriculum((prev) =>
      prev.map((t) => (t.id === topic.id ? topic : t)).sort((a, b) => a.order - b.order)
    );
  };

  const deleteCurriculumTopic = (topicId: string) => {
    setCurriculum((prev) => prev.filter((t) => t.id !== topicId));
  };

  const bulkImportCurriculum = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const newTopics: CurriculumTopic[] = [];

    lines.forEach((line, idx) => {
      let type: LessonType = 'maruza';
      if (/amaliy/i.test(line) || /laboratoriya/i.test(line)) {
        type = 'amaliy';
      } else if (/seminar/i.test(line)) {
        type = 'seminar';
      }

      const cleanTitle = line
        .replace(/^\d+[\.\)\-\s]+/, '')
        .replace(/^(ma'ruza|maruza|amaliy|laboratoriya|seminar)[\:\-\s]*/i, '')
        .trim();

      const weekEst = Math.floor(idx / 2) + 1;

      newTopics.push({
        id: `top-${Date.now()}-${idx}`,
        order: curriculum.length + idx + 1,
        type,
        title: cleanTitle || line,
        hours: 2,
        weekDefault: weekEst
      });
    });

    setCurriculum((prev) => [...prev, ...newTopics].sort((a, b) => a.order - b.order));
  };

  const addIndependentTopic = (topicData: Omit<IndependentTopic, 'id'>) => {
    const newTopic: IndependentTopic = {
      ...topicData,
      id: `it-${Date.now()}`
    };
    setIndependentTopics((prev) => [...prev, newTopic]);
  };

  const assignIndependentTopicToStudent = (
    studentId: string,
    groupId: string,
    topicId: string,
    deadline: string
  ) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.studentId === studentId);
      if (existing) {
        return prev.map((a) =>
          a.studentId === studentId
            ? { ...a, topicId, deadline, assignedDate: a.assignedDate || new Date().toISOString().split('T')[0] }
            : a
        );
      }
      return [
        ...prev,
        {
          id: `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId,
          groupId,
          topicId,
          assignedDate: new Date().toISOString().split('T')[0],
          deadline,
          status: 'assigned'
        }
      ];
    });
  };

  const autoAssignIndependentTopics = (groupId: string, deadline: string) => {
    const targetGroup = groups.find((g) => g.id === groupId);
    const constituentIds =
      targetGroup?.isLectureFlow && targetGroup.constituentGroupIds && targetGroup.constituentGroupIds.length > 0
        ? targetGroup.constituentGroupIds
        : [groupId];

    if (independentTopics.length === 0) return;

    setAssignments((prev) => {
      let current = [...prev];
      constituentIds.forEach((cId) => {
        const groupStudents = students.filter((s) => s.groupId === cId);
        // Remove existing assignments for this group
        current = current.filter((a) => !groupStudents.some((gs) => gs.id === a.studentId));
        // Add new strictly 1-15 cycling
        const newGroupAssignments: StudentIndependentAssignment[] = groupStudents.map((st, idx) => {
          const topic = independentTopics[idx % independentTopics.length];
          return {
            id: `asg-${st.id}`,
            studentId: st.id,
            groupId: st.groupId,
            topicId: topic.id,
            assignedDate: new Date().toISOString().split('T')[0],
            deadline: deadline || '2026-10-25',
            status: 'assigned'
          };
        });
        current = [...current, ...newGroupAssignments];
      });
      return current;
    });
  };

  const autoAssignAllGroupsIndependent = (deadline?: string) => {
    const d = deadline || '2026-10-25';
    if (independentTopics.length === 0) return;

    setAssignments(() => {
      const result: StudentIndependentAssignment[] = [];
      const groupMap: Record<string, Student[]> = {};
      students.forEach((st) => {
        if (!groupMap[st.groupId]) groupMap[st.groupId] = [];
        groupMap[st.groupId].push(st);
      });

      Object.entries(groupMap).forEach(([grpId, studentList]) => {
        studentList.forEach((st, idx) => {
          const topic = independentTopics[idx % independentTopics.length];
          result.push({
            id: `asg-${st.id}`,
            studentId: st.id,
            groupId: grpId,
            topicId: topic.id,
            assignedDate: new Date().toISOString().split('T')[0],
            deadline: d,
            status: 'assigned'
          });
        });
      });
      return result;
    });
  };

  const updateAssignment = (assignment: StudentIndependentAssignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? assignment : a)));
  };

  // Practical Tasks methods (10 ta amaliy mashg'ulot vazifalari)
  const createPracticalTask = (taskData: Omit<PracticalTask, 'id' | 'createdAt'>) => {
    const newTask: PracticalTask = {
      ...taskData,
      id: `ptask-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPracticalTasks((prev) => [newTask, ...prev]);
  };

  const updatePracticalTask = (task: PracticalTask) => {
    setPracticalTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  };

  const deletePracticalTask = (taskId: string) => {
    setPracticalTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskSubmissions((prev) => prev.filter((s) => s.taskId !== taskId));
  };

  const submitStudentTask = (submissionData: Omit<StudentTaskSubmission, 'id'>) => {
    setTaskSubmissions((prev) => {
      const idx = prev.findIndex(
        (s) => s.taskId === submissionData.taskId && s.studentId === submissionData.studentId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          ...submissionData,
          status: 'submitted',
          submittedAt: new Date().toISOString().split('T')[0]
        };
        return next;
      }
      return [
        ...prev,
        {
          ...submissionData,
          id: `tsub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'submitted',
          submittedAt: new Date().toISOString().split('T')[0]
        }
      ];
    });
  };

  const gradeStudentTask = (submissionId: string, grade: number | string, feedback?: string) => {
    setTaskSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, grade, teacherFeedback: feedback, status: 'graded' }
          : s
      )
    );
  };

  const exportDataJSON = () => {
    const allData = {
      teacher: teacherName,
      groups,
      schedule,
      students,
      curriculum,
      independentTopics,
      sessions,
      makeups,
      assignments,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ustoz_jurnali_mamazulunov_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.groups && data.students && data.sessions) {
        if (data.groups) setGroups(data.groups);
        if (data.schedule) setSchedule(data.schedule);
        if (data.students) setStudents(data.students);
        if (data.curriculum) setCurriculum(data.curriculum);
        if (data.independentTopics) setIndependentTopics(data.independentTopics);
        if (data.sessions) setSessions(data.sessions);
        if (data.makeups) setMakeups(data.makeups);
        if (data.assignments) setAssignments(data.assignments);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    if (window.confirm("Barcha ma'lumotlar asl jadval va guruhlar bo'yicha qayta tiklansinmi?")) {
      setGroups(INITIAL_GROUPS);
      setSchedule(INITIAL_SCHEDULE);
      setStudents(INITIAL_STUDENTS);
      setCurriculum(INITIAL_CURRICULUM);
      setIndependentTopics(INITIAL_INDEPENDENT_TOPICS);
      setSessions(INITIAL_SESSIONS);
      setMakeups(INITIAL_MAKEUPS);
      setAssignments(INITIAL_ASSIGNMENTS);
      setSelectedGroupId(INITIAL_GROUPS[0].id);
    }
  };

  const syncOfficialRosters = () => {
    setGroups(INITIAL_GROUPS);
    setSchedule(INITIAL_SCHEDULE);
    setStudents(INITIAL_STUDENTS);
    localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(INITIAL_GROUPS));
    localStorage.setItem(`${STORAGE_KEY}_schedule`, JSON.stringify(INITIAL_SCHEDULE));
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(INITIAL_STUDENTS));
    if (!INITIAL_GROUPS.some(g => g.id === selectedGroupId)) {
      setSelectedGroupId(INITIAL_GROUPS[0].id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        teacherName,
        groups,
        schedule,
        students,
        curriculum,
        independentTopics,
        sessions,
        makeups,
        assignments,
        practicalTasks,
        taskSubmissions,
        getGroupStudents,
        getGroupConstituents,
        selectedGroupId,
        setSelectedGroupId,
        activeGroup,
        activeTab,
        setActiveTab,
        pendingSession,
        setPendingSession,
        startSessionForGroup,
        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,
        resetScheduleToDefault,
        updateGroupWeek,
        addGroup,
        updateGroup,
        deleteGroup,
        setGroupInternship,
        bulkSetGroupInternship,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        saveSessionAttendance,
        quickSetStatus,
        recordLateArrival,
        markAtrabotkaForStudent,
        saveMakeup,
        deleteMakeup,
        addCurriculumTopic,
        updateCurriculumTopic,
        deleteCurriculumTopic,
        bulkImportCurriculum,
        addIndependentTopic,
        assignIndependentTopicToStudent,
        autoAssignIndependentTopics,
        autoAssignAllGroupsIndependent,
        updateAssignment,
        createPracticalTask,
        updatePracticalTask,
        deletePracticalTask,
        submitStudentTask,
        gradeStudentTask,
        exportDataJSON,
        importDataJSON,
        resetToDemoData,
        syncOfficialRosters
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
