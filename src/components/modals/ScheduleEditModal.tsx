import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, MapPin, Users, BookOpen, AlertCircle, Trash2, Check } from 'lucide-react';
import { StudentGroup, WeeklyScheduleSlot } from '../../types';

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotToEdit?: WeeklyScheduleSlot | null;
  initialDay?: WeeklyScheduleSlot['dayOfWeek'];
  groups: StudentGroup[];
  onSave: (slotData: Omit<WeeklyScheduleSlot, 'id'>, existingId?: string) => void;
  onDelete?: (slotId: string) => void;
}

const DEFAULT_PAIR_TIMES: Record<number, string> = {
  1: '08:30 - 09:50',
  2: '10:00 - 11:20',
  3: '12:00 - 13:20',
  4: '13:30 - 14:50',
  5: '15:00 - 16:20',
  6: '16:30 - 17:50'
};

const DAY_LABELS: Record<string, string> = {
  dushanba: 'Dushanba',
  seshanba: 'Seshanba',
  chorshanba: 'Chorshanba',
  payshanba: 'Payshanba',
  juma: 'Juma'
};

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  isOpen,
  onClose,
  slotToEdit,
  initialDay = 'dushanba',
  groups,
  onSave,
  onDelete
}) => {
  const isEditing = !!slotToEdit;

  const [dayOfWeek, setDayOfWeek] = useState<WeeklyScheduleSlot['dayOfWeek']>(initialDay);
  const [pairNumber, setPairNumber] = useState<number>(1);
  const [pairTime, setPairTime] = useState<string>('08:30 - 09:50');
  const [groupCode, setGroupCode] = useState<string>('');
  const [room, setRoom] = useState<string>('411');
  const [type, setType] = useState<'maruza' | 'amaliy'>('amaliy');
  const [matchingGroupId, setMatchingGroupId] = useState<string>('');
  const [isLectureFlow, setIsLectureFlow] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (slotToEdit) {
      setDayOfWeek(slotToEdit.dayOfWeek);
      setPairNumber(slotToEdit.pairNumber);
      setPairTime(slotToEdit.pairTime);
      setGroupCode(slotToEdit.groupCode);
      setRoom(slotToEdit.room);
      setType(slotToEdit.type);
      setMatchingGroupId(slotToEdit.matchingGroupId || '');
      setIsLectureFlow(slotToEdit.isLectureFlow);
    } else {
      setDayOfWeek(initialDay);
      setPairNumber(1);
      setPairTime(DEFAULT_PAIR_TIMES[1]);
      if (groups.length > 0) {
        setGroupCode(groups[0].name);
        setMatchingGroupId(groups[0].id);
        setIsLectureFlow(!!groups[0].isLectureFlow);
        setType(groups[0].isLectureFlow ? 'maruza' : 'amaliy');
        setRoom(groups[0].room?.replace('-auditoriya', '') || '411');
      } else {
        setGroupCode('DI-25-22');
        setMatchingGroupId('');
        setIsLectureFlow(false);
        setType('amaliy');
        setRoom('411');
      }
    }
    setError('');
  }, [slotToEdit, initialDay, groups, isOpen]);

  if (!isOpen) return null;

  const handlePairNumberChange = (num: number) => {
    setPairNumber(num);
    if (DEFAULT_PAIR_TIMES[num]) {
      setPairTime(DEFAULT_PAIR_TIMES[num]);
    }
  };

  const handleGroupSelect = (gId: string) => {
    setMatchingGroupId(gId);
    const grp = groups.find((g) => g.id === gId);
    if (grp) {
      setGroupCode(grp.name);
      setIsLectureFlow(!!grp.isLectureFlow);
      if (grp.isLectureFlow) {
        setType('maruza');
      }
      if (grp.room) {
        setRoom(grp.room.replace('-auditoriya', ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode.trim()) {
      setError('Iltimos, guruh nomini kiriting yoki tanlang!');
      return;
    }
    if (!room.trim()) {
      setError('Iltimos, dars xonasini kiriting!');
      return;
    }

    onSave(
      {
        dayOfWeek,
        dayNameUz: DAY_LABELS[dayOfWeek],
        pairNumber,
        pairTime,
        groupCode: groupCode.trim(),
        room: room.trim(),
        type,
        isLectureFlow: type === 'maruza' || isLectureFlow,
        matchingGroupId: matchingGroupId || undefined
      },
      slotToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
          <div>
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>{isEditing ? 'Dars soatini tahrirlash' : "Yangi dars soati qo'shish"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hafta kuni, para raqami, dars soati, guruh va xonani moslang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Hafta kuni */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Hafta kuni
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DAY_LABELS) as Array<WeeklyScheduleSlot['dayOfWeek']>).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDayOfWeek(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    dayOfWeek === d
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700/60'
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Para raqami & Vaqti */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Para (dars soati)
              </label>
              <select
                value={pairNumber}
                onChange={(e) => handlePairNumberChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1-para (08:30 - 09:50)</option>
                <option value={2}>2-para (10:00 - 11:20)</option>
                <option value={3}>3-para (12:00 - 13:20)</option>
                <option value={4}>4-para (13:30 - 14:50)</option>
                <option value={5}>5-para (15:00 - 16:20)</option>
                <option value={6}>6-para (16:30 - 17:50)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Aniq vaqt oralig'i</span>
                </span>
                <span className="text-[10px] text-teal-400 font-mono">Dars vaqtini o'zgartirish</span>
              </label>
              <input
                type="text"
                value={pairTime}
                onChange={(e) => setPairTime(e.target.value)}
                placeholder="10:00 - 11:20"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['08:30 - 09:50', '10:00 - 11:20', '12:00 - 13:20', '13:30 - 14:50', '15:00 - 16:20'].map((timeStr) => (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => setPairTime(timeStr)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                      pairTime === timeStr
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-750'
                    }`}
                  >
                    {timeStr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dars turi */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Mashg'ulot turi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('amaliy')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center space-x-2 ${
                  type === 'amaliy'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500 shadow-md'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Amaliy mashg'ulot</span>
              </button>

              <button
                type="button"
                onClick={() => setType('maruza')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center space-x-2 ${
                  type === 'maruza'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-md'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Ma'ruza (Oqim)</span>
              </button>
            </div>
          </div>

          {/* Guruh tanlash yoki kiritish */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Guruh / Oqim
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    const di22 = groups.find((g) => g.name === 'DI-25-22' || g.id === 'grp-di-25-22');
                    if (di22) {
                      handleGroupSelect(di22.id);
                    } else {
                      setGroupCode('DI-25-22');
                      setType('amaliy');
                      setRoom('312');
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-black border border-teal-500/30"
                >
                  ⚡ DI-25-22 ni tanlash
                </button>
                <span className="text-[10px] text-slate-500">Mavjud ro'yxatdan tanlang</span>
              </div>
            </div>
            <select
              value={matchingGroupId}
              onChange={(e) => handleGroupSelect(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-500 mb-2"
            >
              <option value="">-- Ro'yxatdan tanlash --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.isLectureFlow ? "(Oqim)" : ""} ({g.faculty})
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                placeholder="Guruh kodi (masalan: DI-25-22)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-teal-300 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Xona / Auditoriya */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Auditoriya / Xona</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="312, 411, 413, 302, 406..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
              <div className="flex items-center space-x-1">
                {['312', '411', '413', '302', '406', '110', '07'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoom(r)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                      room === r
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {isEditing && onDelete && slotToEdit ? (
              confirmDelete ? (
                <div className="flex items-center space-x-1.5 bg-rose-500/15 border border-rose-500/40 p-1.5 rounded-xl animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold px-1">O'chirilsinmi?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(slotToEdit.id);
                      setConfirmDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow"
                  >
                    Ha, o'chirish
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs transition"
                  >
                    Bekor
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition flex items-center space-x-1.5"
                  title="Darsni jadvaldan o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Darsni olib tashlash</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/25 transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Saqlash' : "Jadvalga qo'shish"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
