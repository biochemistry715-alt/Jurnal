import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Award,
  Trash2,
  Edit,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MakeupRecord } from '../types';
import { MakeupModal } from './modals/MakeupModal';

export const MakeupJournalView: React.FC = () => {
  const {
    activeGroup,
    groups,
    students,
    makeups,
    saveMakeup,
    deleteMakeup
  } = useApp();

  const [filterGroup, setFilterGroup] = useState<string>(activeGroup?.id || 'all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMakeup, setEditingMakeup] = useState<MakeupRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter list
  const filteredMakeups = makeups.filter((m) => {
    const student = students.find((s) => s.id === m.studentId);
    const targetGroupObj = groups.find((g) => g.id === filterGroup);
    const constituentIds = targetGroupObj?.constituentGroupIds || [];

    const matchesGroup =
      filterGroup === 'all' ||
      m.groupId === filterGroup ||
      (constituentIds.length > 0 && constituentIds.includes(m.groupId)) ||
      (student && (student.groupId === filterGroup || constituentIds.includes(student.groupId)));

    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesSearch =
      (student && student.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.missedTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.missedDate.includes(searchQuery) ||
      (m.submittedDate && m.submittedDate.includes(searchQuery));

    return matchesGroup && matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const targetGroupObj = groups.find((g) => g.id === filterGroup);
  const constituentIds = targetGroupObj?.constituentGroupIds || [];
  const targetGroupMakeups = filterGroup === 'all'
    ? makeups
    : makeups.filter((m) => {
        const student = students.find((s) => s.id === m.studentId);
        return (
          m.groupId === filterGroup ||
          constituentIds.includes(m.groupId) ||
          (student && (student.groupId === filterGroup || constituentIds.includes(student.groupId)))
        );
      });
  const totalNbCount = targetGroupMakeups.length;
  const totalNbHours = totalNbCount * 2; // Har bir ma'ruza/amaliy dars 2 soat
  const submittedCount = targetGroupMakeups.filter((m) => m.status === 'submitted').length;
  const pendingCount = targetGroupMakeups.filter((m) => m.status === 'pending').length;
  const clearanceRate = totalNbCount > 0 ? Math.round((submittedCount / totalNbCount) * 100) : 100;

  // Handlers
  const handleAddNewMakeup = () => {
    const firstStudent = students.find((s) => (filterGroup !== 'all' ? s.groupId === filterGroup : true)) || students[0];
    const newRecord: MakeupRecord = {
      id: '',
      studentId: firstStudent ? firstStudent.id : '',
      groupId: firstStudent ? firstStudent.groupId : (activeGroup?.id || ''),
      missedDate: new Date().toISOString().split('T')[0],
      missedTopic: 'Biokimyo ma\'ruzasi',
      lessonType: 'maruza',
      status: 'pending',
      recordedAt: new Date().toISOString()
    };
    setEditingMakeup(newRecord);
    setIsModalOpen(true);
  };

  const handleEditMakeup = (record: MakeupRecord) => {
    setEditingMakeup(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMakeup(id);
    setConfirmDeleteId(null);
  };

  const handleSaveModal = (data: Omit<MakeupRecord, 'id' | 'recordedAt'> & { id?: string }) => {
    saveMakeup(data);
  };

  const getStudent = (studentId: string) => {
    return students.find((s) => s.id === studentId);
  };

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g.id === groupId)?.name || 'Guruh';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs uppercase tracking-wide border border-rose-500/30">
                Qarzdorlik & Otrabotka
              </span>
              <span className="text-xs text-slate-400">
                O'qituvchi: <strong className="text-slate-200">Mamazulunov Nurmuhammad</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Qoldirilgan darslar (NB) va Qayta topshirishlar jurnali</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Talabalar qaysi kuni dars qoldirgan va qaysi kuni qoldirgan darsini topshirganligi bo'yicha to'liq hisob.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Chop etish</span>
            </button>

            <button
              onClick={handleAddNewMakeup}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi qayta topshirish kiritish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <span className="text-xs text-slate-400 font-medium uppercase">Jami qoldirilgan NB</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{totalNbHours} soat</div>
          <span className="text-xs text-slate-400">{totalNbCount} ta dars mashg'uloti</span>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium uppercase">Qayta topshirilgan (Yopilgan)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{submittedCount * 2} soat</div>
          <span className="text-xs text-emerald-300/80">{submittedCount} ta dars topshirildi</span>
        </div>

        <div className="bg-rose-950/30 border border-rose-800/40 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium uppercase">Hali topshirilmagan (Qarzdor)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{pendingCount * 2} soat</div>
          <span className="text-xs text-rose-300/80">{pendingCount} ta qoldirilgan dars kutilmoqda</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <span className="text-xs text-slate-400 font-medium uppercase">Otrabotka o'zlashtirish</span>
          <div className="text-2xl font-black text-teal-400 mt-1">{clearanceRate}%</div>
          <span className="text-xs text-teal-300/80">Qarzdorlik yopilish ko'rsatkichi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Group Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Guruh:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-slate-800 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Barcha guruhlar & oqimlar</option>
              <optgroup label="🌊 OQIMLAR (3 ta guruh birgalikda)">
                {groups
                  .filter((g) => g.isLectureFlow)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      🌊 {g.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="📋 ALOHIDA AMALIYOT GURUHLARI">
                {groups
                  .filter((g) => !g.isLectureFlow)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Holat:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-800 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Barcha NB lar</option>
              <option value="pending">⏳ Faqat qarzdorlar (Topshirmagan)</option>
              <option value="submitted">✅ Faqat topshirilganlar (Yopilgan)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Talaba, mavzu yoki sana qidirish..."
            className="w-full bg-slate-800 text-xs text-slate-100 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Main Table: Missed & Makeup Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Talaba F.I.Sh</th>
                <th className="py-3 px-3">Guruh</th>
                <th className="py-3 px-4 text-rose-400">Qaysi kuni qoldirgan (NB)</th>
                <th className="py-3 px-4">Qoldirilgan ma'ruza / mavzu</th>
                <th className="py-3 px-4 text-emerald-400">Qaysi kuni topshirgan</th>
                <th className="py-3 px-3">Shakli & Baho</th>
                <th className="py-3 px-3 text-center">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMakeups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Hech qanday dars qoldirish yoki qayta topshirish yozuvi topilmadi.
                  </td>
                </tr>
              ) : (
                filteredMakeups.map((record) => {
                  const student = getStudent(record.studentId);
                  const isSubmitted = record.status === 'submitted';

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-slate-850/80 transition ${
                        isSubmitted ? 'bg-emerald-950/5' : 'bg-rose-950/10'
                      }`}
                    >
                      {/* Student Name */}
                      <td className="py-3 px-4 font-bold text-slate-100">
                        <div>{student?.fullName || 'Noma\'lum talaba'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {student?.studentCode || '—'}
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {getGroupName(record.groupId)}
                        </span>
                      </td>

                      {/* Missed Date (User Requirement: qaysi kuni dars qoldirgan) */}
                      <td className="py-3 px-4 text-rose-300 font-semibold font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>{record.missedDate}</span>
                        </div>
                        <span className="text-[10px] text-rose-400/80 block mt-0.5">2 soat qoldirilgan</span>
                      </td>

                      {/* Missed Topic */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 line-clamp-2">{record.missedTopic}</div>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                          Dars turi: <span className="text-teal-400">{record.lessonType}</span>
                        </div>
                      </td>

                      {/* Submitted Date (User Requirement: qaysi kuni topshirgan) */}
                      <td className="py-3 px-4 font-mono">
                        {isSubmitted && record.submittedDate ? (
                          <div className="text-emerald-300 font-bold flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{record.submittedDate}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-semibold flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Topshirilmagan</span>
                          </span>
                        )}
                      </td>

                      {/* Submission Type & Score */}
                      <td className="py-3 px-3">
                        {isSubmitted ? (
                          <div>
                            <span className="text-slate-300 capitalize text-[11px] block">
                              {record.submissionType || 'Og\'zaki'}
                            </span>
                            {record.score !== undefined && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                                {record.score} ball
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isSubmitted ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✅ Yopildi
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                            ⏳ Qarzdor
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isSubmitted && (
                            <button
                              onClick={() => {
                                saveMakeup({
                                  id: record.id,
                                  studentId: record.studentId,
                                  groupId: record.groupId,
                                  missedSessionId: record.missedSessionId,
                                  missedDate: record.missedDate,
                                  missedTopic: record.missedTopic,
                                  lessonType: record.lessonType,
                                  status: 'submitted',
                                  score: 5,
                                  submittedDate: new Date().toISOString().split('T')[0],
                                  submissionType: 'ogzaki',
                                  teacherNote: "Atrabotka topshirildi va 5 baho bilan qabul qilindi"
                                });
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center space-x-1 shadow"
                              title="Tezkor 5 baho bilan otrabotkani yopish"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>5 ga yopish</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEditMakeup(record)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition flex items-center space-x-1"
                            title="Qayta topshirishni qabul qilish / Baholash"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{isSubmitted ? 'Tahrirlash' : 'Topshirish'}</span>
                          </button>

                          {confirmDeleteId === record.id ? (
                            <div className="flex items-center space-x-1 bg-rose-500/20 border border-rose-500/40 p-1 rounded-lg">
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                              >
                                O'chirish
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(record.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            * Davomat jurnali orqali darsda yo'q (NB) deb belgilangan talabalar avtomatik tarzda ushbu qayta topshirish jadvaliga tushadi.
          </span>
          <span className="text-teal-400 font-semibold">
            Jami qaydlar: {filteredMakeups.length} ta
          </span>
        </div>
      </div>

      {/* Makeup Edit/Add Modal */}
      <MakeupModal
        isOpen={isModalOpen}
        makeup={editingMakeup}
        student={editingMakeup ? getStudent(editingMakeup.studentId) : undefined}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
