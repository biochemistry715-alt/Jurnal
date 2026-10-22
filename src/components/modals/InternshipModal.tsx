import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GroupInternshipInfo, StudentGroup } from '../../types';

interface InternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGroupId?: string;
}

export const InternshipModal: React.FC<InternshipModalProps> = ({
  isOpen,
  onClose,
  initialGroupId
}) => {
  const { groups, setGroupInternship, bulkSetGroupInternship } = useApp();

  // Selected groups to apply internship
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => {
    if (initialGroupId) return [initialGroupId];
    // Default to DI 1-12 groups
    return groups
      .filter((g) => {
        const num = parseInt(g.name.replace(/[^0-9]/g, ''), 10);
        return g.name.startsWith('DI') && num >= 1 && num <= 12;
      })
      .map((g) => g.id);
  });

  // Internship form state
  const [startDate, setStartDate] = useState('2026-10-12');
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [pausedLessonNumber, setPausedLessonNumber] = useState(2);
  const [title, setTitle] = useState('2 haftalik klinik / dala amaliyoti');
  const [note, setNote] = useState("Davolash ishi 1-12 guruhlar (12.10.2026 dan 2 hafta)");
  const [isActive, setIsActive] = useState(true);

  // Success flash
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate return date & resume week
  const calculateEndDate = (start: string, weeks: number) => {
    try {
      const dt = new Date(start + 'T00:00:00');
      dt.setDate(dt.getDate() + weeks * 7 - 1);
      return dt.toISOString().split('T')[0];
    } catch {
      return '2026-10-25';
    }
  };

  const calculateResumeDate = (start: string, weeks: number) => {
    try {
      const dt = new Date(start + 'T00:00:00');
      dt.setDate(dt.getDate() + weeks * 7);
      return dt.toISOString().split('T')[0];
    } catch {
      return '2026-10-26';
    }
  };

  const endDate = calculateEndDate(startDate, durationWeeks);
  const resumeDate = calculateResumeDate(startDate, durationWeeks);
  const resumeLessonNumber = pausedLessonNumber + 1;

  // Quick preset: Select Davolash ishi 1-12
  const handleSelectDI1to12 = () => {
    const di1to12 = groups.filter((g) => {
      if (g.isLectureFlow && g.id.includes('stream-01-03')) return true;
      const numMatch = g.name.match(/DI-25-(\d+)/);
      if (numMatch) {
        const n = parseInt(numMatch[1], 10);
        return n >= 1 && n <= 12;
      }
      return false;
    });
    setSelectedGroupIds(di1to12.map((g) => g.id));
    setStartDate('2026-10-12');
    setDurationWeeks(2);
    setPausedLessonNumber(2);
    setTitle('2 haftalik klinik / dala amaliyoti');
    setNote('Davolash ishi 1-12 guruhlar 12.10.2026 dan 2 haftalik amaliyotda');
    setIsActive(true);
  };

  const handleSelectAll = () => {
    setSelectedGroupIds(groups.map((g) => g.id));
  };

  const handleClearSelection = () => {
    setSelectedGroupIds([]);
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Apply internship to selected groups
  const handleApplyInternship = () => {
    if (selectedGroupIds.length === 0) {
      alert("Iltimos, amaliyotga biriktirish uchun kamida bitta guruhni tanlang!");
      return;
    }

    const internshipData: GroupInternshipInfo = {
      isActive,
      startDate,
      endDate,
      startWeek: 3, // 12-oktyabr 3-hafta
      durationWeeks,
      pausedLessonNumber,
      resumeWeek: 3 + durationWeeks, // 5-hafta (26-okt)
      title,
      note
    };

    bulkSetGroupInternship(selectedGroupIds, internshipData);

    setToastMessage(
      `${selectedGroupIds.length} ta guruh amaliyotga muvaffaqiyatli biriktirildi! Darslar ${resumeDate} dan ${resumeLessonNumber}-darsdan davom etadi.`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Remove internship from selected groups
  const handleRemoveInternship = () => {
    if (selectedGroupIds.length === 0) {
      alert("Iltimos, amaliyotni bekor qilish uchun guruhlarni tanlang!");
      return;
    }

    bulkSetGroupInternship(selectedGroupIds, undefined);
    setToastMessage(`${selectedGroupIds.length} ta guruhdan amaliyot holati olib tashlandi.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick toggle single group
  const handleToggleSingleGroup = (group: StudentGroup) => {
    if (group.internship?.isActive) {
      // Mark as completed/inactive
      setGroupInternship(group.id, {
        ...group.internship,
        isActive: false
      });
      setToastMessage(`${group.name}: Amaliyot yakunlandi, darslar tiklandi.`);
    } else if (group.internship) {
      // Re-activate
      setGroupInternship(group.id, {
        ...group.internship,
        isActive: true
      });
      setToastMessage(`${group.name}: Amaliyot qayta faollashtirildi.`);
    } else {
      // Create new
      const internshipData: GroupInternshipInfo = {
        isActive: true,
        startDate: '2026-10-12',
        endDate: '2026-10-25',
        startWeek: 3,
        durationWeeks: 2,
        pausedLessonNumber: 2,
        resumeWeek: 5,
        title: '2 haftalik klinik / dala amaliyoti',
        note: 'Davolash ishi (12.10.2026 dan 2 hafta)'
      };
      setGroupInternship(group.id, internshipData);
      setToastMessage(`${group.name}: 2 haftalik amaliyotga chiqarildi.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Groups currently on practice
  const groupsOnInternship = groups.filter((g) => g.internship?.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">
                  Guruhlar amaliyoti (Klinik / Dala amaliyoti)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {groupsOnInternship.length} ta guruh amaliyotda
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Amaliyot davrida guruh darslari to'xtatiladi. Amaliyotdan qaytgach, darslar kelgan joyidan (o'tkazib yubormasdan) davom etadi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Quick Preset Banner for Davolash Ishi 1-12 */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-teal-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-amber-300 font-black text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tezkor biriktirish: Davolash ishi 1–12 guruhlar (12.10.2026 dan 2 hafta)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hozir Davolash ishi 1-guruhdan 12-guruhgacha 12.10.2026 dan 2 haftalik amaliyotda. Ushbu tugma 1 ta bosishda barcha 12 ta guruhni amaliyot holatiga keltiradi!
              </p>
            </div>

            <button
              type="button"
              onClick={handleSelectDI1to12}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition shrink-0 flex items-center space-x-1.5 self-start md:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>12 ta guruhni tanlash va to'ldirish</span>
            </button>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Boshlanish sanasi:</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">12.10.2026 (3-hafta)</span>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Muddati (hafta):</span>
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1 hafta</option>
                <option value={2}>2 hafta (Standart)</option>
                <option value={3}>3 hafta</option>
                <option value={4}>4 hafta</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Tugash: {endDate}</span>
            </div>

            {/* Paused Lesson Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>O'tilgan dars (To'xtatilgan):</span>
              </label>
              <select
                value={pausedLessonNumber}
                onChange={(e) => setPausedLessonNumber(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1-dars o'tilgan (2-darsdan davom etadi)</option>
                <option value={2}>2-dars o'tilgan (3-darsdan davom etadi)</option>
                <option value={3}>3-dars o'tilgan (4-darsdan davom etadi)</option>
                <option value={4}>4-dars o'tilgan (5-darsdan davom etadi)</option>
              </select>
              <span className="text-[10px] text-teal-400 font-bold mt-0.5 block">
                {resumeLessonNumber}-darsdan davom etadi!
              </span>
            </div>

            {/* Status toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Amaliyot holati:</span>
              </label>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Amaliyotda
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    !isActive
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Qaytgan
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {isActive ? "Darslar vaqtincha to'xtatilgan" : "Darslar kelgan joyidan davom etadi"}
              </span>
            </div>

            {/* Title & Note (Full Width) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Amaliyot nomi:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="2 haftalik klinik / dala amaliyoti"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Qo'shimcha izoh / Ma'lumot:
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                placeholder="Davolash ishi 1-12 guruhlar (12.10.2026 dan 2 hafta)"
              />
            </div>
          </div>

          {/* Academic Continuation Guarantee Box */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-start space-x-3 text-xs text-teal-300">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white">
                Kelgan joyidan davom etish kafolati:
              </div>
              <p className="leading-relaxed text-slate-300">
                Amaliyotdagi guruhlar <strong>{startDate} dan {endDate} gacha</strong> (3 va 4-haftalarda) amaliyotda bo'ladi. Ular qaytganlaridan keyin (<strong>{resumeDate}</strong>, 5-haftadan boshlab), ularning darslari to'xtatilgan <strong>{resumeLessonNumber}-darsdan</strong> navbatma-navbat davom etadi. Dars mavzulari tashlab ketilmaydi!
              </p>
            </div>
          </div>

          {/* Group Selection Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h3 className="font-black text-sm text-white">
                  Guruhlarni tanlash ({selectedGroupIds.length} ta tanlangan):
                </h3>
              </div>

              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={handleSelectDI1to12}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition"
                >
                  DI 1–12 guruhlar
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Barchasini tanlash
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  Tozalash
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
              {groups.map((group) => {
                const isSelected = selectedGroupIds.includes(group.id);
                const isCurrentlyActive = group.internship?.isActive;

                return (
                  <div
                    key={group.id}
                    onClick={() => handleToggleGroup(group.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : isCurrentlyActive
                        ? 'bg-slate-900 border-amber-500/30 text-slate-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-black text-sm text-white">
                          {group.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {group.faculty}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {isCurrentlyActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <span>🏥 Amaliyotda</span>
                        </span>
                      ) : group.internship ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Qaytgan ({group.internship.pausedLessonNumber + 1}-dars)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Odatiy darslar
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSingleGroup(group);
                        }}
                        className="text-[10px] text-teal-400 hover:underline font-bold"
                      >
                        {isCurrentlyActive ? "Tugatish" : "Amaliyot"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          <div className="text-xs text-slate-400">
            Tanlangan: <strong className="text-white">{selectedGroupIds.length} ta guruh</strong> • Muddat: <strong className="text-amber-300">{startDate} dan {endDate} gacha</strong>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRemoveInternship}
              disabled={selectedGroupIds.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Amaliyotni bekor qilish
            </button>

            <button
              type="button"
              onClick={handleApplyInternship}
              disabled={selectedGroupIds.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Amaliyotni biriktirish / Saqlash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
