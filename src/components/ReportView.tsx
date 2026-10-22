import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportView: React.FC = () => {
  const {
    activeGroup,
    groups,
    students,
    sessions,
    makeups,
    assignments,
    independentTopics,
    getGroupStudents,
    getGroupConstituents
  } = useApp();

  const [reportType, setReportType] = useState<'attendance' | 'nb_makeups' | 'independent'>('nb_makeups');
  const [activeReportGroupId, setActiveReportGroupId] = useState<'all' | string>('all');

  const constituentGroups = getGroupConstituents(activeGroup);
  const isStream = Boolean(activeGroup?.isLectureFlow && constituentGroups.length > 1);

  const groupStudents = activeReportGroupId === 'all'
    ? getGroupStudents(activeGroup)
    : students.filter((s) => s.groupId === activeReportGroupId);

  const groupSessions = sessions
    .filter((s) => {
      if (activeReportGroupId === 'all') {
        if (isStream) {
          return constituentGroups.some((cg) => cg.id === s.groupId) || s.groupId === activeGroup?.id;
        }
        return s.groupId === activeGroup?.id;
      }
      return s.groupId === activeReportGroupId;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupMakeups = makeups.filter((m) => {
    if (activeReportGroupId === 'all') {
      if (isStream) {
        return constituentGroups.some((cg) => cg.id === m.groupId) || m.groupId === activeGroup?.id;
      }
      return m.groupId === activeGroup?.id;
    }
    return m.groupId === activeReportGroupId;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // with UTF-8 BOM

    if (reportType === 'nb_makeups') {
      csvContent += "№,Talaba F.I.Sh,ID,Qoldirilgan sana (NB),Qoldirilgan dars mavzusi,Dars turi,Topshirgan sana,Shakli,Baho,Holati\n";
      groupMakeups.forEach((mk, idx) => {
        const student = students.find((s) => s.id === mk.studentId);
        const name = `"${student?.fullName || ''}"`;
        const code = `"${student?.studentCode || ''}"`;
        const missedDate = mk.missedDate;
        const topic = `"${mk.missedTopic.replace(/"/g, '""')}"`;
        const type = mk.lessonType;
        const subDate = mk.submittedDate || 'Topshirilmagan';
        const subType = mk.submissionType || '';
        const score = mk.score !== undefined ? mk.score : '';
        const status = mk.status === 'submitted' ? 'Yopildi' : 'Qarzdor';

        csvContent += `${idx + 1},${name},${code},${missedDate},${topic},${type},${subDate},${subType},${score},${status}\n`;
      });
    } else if (reportType === 'attendance') {
      csvContent += "№,Talaba F.I.Sh,ID,Jami darslar,Kelgan (Bor),Dars qoldirgan (NB),Kech qolgan,Formasiz\n";
      groupStudents.forEach((st, idx) => {
        let present = 0, absent = 0, late = 0, noUniform = 0;
        groupSessions.forEach((s) => {
          const att = s.attendance[st.id]?.status;
          if (att === 'present') present++;
          else if (att === 'absent') absent++;
          else if (att === 'late') late++;
          else if (att === 'no_uniform') noUniform++;
        });
        csvContent += `${idx + 1},"${st.fullName}","${st.studentCode || ''}",${groupSessions.length},${present},${absent * 2} soat,${late},${noUniform}\n`;
      });
    } else {
      csvContent += "№,Talaba F.I.Sh,ID,Mustaqil ta'lim mavzusi,Dedlayn,Topshirgan sana,Baho / Ball,Holati\n";
      groupStudents.forEach((st, idx) => {
        const asg = assignments.find((a) => a.studentId === st.id);
        const topic = asg ? independentTopics.find((t) => t.id === asg.topicId) : null;
        csvContent += `${idx + 1},"${st.fullName}","${st.studentCode || ''}","${topic?.title || 'Biriktirilmagan'}",${asg?.deadline || ''},${asg?.submissionDate || ''},${asg?.score || ''},${asg?.status || ''}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeGroup?.name}_${reportType}_hisobot.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs uppercase tracking-wide border border-teal-500/30">
                {activeGroup?.name || 'Guruh'}
              </span>
              <span className="text-xs text-slate-400">
                O'qituvchi: <strong className="text-slate-200">Mamazulunov Nurmuhammad</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-400" />
              <span>Kafedra va dekanat vedomostlari / Hisobotlar</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-teal-300 hover:text-white border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Excel (CSV) yuklab olish</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print / PDF)</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-2 pt-4 border-t border-slate-800 mt-4 overflow-x-auto">
          <button
            onClick={() => setReportType('nb_makeups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'nb_makeups'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Qoldirilgan va qayta topshirilgan darslar vedomosti (NB & Otrabotka)
          </button>
          <button
            onClick={() => setReportType('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'attendance'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Darslar bo'yicha davomat qaydnomasi
          </button>
          <button
            onClick={() => setReportType('independent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              reportType === 'independent'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Mustaqil ta'lim natijalari qaydnomasi
          </button>
        </div>

        {/* If stream, show constituent group filters */}
        {isStream && (
          <div className="flex items-center space-x-2 pt-3 border-t border-slate-800 mt-3 text-xs overflow-x-auto">
            <span className="text-slate-400 font-medium shrink-0">Oqimdagi guruhlar bo'yicha hisobot:</span>
            <button
              onClick={() => setActiveReportGroupId('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                activeReportGroupId === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🌊 Barcha 3 ta guruh (Oqim vedomosti)
            </button>
            {constituentGroups.map((cg) => (
              <button
                key={cg.id}
                onClick={() => setActiveReportGroupId(cg.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                  activeReportGroupId === cg.id
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🏛 {cg.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Printable Sheet Area */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0">
        {/* Academic Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
          <div className="text-xs font-serif uppercase tracking-widest text-slate-600 mb-1">
            O'zbekiston Respublikasi Oliy Ta'lim, Fan va Innovatsiyalar Vazirligi
          </div>
          <h2 className="text-lg font-bold uppercase font-serif tracking-wide text-slate-900">
            Tibbiy va biologik kimyo kafedrasi
          </h2>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            {reportType === 'nb_makeups' && "Qoldirilgan darslar (NB) va ularni qayta topshirish (otrabotka) qaydnomasi"}
            {reportType === 'attendance' && "Talabalar o'quv mashg'ulotlari davomati umumiy vedomosti"}
            {reportType === 'independent' && "Mustaqil ta'lim mavzulari va baholash qaydnomasi"}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-medium text-slate-600 mt-4 px-2">
            <span>Guruh: <strong className="text-slate-900 font-bold">{activeGroup?.name}</strong> ({activeGroup?.faculty})</span>
            <span>Joriy o'quv haftasi: <strong className="text-slate-900">{activeGroup?.currentWeek}-hafta</strong></span>
            <span>O'qituvchi: <strong className="text-slate-900">Mamazulunov Nurmuhammad</strong></span>
            <span>Sana: <strong className="text-slate-900">{new Date().toLocaleDateString('uz-UZ')}</strong></span>
          </div>
        </div>

        {/* 1. NB & Makeups Table */}
        {reportType === 'nb_makeups' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-8">№</th>
                  <th className="border border-slate-300 p-2">Talaba F.I.Sh</th>
                  <th className="border border-slate-300 p-2 text-rose-700">Qaysi kuni dars qoldirgan</th>
                  <th className="border border-slate-300 p-2">Qoldirilgan ma'ruza / mavzu</th>
                  <th className="border border-slate-300 p-2 text-emerald-800">Qaysi kuni topshirgan</th>
                  <th className="border border-slate-300 p-2">Shakli</th>
                  <th className="border border-slate-300 p-2 text-center">Baho</th>
                  <th className="border border-slate-300 p-2 text-center">Holati</th>
                </tr>
              </thead>
              <tbody>
                {groupMakeups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                      Ushbu guruhda qayd etilgan dars qoldirishlar mavjud emas.
                    </td>
                  </tr>
                ) : (
                  groupMakeups.map((mk, idx) => {
                    const student = students.find((s) => s.id === mk.studentId);
                    const isSubmitted = mk.status === 'submitted';

                    return (
                      <tr key={mk.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold text-slate-900">
                          {student?.fullName || 'Noma\'lum'}
                        </td>
                        <td className="border border-slate-300 p-2 text-rose-700 font-mono font-semibold">
                          {mk.missedDate} (2 soat)
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-800">
                          {mk.missedTopic}
                        </td>
                        <td className="border border-slate-300 p-2 font-mono font-semibold text-emerald-800">
                          {mk.submittedDate || '— (Hali topshirmagan)'}
                        </td>
                        <td className="border border-slate-300 p-2 capitalize text-slate-700">
                          {mk.submissionType || '—'}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                          {mk.score !== undefined ? `${mk.score} ball` : '—'}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {isSubmitted ? (
                            <span className="text-emerald-700">Yopildi</span>
                          ) : (
                            <span className="text-rose-700">Qarzdor</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Attendance Register Matrix */}
        {reportType === 'attendance' && (
          <div className="space-y-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-8">№</th>
                  <th className="border border-slate-300 p-2">Talaba F.I.Sh</th>
                  {groupSessions.map((s, i) => (
                    <th key={s.id} className="border border-slate-300 p-1 text-center font-mono text-[9px] min-w-[35px]" title={s.topicTitle}>
                      {s.date.slice(5)}
                      <div className="text-[8px] font-normal lowercase">{s.lessonType[0]}</div>
                    </th>
                  ))}
                  <th className="border border-slate-300 p-2 text-center text-rose-700">Jami NB</th>
                  <th className="border border-slate-300 p-2 text-center text-amber-700">Kech (min)</th>
                </tr>
              </thead>
              <tbody>
                {groupStudents.map((st, idx) => {
                  let nbHours = 0;
                  let lateMins = 0;

                  return (
                    <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">{st.fullName}</td>
                      {groupSessions.map((s) => {
                        const att = s.attendance[st.id]?.status;
                        const late = s.attendance[st.id]?.lateMinutes;
                        if (att === 'absent') nbHours += 2;
                        if (att === 'late' && late) lateMins += late;

                        return (
                          <td key={s.id} className="border border-slate-300 p-1 text-center font-bold">
                            {att === 'present' && <span className="text-emerald-700">+</span>}
                            {att === 'absent' && <span className="text-rose-700">NB</span>}
                            {att === 'late' && <span className="text-amber-600 font-mono text-[10px]">{late}m</span>}
                            {att === 'no_uniform' && <span className="text-orange-600">F</span>}
                            {att === 'excused_absent' && <span className="text-blue-600">S</span>}
                            {!att && <span className="text-slate-300">·</span>}
                          </td>
                        );
                      })}
                      <td className="border border-slate-300 p-2 text-center font-bold text-rose-700">
                        {nbHours > 0 ? `${nbHours}s` : '0'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-amber-700">
                        {lateMins > 0 ? `${lateMins}m` : '0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Independent Study Report */}
        {reportType === 'independent' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-8">№</th>
                  <th className="border border-slate-300 p-2">Talaba F.I.Sh</th>
                  <th className="border border-slate-300 p-2">Biriktirilgan mustaqil ta'lim mavzusi</th>
                  <th className="border border-slate-300 p-2 text-center">Dedlayn</th>
                  <th className="border border-slate-300 p-2 text-center">Topshirgan sana</th>
                  <th className="border border-slate-300 p-2 text-center">Ball / Baho</th>
                  <th className="border border-slate-300 p-2 text-center">Holati</th>
                </tr>
              </thead>
              <tbody>
                {groupStudents.map((st, idx) => {
                  const asg = assignments.find((a) => a.studentId === st.id);
                  const topic = asg ? independentTopics.find((t) => t.id === asg.topicId) : null;

                  return (
                    <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold text-slate-900">{st.fullName}</td>
                      <td className="border border-slate-300 p-2 text-slate-800">
                        {topic?.title || 'Biriktirilmagan'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-slate-600">
                        {asg?.deadline || '—'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-emerald-800 font-semibold">
                        {asg?.submissionDate || '—'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                        {asg?.score !== undefined ? `${asg.score} ball` : '—'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-semibold text-slate-700">
                        {asg?.status === 'completed'
                          ? 'Qabul qilindi'
                          : asg?.status === 'in_review'
                          ? 'Tekshiruvda'
                          : asg?.status === 'revision_needed'
                          ? 'Qayta ishlashda'
                          : 'Kutilmoqda'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Academic Signature Section */}
        <div className="pt-10 flex justify-between items-end text-xs text-slate-800">
          <div>
            <div>Kafedra mudiri: _______________________ (F.I.Sh)</div>
            <div className="text-[10px] text-slate-500 mt-0.5">imzo va muhr</div>
          </div>
          <div className="text-right">
            <div>Dars beruvchi o'qituvchi: <strong className="font-serif">Mamazulunov Nurmuhammad</strong></div>
            <div className="mt-2">Imzo: _______________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};
