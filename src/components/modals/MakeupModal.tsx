import React, { useState } from 'react';
import { CheckCircle, X, Calendar, BookOpen, Award, FileText } from 'lucide-react';
import { MakeupRecord, Student } from '../../types';

interface MakeupModalProps {
  isOpen: boolean;
  onClose: () => void;
  makeup: MakeupRecord | null;
  student: Student | undefined;
  onSave: (data: Omit<MakeupRecord, 'id' | 'recordedAt'> & { id?: string }) => void;
}

export const MakeupModal: React.FC<MakeupModalProps> = ({
  isOpen,
  onClose,
  makeup,
  student,
  onSave
}) => {
  const [missedDate, setMissedDate] = useState('');
  const [missedTopic, setMissedTopic] = useState('');
  const [lessonType, setLessonType] = useState<'maruza' | 'amaliy' | 'laboratoriya' | 'seminar'>('maruza');
  const [submittedDate, setSubmittedDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'submitted' | 'rejected'>('submitted');
  const [score, setScore] = useState<number | ''>(85);
  const [submissionType, setSubmissionType] = useState<'savol_javob' | 'referat' | 'test' | 'ogzaki' | 'yozma'>('ogzaki');
  const [teacherNote, setTeacherNote] = useState('');

  React.useEffect(() => {
    if (makeup) {
      setMissedDate(makeup.missedDate || '');
      setMissedTopic(makeup.missedTopic || '');
      setLessonType(makeup.lessonType || 'maruza');
      setSubmittedDate(makeup.submittedDate || new Date().toISOString().split('T')[0]);
      setStatus(makeup.status || 'submitted');
      setScore(makeup.score !== undefined ? makeup.score : 85);
      setSubmissionType(makeup.submissionType || 'ogzaki');
      setTeacherNote(makeup.teacherNote || '');
    }
  }, [makeup, isOpen]);

  if (!isOpen || !makeup) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: makeup.id,
      studentId: makeup.studentId,
      groupId: makeup.groupId,
      missedSessionId: makeup.missedSessionId,
      missedDate,
      missedTopic,
      lessonType,
      submittedDate: status === 'submitted' ? (submittedDate || new Date().toISOString().split('T')[0]) : undefined,
      status,
      score: status === 'submitted' && score !== '' ? Number(score) : undefined,
      submissionType,
      teacherNote
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <h3 className="font-bold text-base">Qoldirilgan darsni qayta topshirish (Otrabotka)</h3>
              <p className="text-xs text-teal-100">Qaysi kuni qoldirgan va qaysi kuni topshirganlik hisobi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-teal-700 text-teal-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Student Info Card */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Talaba F.I.Sh:</span>
            <div className="font-bold text-slate-100 text-sm">{student?.fullName || 'Noma\'lum talaba'}</div>
            <div className="text-xs text-slate-400 mt-0.5">ID: {student?.studentCode || '—'}</div>
          </div>

          {/* Missed Lesson Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Qaysi kuni dars qoldirgan:</span>
              </label>
              <input
                type="date"
                value={missedDate}
                onChange={(e) => setMissedDate(e.target.value)}
                className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dars turi:
              </label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as any)}
                className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="maruza">Ma'ruza (2 soat)</option>
                <option value="amaliy">Amaliy mashg'ulot (2 soat)</option>
                <option value="laboratoriya">Laboratoriya (2 soat)</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Qoldirilgan dars / ma'ruza mavzusi:</span>
            </label>
            <input
              type="text"
              value={missedTopic}
              onChange={(e) => setMissedTopic(e.target.value)}
              placeholder="Masalan: Fermentlar biokimyosi..."
              className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
              Qayta topshirish natijalari
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Qaysi kuni topshirgan:</span>
                </label>
                <input
                  type="date"
                  value={submittedDate}
                  onChange={(e) => setSubmittedDate(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topshirish shakli:
                </label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as any)}
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ogzaki">Og'zaki so'rov (Savol-javob)</option>
                  <option value="referat">Referat / Mustaqil ish</option>
                  <option value="yozma">Yozma nazorat ishi</option>
                  <option value="test">Test sinovi</option>
                  <option value="savol_javob">Kafedra suhbati</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Holati (Status):
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full text-sm font-semibold rounded-lg p-2 border focus:outline-none focus:ring-2 ${
                    status === 'submitted'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600'
                      : status === 'pending'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-600'
                      : 'bg-amber-950/60 text-amber-300 border-amber-600'
                  }`}
                >
                  <option value="submitted">✅ Topshirildi (Qabul qilindi / NB yopildi)</option>
                  <option value="pending">⏳ Qarzdor (Hali topshirmagan)</option>
                  <option value="rejected">⚠️ Qayta ishlashga qaytarildi (Qoniqarsiz)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Baho / Ball:</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Masalan: 85 ball yoki 5"
                  className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>O'qituvchi izohi:</span>
              </label>
              <textarea
                rows={2}
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Savollarga berilgan javoblar, kamchiliklar yoki taqriz..."
                className="w-full bg-slate-800 text-sm text-slate-100 rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-lg shadow-teal-400/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
