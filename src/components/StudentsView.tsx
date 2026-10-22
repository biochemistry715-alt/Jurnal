import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Phone,
  Trash2,
  FolderPlus,
  Upload,
  Search,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentDetailsModal } from './modals/StudentDetailsModal';
import { InternshipModal } from './modals/InternshipModal';

export const StudentsView: React.FC = () => {
  const {
    groups,
    students,
    selectedGroupId,
    setSelectedGroupId,
    activeGroup,
    updateGroupWeek,
    addGroup,
    addStudent,
    bulkAddStudents,
    deleteStudent,
    getGroupStudents,
    getGroupConstituents,
    syncOfficialRosters
  } = useApp();

  const constituentGroups = getGroupConstituents(activeGroup);
  const isStream = Boolean(activeGroup?.isLectureFlow && constituentGroups.length > 1);
  const allStreamStudents = getGroupStudents(activeGroup);

  // Sub-group filter within an oqim: 'all' or specific constituent group ID
  const [activeStreamGroupId, setActiveStreamGroupId] = useState<'all' | string>('all');

  // Modals state
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);

  // Target group for adding students (defaults to active group or first constituent group)
  const [targetStudentGroupId, setTargetStudentGroupId] = useState<string>(
    constituentGroups[0]?.id || activeGroup?.id || ''
  );

  // Add group fields
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupFaculty, setNewGroupFaculty] = useState('Davolash fakulteti');
  const [newGroupCourse, setNewGroupCourse] = useState(2);
  const [newGroupWeek, setNewGroupWeek] = useState(1);

  // Add single student fields
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentSubGroup, setNewStudentSubGroup] = useState<'A' | 'B'>('A');

  // Bulk add text
  const [bulkText, setBulkText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subGroupFilter, setSubGroupFilter] = useState<'all' | 'A' | 'B'>('all');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    addGroup({
      name: newGroupName.trim(),
      faculty: newGroupFaculty,
      course: newGroupCourse,
      currentWeek: newGroupWeek
    });
    setNewGroupName('');
    setShowAddGroupModal(false);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const destGroupId = targetStudentGroupId || activeGroup?.id || '';
    const destGroup = groups.find((g) => g.id === destGroupId);

    addStudent({
      groupId: destGroupId,
      fullName: newStudentName.trim(),
      subGroup: newStudentSubGroup,
      phone: newStudentPhone.trim(),
      studentCode:
        newStudentCode.trim() ||
        `${destGroup?.name.slice(0, 3) || 'ST'}-${(
          students.filter((s) => s.groupId === destGroupId).length + 1
        )
          .toString()
          .padStart(2, '0')}`
    });

    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentCode('');
    setShowAddStudentModal(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    const destGroupId = targetStudentGroupId || activeGroup?.id || '';
    bulkAddStudents(destGroupId, bulkText);
    setBulkText('');
    setShowBulkAddModal(false);
    alert("Talabalar muvaffaqiyatli qo'shildi!");
  };

  const getFilteredStudents = (targetGrpId: string) => {
    return allStreamStudents
      .filter((s) => s.groupId === targetGrpId)
      .filter((st) => {
        const matchesSearch =
          st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (st.studentCode && st.studentCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (st.phone && st.phone.includes(searchQuery));
        const matchesSubGroup = subGroupFilter === 'all' || st.subGroup === subGroupFilter;
        return matchesSearch && matchesSubGroup;
      });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wide border border-teal-500/30">
                Guruhlar & Kontingent
              </span>
              <span className="text-xs text-slate-400">
                O'qituvchi: <strong className="text-slate-200">Mamazulunov Nurmuhammad</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center space-x-2">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Guruhlar va talabalar ro'yxati</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Oqimlar va alohida guruhlar talabalari, joriy hafta (1-hafta / 2-hafta) boshqaruvi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowInternshipModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center space-x-1.5"
              title="Guruhlarni 2 haftalik amaliyotga chiqarish va holatini boshqarish"
            >
              <Briefcase className="w-4 h-4" />
              <span>Amaliyot boshqaruvi</span>
            </button>

            <button
              onClick={() => {
                syncOfficialRosters();
                alert("Rasmiy ro'yxat bo'yicha Davolash (204 nafar) va Pediatriya (87 nafar) talabalari to'liq yangilandi!");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-300 hover:text-white border border-emerald-800/60 transition flex items-center space-x-1.5 shadow-sm"
              title="Rasmiy 291 nafar talabalar ro'yxatini qayta yuklash"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Rasmiy ro'yxatni sinxronlash</span>
            </button>

            <button
              onClick={() => setShowAddGroupModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4 text-teal-400" />
              <span>Yangi guruh ochish</span>
            </button>

            <button
              onClick={() => {
                setTargetStudentGroupId(constituentGroups[0]?.id || activeGroup?.id || '');
                setShowBulkAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-teal-300 hover:text-white border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Upload className="w-4 h-4 text-teal-400" />
              <span>Ro'yxatdan nusxalab qo'shish</span>
            </button>

            <button
              onClick={() => {
                setTargetStudentGroupId(constituentGroups[0]?.id || activeGroup?.id || '');
                setShowAddStudentModal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Talaba qo'shish</span>
            </button>
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          {groups
            .filter((g) => g.isLectureFlow || g.hasPractical === true)
            .map((group) => {
              const count = getGroupStudents(group).length;
              const isSelected = group.id === selectedGroupId;

            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500 ring-2 ring-teal-500/30 shadow-lg'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    {group.isLectureFlow && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 shrink-0">
                        OQIM
                      </span>
                    )}
                    {group.internship?.isActive && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 text-[10px] font-bold border border-amber-500/40 shrink-0 flex items-center space-x-0.5">
                        <span>🏥 Amaliyotda</span>
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-white truncate">{group.name}</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-750 shrink-0">
                    {count} talaba
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1 truncate">
                  {group.faculty}
                </div>

                {/* Week Selector Chips for this specific group */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Hafta:</span>
                  <div className="flex space-x-1 overflow-x-auto scrollbar-none py-0.5" onClick={(e) => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateGroupWeek(group.id, w)}
                        className={`px-1.5 py-0.5 text-[11px] font-bold rounded shrink-0 ${
                          group.currentWeek === w
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title={`${w}-hafta`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OQIM SUB-TABS (User requirement: "har bir oqimni tanlaganda 3 ta guruh talabalari alohida alohida guruh sifatida ochilsin") */}
      {isStream && (
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/50 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Oqimdagi guruhlarni ajratilgan ko'rinishda ochish:
              </h3>
            </div>
            <span className="text-xs text-purple-300">
              Jami: <strong>{allStreamStudents.length} nafar talaba</strong> (3 ta guruh birikmasi)
            </span>
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
              <span>Barcha 3 ta guruh (Alohida bloklar, {allStreamStudents.length})</span>
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
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
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

      {/* RENDER EACH CONSTITUENT GROUP AS ITS OWN DISTINCT CARD/TABLE */}
      {constituentGroups
        .filter((grp) => activeStreamGroupId === 'all' || grp.id === activeStreamGroupId)
        .map((groupItem, gIdx) => {
          const groupStudentsList = getFilteredStudents(groupItem.id);
          const totalInGroup = allStreamStudents.filter((s) => s.groupId === groupItem.id).length;

          return (
            <div
              key={groupItem.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Distinct Group Header */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
                    {gIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-white text-base">
                        Guruh: {groupItem.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        {groupItem.currentWeek}-hafta
                      </span>
                      {groupItem.room && (
                        <span className="text-xs text-teal-400 font-mono">
                          {groupItem.room}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {groupItem.faculty} • Jami: <strong className="text-white">{totalInGroup} nafar</strong> talaba
                    </div>
                  </div>

                  {/* SubGroup Pills */}
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
                      Guruh A
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
                      Guruh B
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Qidirish..."
                      className="w-full bg-slate-800 text-xs text-slate-100 pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setTargetStudentGroupId(groupItem.id);
                      setShowAddStudentModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition flex items-center space-x-1"
                    title="Shu guruhga talaba qo'shish"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Talaba</span>
                  </button>

                  <button
                    onClick={() => setSelectedGroupId(groupItem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition"
                    title="Ushbu guruhni tanlash"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-850 text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">№</th>
                      <th className="py-3 px-4">F.I.Sh (Familiya Ism Sharifi)</th>
                      <th className="py-3 px-3">Kichik guruh</th>
                      <th className="py-3 px-3">Talaba ID</th>
                      <th className="py-3 px-3">Telefon</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {groupStudentsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Ushbu guruhda talabalar topilmadi.
                        </td>
                      </tr>
                    ) : (
                      groupStudentsList.map((st, i) => (
                        <tr key={st.id} className="hover:bg-slate-850/60 transition">
                          <td className="py-3 px-4 text-center font-mono text-slate-500">{i + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-100">
                            <button
                              type="button"
                              onClick={() => setDetailsStudent(st)}
                              className="hover:text-teal-400 transition text-left"
                            >
                              {st.fullName}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            {st.subGroup ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  st.subGroup === 'A'
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                }`}
                              >
                                Guruh {st.subGroup}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">{st.studentCode || '—'}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono">{st.phone || '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setDetailsStudent(st)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-750 transition"
                              >
                                Dosye
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`${st.fullName} ni ro'yxatdan o'chirishni tasdiqlaysizmi?`)) {
                                    deleteStudent(st.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

      {/* Modal: Add Group */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Yangi guruh ochish</h3>
              <button onClick={() => setShowAddGroupModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guruh nomi:</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Masalan: 205-Davolash yoki DI- 25-30"
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fakultet / Yo'nalish:</label>
                <input
                  type="text"
                  value={newGroupFaculty}
                  onChange={(e) => setNewGroupFaculty(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kurs:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newGroupCourse}
                    onChange={(e) => setNewGroupCourse(Number(e.target.value))}
                    className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2 border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Joriy hafta:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newGroupWeek}
                    onChange={(e) => setNewGroupWeek(Number(e.target.value))}
                    className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2 border border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400"
                >
                  Guruhni yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Yangi talaba qo'shish</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              {/* Group selection if active group is an oqim */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Qo'shiladigan guruh:</label>
                <select
                  value={targetStudentGroupId}
                  onChange={(e) => setTargetStudentGroupId(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700"
                >
                  {isStream ? (
                    constituentGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.faculty})
                      </option>
                    ))
                  ) : (
                    <option value={activeGroup?.id}>{activeGroup?.name}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Talaba F.I.Sh (Familiya Ism Sharif):
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Masalan: KARIMOV ANVAR SHUXRATOVICH"
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kichik guruh:</label>
                  <select
                    value={newStudentSubGroup}
                    onChange={(e) => setNewStudentSubGroup(e.target.value as 'A' | 'B')}
                    className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2 border border-slate-700"
                  >
                    <option value="A">Guruh A</option>
                    <option value="B">Guruh B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Talaba ID / Kodi:</label>
                  <input
                    type="text"
                    value={newStudentCode}
                    onChange={(e) => setNewStudentCode(e.target.value)}
                    placeholder="DI01-32"
                    className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2 border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon raqami:</label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Add */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 text-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-white">Ro'yxatdan nusxalab kiritish</h3>
              <button onClick={() => setShowBulkAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Qo'shiladigan guruh:</label>
                <select
                  value={targetStudentGroupId}
                  onChange={(e) => setTargetStudentGroupId(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700"
                >
                  {isStream ? (
                    constituentGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.faculty})
                      </option>
                    ))
                  ) : (
                    <option value={activeGroup?.id}>{activeGroup?.name}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Talabalar ro'yxatini tashlang (Har bir qatorda bittadan talaba):
                </label>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`1. ABDUG'ANIYEV ASILBEK\n2. ABDULLAYEV FARRUHBEK\n3. ALIMOVA MADINA...`}
                  className="w-full bg-slate-800 text-xs font-mono text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400"
                >
                  Hammasini qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Dossier Modal */}
      <StudentDetailsModal
        isOpen={Boolean(detailsStudent)}
        onClose={() => setDetailsStudent(null)}
        student={detailsStudent}
      />

      {/* Internship Management Modal */}
      <InternshipModal
        isOpen={showInternshipModal}
        onClose={() => setShowInternshipModal(false)}
      />
    </div>
  );
};
