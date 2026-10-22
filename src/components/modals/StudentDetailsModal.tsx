import React from 'react';
import { User, X, Clock, Calendar, AlertTriangle, CheckCircle, BookOpen, Award } from 'lucide-react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onOpenMakeup?: (makeupId?: string) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenMakeup
}) => {
  const { sessions, makeups, assignments, independentTopics, groups } = useApp();

  if (!isOpen || !student) return null;

  const studentGroup = groups.find((g) => g.id === student.groupId);
  const studentMakeups = makeups.filter((m) => m.studentId === student.id);
  const studentAssignment = assignments.find((a) => a.studentId === student.id);
  const assignedTopic = studentAssignment
    ? independentTopics.find((t) => t.id === studentAssignment.topicId)
    : null;

  // Calculate statistics for this student
  let totalSessions = 0;
  let presentCount = 0;
  let absentCount = 0;
  let noUniformCount = 0;
  let excusedCount = 0;
  let lateCount = 0;
  let totalLateMinutes = 0;

  const studentSessionsHistory: Array<{
    date: string;
    topic: string;
    status: string;
    lateMinutes?: number;
    note?: string;
  }> = [];

  sessions
    .filter((s) => s.groupId === student.groupId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((s) => {
      const att = s.attendance[student.id];
      if (att) {
        totalSessions++;
        if (att.status === 'present') presentCount++;
        else if (att.status === 'absent') absentCount++;
        else if (att.status === 'no_uniform') noUniformCount++;
        else if (att.status === 'excused_absent') excusedCount++;
        else if (att.status === 'late') {
          lateCount++;
          totalLateMinutes += att.lateMinutes || 0;
        }

        studentSessionsHistory.push({
          date: s.date,
          topic: s.topicTitle,
          status: att.status,
          lateMinutes: att.lateMinutes,
          note: att.note || att.lateReason
        });
      }
    });

  const pendingMakeups = studentMakeups.filter((m) => m.status === 'pending');
  const submittedMakeups = studentMakeups.filter((m) => m.status === 'submitted');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{student.fullName}</h3>
              <p className="text-xs text-slate-400">
                {studentGroup?.name} | ID: {student.studentCode || '—'} | Tel: {student.phone || 'Kiritilmagan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Jami darslar</span>
              <div className="text-xl font-bold text-white mt-0.5">{totalSessions} ta</div>
              <span className="text-[11px] text-teal-400 font-medium">
                {presentCount} ta darsda qatnashgan
              </span>
            </div>

            <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/40 text-center">
              <span className="text-[11px] text-rose-300 uppercase font-semibold">NB (Qoldirgan)</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5">{absentCount * 2} soat</div>
              <span className="text-[11px] text-rose-300 font-medium">
                {absentCount} marta darsga kelmagan
              </span>
            </div>

            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 text-center">
              <span className="text-[11px] text-amber-300 uppercase font-semibold">Kech qolish</span>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{totalLateMinutes} daqiqa</div>
              <span className="text-[11px] text-amber-300 font-medium">
                {lateCount} marta kech kelgan
              </span>
            </div>

            <div className="bg-orange-950/40 p-3 rounded-xl border border-orange-800/40 text-center">
              <span className="text-[11px] text-orange-300 uppercase font-semibold">Formasiz</span>
              <div className="text-xl font-bold text-orange-400 mt-0.5">{noUniformCount} marta</div>
              <span className="text-[11px] text-orange-300 font-medium">
                Xalatsiz kelgan holatlar
              </span>
            </div>
          </div>

          {/* Section: Missed Classes & Makeups (Otrabotka) */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-200 text-sm">
                  Qoldirilgan darslar va qayta topshirishlar (NB jurnali)
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {pendingMakeups.length} ta qarzdorlik
              </span>
            </div>

            {studentMakeups.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Ushbu talabada hozircha qayd etilgan dars qoldirishlar (NB) mavjud emas.
              </p>
            ) : (
              <div className="space-y-2">
                {studentMakeups.map((mk) => (
                  <div
                    key={mk.id}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                      mk.status === 'submitted'
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 text-xs flex items-center space-x-2">
                        <span>{mk.missedTopic}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                          {mk.lessonType}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 flex flex-wrap gap-x-3">
                        <span className="text-rose-400">
                          Qoldirilgan sana: <strong>{mk.missedDate}</strong>
                        </span>
                        {mk.submittedDate ? (
                          <span className="text-emerald-400">
                            Topshirgan sana: <strong>{mk.submittedDate}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-400">Hali topshirmagan (Qarzdor)</span>
                        )}
                        {mk.score && (
                          <span className="text-teal-300">
                            Baho: <strong>{mk.score} ball</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          mk.status === 'submitted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {mk.status === 'submitted' ? '✅ Topshirildi' : '⏳ Qarzdor'}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenMakeup?.(mk.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        Tahrirlash
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Mustaqil ta'lim */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-slate-200 text-sm">Mustaqil ta'lim mavzusi</h4>
            </div>

            {studentAssignment && assignedTopic ? (
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs space-y-1.5">
                <div className="font-semibold text-slate-100">{assignedTopic.title}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                  <span>Dedlayn: <strong>{studentAssignment.deadline}</strong></span>
                  <span>
                    Holat:
                    <strong className="ml-1 text-teal-400">
                      {studentAssignment.status === 'completed'
                        ? 'Topshirildi'
                        : studentAssignment.status === 'in_review'
                        ? 'Tekshiruvda'
                        : studentAssignment.status === 'revision_needed'
                        ? 'Qayta ishlashda'
                        : 'Biriktirildi'}
                    </strong>
                  </span>
                  {studentAssignment.score && (
                    <span>
                      Baho: <strong className="text-amber-400">{studentAssignment.score} ball</strong>
                    </span>
                  )}
                </div>
                {studentAssignment.feedback && (
                  <div className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-750">
                    Ustoz taqrizi: {studentAssignment.feedback}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Ushbu talabaga hozircha mustaqil ta'lim mavzusi biriktirilmagan.
              </p>
            )}
          </div>

          {/* Attendance History log */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-2">
              Oxirgi darslar davomati tarixi ({studentSessionsHistory.length})
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Sana</th>
                    <th className="py-2 px-3">Dars mavzusi</th>
                    <th className="py-2 px-3">Holat</th>
                    <th className="py-2 px-3">Izoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {studentSessionsHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-850">
                      <td className="py-2 px-3 text-slate-400 font-mono">{h.date}</td>
                      <td className="py-2 px-3 text-slate-200 font-medium">{h.topic}</td>
                      <td className="py-2 px-3">
                        {h.status === 'present' && (
                          <span className="text-emerald-400 font-bold">🟢 Bor</span>
                        )}
                        {h.status === 'absent' && (
                          <span className="text-rose-400 font-bold">🔴 NB (Yo'q)</span>
                        )}
                        {h.status === 'late' && (
                          <span className="text-amber-400 font-bold">
                            ⏱ Kech ({h.lateMinutes} min)
                          </span>
                        )}
                        {h.status === 'no_uniform' && (
                          <span className="text-orange-400 font-bold">🟡 Formasiz</span>
                        )}
                        {h.status === 'excused_absent' && (
                          <span className="text-blue-400 font-bold">🔵 Sababli</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{h.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-850 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
