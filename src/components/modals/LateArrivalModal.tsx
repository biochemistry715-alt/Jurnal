import React, { useState } from 'react';
import { Clock, X, AlertCircle } from 'lucide-react';
import { Student } from '../../types';

interface LateArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentMinutes?: number;
  currentReason?: string;
  onSave: (minutes: number, reason: string) => void;
}

export const LateArrivalModal: React.FC<LateArrivalModalProps> = ({
  isOpen,
  onClose,
  student,
  currentMinutes = 15,
  currentReason = '',
  onSave
}) => {
  const [minutes, setMinutes] = useState<number>(currentMinutes || 15);
  const [reason, setReason] = useState<string>(currentReason || '');

  // Reset or initialize when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMinutes(currentMinutes || 15);
      setReason(currentReason || '');
    }
  }, [isOpen, currentMinutes, currentReason]);

  if (!isOpen || !student) return null;

  const quickMinutes = [5, 10, 15, 20, 25, 30, 45];
  const quickReasons = [
    'Yo\'lda transport kechikishi / tirbandlik',
    'Oldingi dars cho\'zilib ketdi',
    'Dekanat / Kutubxona topshirig\'i bilan',
    'Navbatchilikdan chiqdi',
    'Salomatlik / Poliklinikadan keldi'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) {
      alert('Iltimos kechikish daqiqasini 0 dan katta qilib kiriting.');
      return;
    }
    onSave(minutes, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kech qolganlikni qayd etish</h3>
              <p className="text-xs text-amber-100">Darsga kechikib kelgan talaba</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-800 text-amber-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Talaba:</span>
            <div className="font-semibold text-slate-100 text-sm">{student.fullName}</div>
            <div className="text-xs text-slate-400 mt-0.5">ID: {student.studentCode || 'Mavjud emas'}</div>
          </div>

          {/* Quick Select Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Necha minut kech qoldi?
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickMinutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg border transition ${
                    minutes === m
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:border-slate-600'
                  }`}
                >
                  +{m} minut
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:ring-2 focus-within:ring-amber-500">
              <Clock className="w-5 h-5 text-amber-400 ml-1" />
              <input
                type="number"
                min="1"
                max="80"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-bold text-lg focus:outline-none"
                placeholder="Daqiqa kiriting..."
                required
              />
              <span className="text-xs text-slate-400 font-semibold pr-2">daqiqa</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kech qolish sababi (ixtiyoriy):
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sababini yozing..."
              className="w-full bg-slate-800 text-sm text-slate-100 rounded-xl p-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Kechikish daqiqasi talabaning shaxsiy dosyesida va jurnalda saqlanadi.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-400/20 transition flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Saqlash ({minutes} daqiqa)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
