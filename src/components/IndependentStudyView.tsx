import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Award,
  Search,
  MessageSquare,
  X,
  Send,
  FileText,
  Check,
  Filter,
  Eye,
  Trash2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  IndependentTopic,
  StudentIndependentAssignment,
  Student,
  PracticalTask,
  StudentTaskSubmission
} from '../types';

export const IndependentStudyView: React.FC = () => {
  const {
    activeGroup,
    groups,
    students,
    curriculum,
    independentTopics,
    assignments,
    practicalTasks,
    taskSubmissions,
    addIndependentTopic,
    assignIndependentTopicToStudent,
    autoAssignIndependentTopics,
    autoAssignAllGroupsIndependent,
    updateAssignment,
    createPracticalTask,
    updatePracticalTask,
    deletePracticalTask,
    gradeStudentTask,
    getGroupStudents,
    getGroupConstituents
  } = useApp();

  const constituentGroups = getGroupConstituents(activeGroup);
  const isStream = Boolean(activeGroup?.isLectureFlow && constituentGroups.length > 1);
  const [activeIndependentGroupId, setActiveIndependentGroupId] = useState<'all' | string>('all');

  const groupStudents =
    activeIndependentGroupId === 'all'
      ? getGroupStudents(activeGroup)
      : students.filter((s) => s.groupId === activeIndependentGroupId);

  // Main Tabs:
  // 1: Mustaqil ta'lim (15 ta mavzu taqsimoti)
  // 2: Amaliy mashg'ulotlar vazifalari (A1 - A10)
  // 3: 15 ta mavzular banki
  const [activeMainTab, setActiveMainTab] = useState<'independent' | 'practical_tasks' | 'topics_bank'>('independent');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicMaxScore, setNewTopicMaxScore] = useState(25);

  const [gradingAssignment, setGradingAssignment] = useState<StudentIndependentAssignment | null>(null);
  const [gradeScore, setGradeScore] = useState<number | ''>(24);
  const [gradeStatus, setGradeStatus] = useState<StudentIndependentAssignment['status']>('completed');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [deadlineInput, setDeadlineInput] = useState('2026-10-25');

  // Practical Tasks Modal states
  const [editingTask, setEditingTask] = useState<PracticalTask | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskPracticalNumber, setTaskPracticalNumber] = useState<number>(1);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('2026-10-25');
  const [taskMaxScore, setTaskMaxScore] = useState(100);
  const [taskTargetGroup, setTaskTargetGroup] = useState<'all' | string>('all');

  // Task Submissions Review Modal
  const [reviewingTask, setReviewingTask] = useState<PracticalTask | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<StudentTaskSubmission | null>(null);
  const [submissionGrade, setSubmissionGrade] = useState<string | number>('95');
  const [submissionFeedback, setSubmissionFeedback] = useState('');

  // Auto assign for CURRENT group
  const handleAutoAssignCurrent = () => {
    if (!activeGroup) return;
    if (groupStudents.length === 0) {
      alert("Bu guruhda talabalar mavjud emas!");
      return;
    }
    autoAssignIndependentTopics(activeGroup.id, deadlineInput);
    alert(`«${activeGroup.name}» guruhidagi talabalarga 15 ta mustaqil ta'lim mavzusi navbatma-navbat (1-talaba 1-mavzu, ... 15-talaba 15-mavzu, 16-talaba 1-mavzu...) muvaffaqiyatli taqsimlandi!`);
  };

  // Auto assign for ALL groups
  const handleAutoAssignAll = () => {
    if (window.confirm("Barcha guruhlardagi barcha talabalarga 15 ta mustaqil ta'lim mavzusi navbatma-navbat (1-talaba 1-mavzu, 15-dan keyin yana 1-mavzu) taqsimlansinmi?")) {
      autoAssignAllGroupsIndependent(deadlineInput);
      alert("Barcha guruhlarga 15 ta mustaqil ta'lim mavzusi to'liq taqsimlandi!");
    }
  };

  const handleAddNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addIndependentTopic({
      title: newTopicTitle.trim(),
      maxScore: newTopicMaxScore
    });
    setNewTopicTitle('');
    setShowNewTopicModal(false);
  };

  const handleOpenGrading = (asg: StudentIndependentAssignment) => {
    setGradingAssignment(asg);
    setGradeScore(asg.score !== undefined ? asg.score : 24);
    setGradeStatus(asg.status);
    setGradeFeedback(asg.feedback || '');
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment) return;

    updateAssignment({
      ...gradingAssignment,
      status: gradeStatus,
      score: gradeScore !== '' ? Number(gradeScore) : undefined,
      submissionDate:
        gradeStatus === 'completed'
          ? gradingAssignment.submissionDate || new Date().toISOString().split('T')[0]
          : gradingAssignment.submissionDate,
      feedback: gradeFeedback.trim()
    });

    setGradingAssignment(null);
  };

  // Open Practical Task Modal for a specific practical number (1..10)
  const handleOpenCreateTask = (practicalNum: number) => {
    const curTopic = curriculum.find((c) => c.type === 'amaliy' && c.order === practicalNum);
    setEditingTask(null);
    setTaskPracticalNumber(practicalNum);
    setTaskTitle(`${practicalNum}-amaliyot: Klinik vaziyatli masala va savollar`);
    setTaskContent(`1. Mavzu bo'yicha asosiy reaksiyalar va fermentativ bosqichlarni tushuntiring.
2. Klinik vaziyatli masala: bemor shikoyatlari va laborator tahlillarini biokimyoviy nuqtai nazardan tahlil qiling.
3. Test va nazariy savollarga javob yozing.`);
    setTaskDeadline('2026-10-25');
    setTaskMaxScore(100);
    setTaskTargetGroup('all');
    setIsNewTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: PracticalTask) => {
    setEditingTask(task);
    setTaskPracticalNumber(task.practicalNumber);
    setTaskTitle(task.taskTitle);
    setTaskContent(task.content);
    setTaskDeadline(task.deadlineDate || '2026-10-25');
    setTaskMaxScore(task.maxScore);
    setTaskTargetGroup(task.assignedGroupIds.includes('all') ? 'all' : task.assignedGroupIds[0] || 'all');
    setIsNewTaskModalOpen(true);
  };

  const handleSavePracticalTask = (e: React.FormEvent) => {
    e.preventDefault();
    const curTopic = curriculum.find((c) => c.type === 'amaliy' && c.order === taskPracticalNumber);
    const code = `A${taskPracticalNumber}`;
    const topicTitle = curTopic?.title || `${taskPracticalNumber}-amaliy mashg'ulot`;

    if (editingTask) {
      updatePracticalTask({
        ...editingTask,
        practicalNumber: taskPracticalNumber,
        practicalCode: code,
        topicTitle,
        taskTitle: taskTitle.trim(),
        content: taskContent.trim(),
        deadlineDate: taskDeadline,
        maxScore: Number(taskMaxScore),
        assignedGroupIds: taskTargetGroup === 'all' ? ['all'] : [taskTargetGroup],
        status: 'active'
      });
    } else {
      createPracticalTask({
        practicalNumber: taskPracticalNumber,
        practicalCode: code,
        topicTitle,
        taskTitle: taskTitle.trim(),
        content: taskContent.trim(),
        deadlineDate: taskDeadline,
        maxScore: Number(taskMaxScore),
        assignedGroupIds: taskTargetGroup === 'all' ? ['all'] : [taskTargetGroup],
        status: 'active'
      });
    }

    setIsNewTaskModalOpen(false);
    alert(`A${taskPracticalNumber} mashg'uloti uchun vazifalar muvaffaqiyatli saqlandi va talabalar portaliga yuborildi!`);
  };

  // Practical 10 topics from curriculum
  const practicalCurriculum = curriculum.filter((c) => c.type === 'amaliy').sort((a, b) => a.order - b.order);

  // Helper to get independent topic info and order
  const getTopicWithOrder = (topicId: string) => {
    const t = independentTopics.find((item) => item.id === topicId);
    if (!t) return null;
    const idx = independentTopics.findIndex((item) => item.id === topicId);
    return { ...t, order: t.orderNumber || idx + 1 };
  };

  // Filtered students for assignments view
  const filteredStudents = groupStudents.filter((st) => {
    const asg = assignments.find((a) => a.studentId === st.id);
    const topic = asg ? getTopicWithOrder(asg.topicId) : null;
    const query = searchQuery.toLowerCase();

    return (
      st.fullName.toLowerCase().includes(query) ||
      (st.studentCode && st.studentCode.toLowerCase().includes(query)) ||
      (topic && topic.title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ======================================================== */}
      {/* HEADER BANNER                                            */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wider border border-teal-500/30">
                {activeGroup?.name || 'Guruh'}
              </span>
              <span className="text-xs text-slate-300">
                O'qituvchi: <strong className="text-white">Mamazulunov Nurmuhammad</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1.5 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <span>Mustaqil ta'lim & Amaliyot vazifalarini boshqarish</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              15 ta rasmiy mustaqil ta'lim mavzularini tartib bilan taqsimlash (1-15 navbat bilan) va har bir amaliy mashg'ulot (A1 – A10) uchun talabalarga topshiriqlar yuborish.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoAssignCurrent}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 hover:from-emerald-400 hover:to-teal-400 transition flex items-center space-x-2"
              title="Ushbu guruhdagi talabalarga 1-dan 15-gacha navbat bilan taqsimlaydi"
            >
              <Sparkles className="w-4 h-4" />
              <span>Guruhga 1-15 taqsimlash</span>
            </button>

            <button
              onClick={handleAutoAssignAll}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-teal-300 hover:bg-slate-750 hover:text-white border border-slate-700 transition flex items-center space-x-2"
              title="Barcha guruhlarga bir zumda taqsimlaydi"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Barcha guruhlarga taqsimlash</span>
            </button>
          </div>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="flex space-x-2 pt-5 border-t border-slate-800 mt-5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveMainTab('independent')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 shrink-0 ${
              activeMainTab === 'independent'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Mustaqil ta'lim (15 ta rasmiy mavzu)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('practical_tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 shrink-0 ${
              activeMainTab === 'practical_tasks'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 border border-purple-800/40'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>🔬 Amaliyot vazifalari (A1 – A10)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-900/80 text-purple-200 font-bold">
              10 ta dars
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('topics_bank')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeMainTab === 'topics_bank'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📚 15 ta mavzular banki</span>
          </button>
        </div>

        {/* If stream, group filter sub-bar */}
        {isStream && (
          <div className="flex items-center space-x-2 pt-3 border-t border-slate-800/80 mt-3 text-xs overflow-x-auto">
            <span className="text-slate-400 font-medium shrink-0">Oqim tarkibidagi guruhlar:</span>
            <button
              onClick={() => setActiveIndependentGroupId('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                activeIndependentGroupId === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🌊 Barcha 3 ta guruh ({getGroupStudents(activeGroup).length} talaba)
            </button>
            {constituentGroups.map((cg) => (
              <button
                key={cg.id}
                onClick={() => setActiveIndependentGroupId(cg.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                  activeIndependentGroupId === cg.id
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🏛 {cg.name} ({getGroupStudents(cg).length} talaba)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MUSTAQIL TA'LIM TAQSIMOTI (1-15 NAVBAT BILAN)     */}
      {/* ======================================================== */}
      {activeMainTab === 'independent' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden space-y-4">
          {/* Top Bar with Search & Common Deadline */}
          <div className="p-5 bg-slate-850 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-white text-base">
                Talabalar va ularga biriktirilgan mustaqil ta'lim mavzulari
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Qoida: 1-tartibdagi talaba 1-mavzu, 2-talaba 2-mavzu ... 15-talaba 15-mavzu, 16-talaba yana 1-mavzuni oladi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Talaba yoki mavzuni qidirish..."
                  className="w-full bg-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Deadline */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Dedlayn:</span>
                <input
                  type="date"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="bg-slate-900 text-slate-100 text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TABLE OF STUDENTS AND ASSIGNED TOPICS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850/80 text-slate-300 uppercase font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 text-center w-12">№</th>
                  <th className="py-3 px-4">Talaba F.I.Sh</th>
                  <th className="py-3 px-4">Biriktirilgan rasmiy mavzu (1-15)</th>
                  <th className="py-3 px-3">Topshirish muddati</th>
                  <th className="py-3 px-3">Topshirgan sana</th>
                  <th className="py-3 px-3 text-center">Holati</th>
                  <th className="py-3 px-3 text-center">Baho (25 ball)</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Ushbu ro'yxatda talabalar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const asg = assignments.find((a) => a.studentId === student.id);
                    const topic = asg ? getTopicWithOrder(asg.topicId) : null;
                    const isCompleted = asg?.status === 'completed';
                    const isRevision = asg?.status === 'revision_needed';
                    const isReview = asg?.status === 'in_review';

                    // Calculated default cyclic topic number: (idx % 15) + 1
                    const expectedNumber = (idx % 15) + 1;

                    return (
                      <tr key={student.id} className="hover:bg-slate-850/50 transition">
                        {/* Order index in group */}
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto text-[11px] font-mono border border-slate-700">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-4 font-bold text-slate-100">
                          <div className="text-sm font-bold text-white">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Guruh: <strong className="text-teal-300">{student.groupId.replace('grp-di-', 'DI-').replace('grp-pi-', 'PI-').toUpperCase()}</strong> • ID: {student.studentCode || '—'}
                          </div>
                        </td>

                        {/* Assigned Topic (with prominent topic number) */}
                        <td className="py-3 px-4 max-w-md">
                          {topic ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black text-xs border border-purple-500/30">
                                  #{topic.order}-mavzu
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  (Navbatdagi tartib: #{expectedNumber})
                                </span>
                              </div>
                              <div className="font-extrabold text-slate-100 text-xs leading-snug">
                                {topic.title}
                              </div>
                              {asg?.feedback && (
                                <div className="text-[11px] text-teal-400 bg-teal-950/40 px-2 py-1 rounded border border-teal-800/40 italic">
                                  Ustoz taqrizi: {asg.feedback}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  const targetTopic = independentTopics[(idx % independentTopics.length)] || independentTopics[0];
                                  if (activeGroup && targetTopic) {
                                    assignIndependentTopicToStudent(
                                      student.id,
                                      student.groupId,
                                      targetTopic.id,
                                      deadlineInput
                                    );
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition flex items-center space-x-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>#{expectedNumber}-mavzuni biriktirish</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Deadline */}
                        <td className="py-3 px-3 font-mono text-slate-300 font-bold">
                          {asg?.deadline || '—'}
                        </td>

                        {/* Submission Date */}
                        <td className="py-3 px-3 font-mono">
                          {asg?.submissionDate ? (
                            <span className="text-emerald-400 font-bold">{asg.submissionDate}</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {asg ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : isReview
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : isRevision
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isCompleted
                                ? '✅ Topshirildi'
                                : isReview
                                ? '🔍 Tekshiruvda'
                                : isRevision
                                ? '⚠️ Qayta ishlash'
                                : '⏳ Biriktirilgan'}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Biriktirilmagan</span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="py-3 px-3 text-center">
                          {asg?.score !== undefined ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40">
                              {asg.score} / {topic?.maxScore || 25}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          {asg ? (
                            <button
                              onClick={() => handleOpenGrading(asg)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition flex items-center space-x-1.5 ml-auto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Baholash</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const targetTopic = independentTopics[(idx % independentTopics.length)] || independentTopics[0];
                                if (activeGroup && targetTopic) {
                                  assignIndependentTopicToStudent(
                                    student.id,
                                    student.groupId,
                                    targetTopic.id,
                                    deadlineInput
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-750 transition"
                            >
                              Mavzu berish
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AMALIY MASHG'ULOTLAR VAZIFALARI (A1 - A10)       */}
      {/* ======================================================== */}
      {activeMainTab === 'practical_tasks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  <span>Amaliy mashg'ulotlar uchun vazifalar (A1 – A10)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Har bir amaliy mashg'ulot uchun talabalarga individual yoki umumiy topshiriqlar, masalalar va uy vazifalari yuborish.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenCreateTask(1)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-purple-500 hover:bg-purple-400 text-slate-950 transition shadow-lg shadow-purple-500/20 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi vazifa yaratish / yuborish</span>
                </button>
              </div>
            </div>

            {/* 10 PRACTICAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practicalCurriculum.map((prac) => {
                const code = `A${prac.order}`;
                const task = practicalTasks.find((t) => t.practicalCode === code || t.practicalNumber === prac.order);
                const taskSubmissionsCount = task
                  ? taskSubmissions.filter((s) => s.taskId === task.id).length
                  : 0;

                return (
                  <div
                    key={prac.id}
                    className={`p-5 rounded-2xl border transition shadow-lg space-y-3 ${
                      task
                        ? 'bg-slate-950/90 border-purple-800/50'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-black text-xs border border-teal-500/30">
                          {code}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          {prac.order}-amaliy mashg'ulot
                        </span>
                      </div>

                      {task ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Vazifa yuborilgan</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Vazifa biriktirilmagan
                        </span>
                      )}
                    </div>

                    {/* Practical Title */}
                    <h4 className="text-sm font-black text-white leading-snug">
                      {prac.title}
                    </h4>

                    {/* Task Content Card */}
                    {task ? (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                          <span>{task.taskTitle}</span>
                          <span className="text-[11px] text-amber-300 font-mono">
                            Dedlayn: {task.deadlineDate || 'Belgilanmagan'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-line bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                          {task.content}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400 font-medium">
                            Topshirganlar: <strong className="text-teal-300">{taskSubmissionsCount} nafar</strong>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setReviewingTask(task);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Topshiriqlar ({taskSubmissionsCount})</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditTask(task)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition flex items-center space-x-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Tahrirlash</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenCreateTask(prac.order)}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-purple-300 border border-slate-800 hover:border-purple-800/40 transition flex items-center justify-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{code} uchun vazifa yuborish</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 15 TA MAVZULAR BANKI                              */}
      {/* ======================================================== */}
      {activeMainTab === 'topics_bank' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="font-black text-white text-lg">
                Biologik kimyo fanining 15 ta rasmiy mustaqil ta'lim mavzulari
              </h3>
              <p className="text-xs text-slate-400">
                Ushbu mavzular tasdiqlangan sillabus bo'yicha talabalarga 1 dan 15 gacha navbat bilan beriladi.
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 self-start sm:self-auto">
              15 ta mavzu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {independentTopics.map((topic, i) => (
              <div
                key={topic.id}
                className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition flex items-start justify-between gap-3 shadow"
              >
                <div className="flex items-start space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 font-black text-sm flex items-center justify-center shrink-0 border border-teal-500/30 shadow-xs">
                    {topic.orderNumber || i + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-100 text-sm leading-snug">
                      {topic.title}
                    </h4>
                    {topic.description && (
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-850">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs shrink-0 border border-amber-500/30">
                  {topic.maxScore} ball
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT PRACTICAL TASK                      */}
      {/* ======================================================== */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-base text-white">
                  Amaliy mashg'ulot uchun vazifa yuborish
                </h3>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePracticalTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Amaliy mashg'ulotni tanlang (A1 – A10):
                </label>
                <select
                  value={taskPracticalNumber}
                  onChange={(e) => setTaskPracticalNumber(Number(e.target.value))}
                  className="w-full bg-slate-800 text-sm text-slate-100 font-bold rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {practicalCurriculum.map((p) => (
                    <option key={p.id} value={p.order}>
                      A{p.order}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Vazifa sarlavhasi:
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Masalan: Klinik vaziyatli masala va test topshiriqlari"
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topshiriq matni, savollar yoki klinik masala:
                </label>
                <textarea
                  rows={5}
                  value={taskContent}
                  onChange={(e) => setTaskContent(e.target.value)}
                  placeholder="1. Savol...&#10;2. Masala...&#10;3. Laboratoriya natijalarini izohlash..."
                  className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Topshirish muddati (Dedlayn):
                  </label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Maksimal ball:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={taskMaxScore}
                    onChange={(e) => setTaskMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Qaysi guruhlarga yuborilsin:
                </label>
                <select
                  value={taskTargetGroup}
                  onChange={(e) => setTaskTargetGroup(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-slate-100 font-bold rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">🌐 Barcha guruhlarga (Ochiq portal)</option>
                  {groups
                    .filter((g) => !g.isLectureFlow && g.hasPractical)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        Faqat {g.name} guruhiga
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-lg shadow-purple-500/20"
                >
                  {editingTask ? 'Vazifani yangilash' : 'Talabalarga yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REVIEW PRACTICAL TASK SUBMISSIONS                  */}
      {/* ======================================================== */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white flex items-center space-x-2">
                  <span>{reviewingTask.practicalCode}: {reviewingTask.taskTitle}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Talabalar topshirgan amaliyot ishlari va javoblari
                </p>
              </div>
              <button
                onClick={() => setReviewingTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of submissions */}
            {taskSubmissions.filter((s) => s.taskId === reviewingTask.id).length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-850 text-slate-400 text-xs">
                Ushbu vazifa bo'yicha hali hech bir talaba javob topshirmagan. Talabalar portali orqali javob yuborishlari mumkin.
              </div>
            ) : (
              <div className="space-y-3">
                {taskSubmissions
                  .filter((s) => s.taskId === reviewingTask.id)
                  .map((sub) => {
                    const student = students.find((st) => st.id === sub.studentId);
                    return (
                      <div
                        key={sub.id}
                        className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-black text-white text-sm">
                              {student?.fullName || 'Talaba'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Topshirgan sana: {sub.submittedAt || 'Bugun'}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {sub.grade !== undefined ? (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
                                Baho: {sub.grade}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                                Tekshiruvda
                              </span>
                            )}
                          </div>
                        </div>

                        {sub.submissionText && (
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                            {sub.submissionText}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setSubmissionGrade(sub.grade !== undefined ? sub.grade : '95');
                              setSubmissionFeedback(sub.teacherFeedback || '');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition flex items-center space-x-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Baholash / Izoh berish</span>
                          </button>

                          {sub.teacherFeedback && (
                            <div className="text-[11px] text-teal-400 italic">
                              Taqriz: {sub.teacherFeedback}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GRADE STUDENT TASK SUBMISSION                     */}
      {/* ======================================================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 text-slate-100 animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-base text-white">
                Amaliyot vazifasini baholash
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                gradeStudentTask(
                  gradingSubmission.id,
                  submissionGrade,
                  submissionFeedback.trim()
                );
                setGradingSubmission(null);
                alert("Baho va taqriz muvaffaqiyatli saqlandi!");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Baho / Ball:
                </label>
                <input
                  type="text"
                  value={submissionGrade}
                  onChange={(e) => setSubmissionGrade(e.target.value)}
                  placeholder="Masalan: 95 yoki 5"
                  className="w-full bg-slate-800 text-sm font-black text-amber-300 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ustoz taqrizi va ko'rsatmasi:
                </label>
                <textarea
                  rows={3}
                  value={submissionFeedback}
                  onChange={(e) => setSubmissionFeedback(e.target.value)}
                  placeholder="Klinik masalani to'g'ri yechdingiz, faqat..."
                  className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black rounded-xl bg-teal-500 text-slate-950 shadow"
                >
                  Bahoni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: GRADE INDEPENDENT STUDY ASSIGNMENT                */}
      {/* ======================================================== */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in fade-in duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white">Mustaqil ishni baholash</h3>
                <p className="text-xs text-slate-400">
                  {students.find((s) => s.id === gradingAssignment.studentId)?.fullName}
                </p>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrading} className="space-y-4">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Mavzu:</span>
                <div className="font-bold text-slate-100 text-xs mt-0.5">
                  {getTopicWithOrder(gradingAssignment.topicId)?.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Holati:
                  </label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value as any)}
                    className="w-full bg-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-100"
                  >
                    <option value="completed">✅ Qabul qilindi (Topshirildi)</option>
                    <option value="in_review">🔍 Tekshiruv jarayonida</option>
                    <option value="revision_needed">⚠️ Qayta ishlashga qaytarildi</option>
                    <option value="assigned">⏳ Kutilmoqda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ball (max 25):</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 text-sm font-black rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ustoz taqrizi va izohi:</span>
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Mavzuning yoritilishi, ilmiy adabiyotlardan foydalanish darajasi, kamchiliklar..."
                  className="w-full bg-slate-800 text-xs text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingAssignment(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black rounded-xl bg-teal-500 text-slate-950 shadow"
                >
                  Natijani saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
