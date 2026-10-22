import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  BookOpen,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  Share2,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShareToStudentsModal } from './modals/ShareToStudentsModal';

export const Navbar: React.FC = () => {
  const {
    teacherName,
    groups,
    schedule,
    curriculum,
    selectedGroupId,
    setSelectedGroupId,
    activeGroup,
    activeTab,
    setActiveTab,
    updateGroupWeek,
    getGroupConstituents,
    exportDataJSON,
    importDataJSON,
    resetToDemoData,
    syncOfficialRosters
  } = useApp();

  const constituentGroups = getGroupConstituents(activeGroup);
  const isStream = Boolean(activeGroup?.isLectureFlow && constituentGroups.length > 1);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importDataJSON(content);
        if (success) {
          alert("Zaxira ma'lumotlari muvaffaqiyatli tiklandi!");
        } else {
          alert("Faylni o'qishda xatolik yuz berdi. Iltimos to'g'ri JSON fayl tanlang.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-30 border-b border-slate-800">
      {/* Top Banner with Teacher Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Teacher Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Ustoz Jurnali</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Biokimyo kafedrasi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                O'qituvchi: <span className="text-emerald-400 font-semibold">{teacherName}</span>
              </p>
            </div>
          </div>

          {/* Group and Week Selector Controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Active Group Selector */}
            <div className="flex items-center space-x-2 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <Users className="w-4 h-4 text-slate-400 ml-2" />
              <span className="text-xs text-slate-400 font-medium">Guruh:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="bg-slate-900 text-white text-sm font-semibold rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <optgroup label="🌊 OQIMLAR (3 ta guruh birgalikda ma'ruza)">
                  {groups
                    .filter((g) => g.isLectureFlow)
                    .map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.internship?.isActive ? '🏥 [Amaliyotda] ' : ''}🌊 {grp.name} ({grp.faculty})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📋 ALOHIDA AMALIYOT GURUHLARI">
                  {groups
                    .filter((g) => !g.isLectureFlow && g.hasPractical === true)
                    .map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.internship?.isActive ? '🏥 [Amaliyotda] ' : ''}{grp.name} ({grp.faculty})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Current Week Switcher for Active Group */}
            {activeGroup && (
              <div className="flex items-center space-x-2 bg-slate-800/90 rounded-lg p-1 px-2 border border-slate-700">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Joriy hafta:</span>
                <div className="flex space-x-1 overflow-x-auto max-w-[280px] scrollbar-none py-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => updateGroupWeek(activeGroup.id, w)}
                      className={`px-1.5 py-0.5 text-xs font-bold rounded transition-all shrink-0 ${
                        activeGroup.currentWeek === w
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={`${w}-hafta etib belgilash`}
                    >
                      {w}-h
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share to students button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 transition shadow-lg shadow-teal-500/20"
              title="Har bir guruh uchun alohida linklarni ko'rish va nusxalash"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Guruh linklari</span>
            </button>

            {/* Backup & Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBackupMenu(!showBackupMenu)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <span>Boshqaruv</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showBackupMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <button
                    onClick={() => {
                      exportDataJSON();
                      setShowBackupMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center space-x-2 text-slate-200"
                  >
                    <Download className="w-4 h-4 text-teal-400" />
                    <span>Zaxira nusxa yuklab olish (JSON)</span>
                  </button>
                  <label className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center space-x-2 text-slate-200 cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Zaxirani tiklash (JSON)</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={() => {
                      syncOfficialRosters();
                      setShowBackupMenu(false);
                      alert("Rasmiy ro'yxat bo'yicha Davolash (204 nafar) va Pediatriya (87 nafar) talabalari to'liq yuklandi!");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center space-x-2 text-emerald-300 font-medium"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>Rasmiy ro'yxatni yangilash (291)</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setShowBackupMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center space-x-2 text-amber-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Dastlabki namunaga qaytarish</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-semibold rounded px-2 py-1 border border-slate-700"
            >
              <optgroup label="🌊 OQIMLAR">
                {groups
                  .filter((g) => g.isLectureFlow)
                  .map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.internship?.isActive ? '🏥 [Amaliyot] ' : ''}🌊 {grp.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="📋 AMALIYOT GURUHLARI">
                {groups
                  .filter((g) => !g.isLectureFlow && g.hasPractical === true)
                  .map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.internship?.isActive ? '🏥 [Amaliyot] ' : ''}{grp.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1 shadow"
              title="Har bir guruh uchun alohida linklarni ochish"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Linklar</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="hidden md:flex space-x-1 border-t border-slate-800/80 py-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'schedule'
                ? 'bg-amber-400 text-slate-950 font-bold shadow'
                : 'text-amber-300/90 hover:bg-slate-800 hover:text-amber-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>🗓 Dars jadvali</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'attendance'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Davomat (Bor / Yo'q)</span>
          </button>

          <button
            onClick={() => setActiveTab('makeups')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition relative ${
              activeTab === 'makeups'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Qoldirilgan darslar & Qayta topshirish (NB)</span>
          </button>

          <button
            onClick={() => setActiveTab('independent')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'independent'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mustaqil ta'lim & Vazifalar</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'curriculum'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalendar-tematik reja</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'students'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Guruh & Talabalar</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'reports'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Vedomost & Hisobotlar</span>
          </button>

          <button
            onClick={() => setActiveTab('student_portal')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'student_portal'
                ? 'bg-purple-500 text-slate-950 font-black shadow'
                : 'text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 border border-purple-500/20'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-300" />
            <span>Talabalar portali (Havola)</span>
          </button>
        </div>
      </div>

      {/* Stream Sub-Bar: When active group is an Oqim, quickly jump to any of the 3 constituent groups */}
      {isStream && activeGroup && (
        <div className="bg-purple-950/60 border-t border-purple-800/40 py-1.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center space-x-1">
                <span>🌊 Oqim rejimi:</span>
              </span>
              <span className="text-slate-300 font-medium">
                {activeGroup.name} — tarkibidagi 3 ta guruh:
              </span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {constituentGroups.map((cGrp) => (
                <button
                  key={cGrp.id}
                  onClick={() => setSelectedGroupId(cGrp.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center space-x-1 hover:text-white"
                  title={`${cGrp.name} individual guruhiga o'tish`}
                >
                  <span>🏛 {cGrp.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 px-4 pt-2 pb-4 space-y-2 border-t border-slate-700">
          {/* Mobile Group Selector */}
          <div className="py-2 border-b border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">Guruhni tanlash:</span>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-slate-900 text-white text-sm font-semibold rounded p-2 border border-slate-700"
            >
              <optgroup label="🌊 OQIMLAR (3 ta guruh birgalikda)">
                {groups
                  .filter((g) => g.isLectureFlow)
                  .map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      🌊 {grp.name} ({grp.faculty})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="📋 ALOHIDA AMALIYOT GURUHLARI">
                {groups
                  .filter((g) => !g.isLectureFlow)
                  .map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.faculty})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {activeGroup && (
            <div className="py-2 border-b border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                {activeGroup.name} uchun joriy hafta:
              </span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => updateGroupWeek(activeGroup.id, w)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      activeGroup.currentWeek === w
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {w}-hafta
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setActiveTab('schedule');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'schedule' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-700 text-amber-200'
              }`}
            >
              🗓 Dars jadvali
            </button>
            <button
              onClick={() => {
                setActiveTab('attendance');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'attendance' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              📋 Davomat (Bor / Yo'q)
            </button>
            <button
              onClick={() => {
                setActiveTab('makeups');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'makeups' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              ⏳ Qoldirilgan darslar (NB)
            </button>
            <button
              onClick={() => {
                setActiveTab('independent');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'independent' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              📖 Mustaqil ta'lim
            </button>
            <button
              onClick={() => {
                setActiveTab('curriculum');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'curriculum' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              📅 Kalendar reja
            </button>
            <button
              onClick={() => {
                setActiveTab('students');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'students' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              👥 Guruh & Talabalar
            </button>
            <button
              onClick={() => {
                setActiveTab('reports');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'reports' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
              }`}
            >
              📊 Vedomost & Hisobot
            </button>
            <button
              onClick={() => {
                setActiveTab('student_portal');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded text-xs font-medium text-left ${
                activeTab === 'student_portal' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-purple-950/60 text-purple-200 border border-purple-800'
              }`}
            >
              🎓 Talabalar portali (Havola)
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                exportDataJSON();
                setMobileMenuOpen(false);
              }}
              className="text-teal-400 font-medium py-1"
            >
              📥 Zaxira yuklash (JSON)
            </button>
            <button
              onClick={() => {
                resetToDemoData();
                setMobileMenuOpen(false);
              }}
              className="text-amber-400 font-medium py-1"
            >
              🔄 Qayta tiklash
            </button>
          </div>
        </div>
      )}

      {/* Share to students modal */}
      <ShareToStudentsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        groups={groups}
        schedule={schedule}
        curriculum={curriculum}
        selectedWeek={4}
        teacherName={teacherName}
      />
    </header>
  );
};
