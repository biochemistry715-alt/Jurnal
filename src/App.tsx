/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ScheduleView } from './components/ScheduleView';
import { AttendanceView } from './components/AttendanceView';
import { MakeupJournalView } from './components/MakeupJournalView';
import { IndependentStudyView } from './components/IndependentStudyView';
import { CalendarPlanView } from './components/CalendarPlanView';
import { StudentsView } from './components/StudentsView';
import { ReportView } from './components/ReportView';
import { StudentPortalView } from './components/StudentPortalView';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'schedule' && <ScheduleView />}
      {activeTab === 'attendance' && (
        <AttendanceView onOpenMakeupModal={() => setActiveTab('makeups')} />
      )}
      {activeTab === 'makeups' && <MakeupJournalView />}
      {activeTab === 'independent' && <IndependentStudyView />}
      {activeTab === 'curriculum' && <CalendarPlanView />}
      {activeTab === 'students' && <StudentsView />}
      {activeTab === 'reports' && <ReportView />}
      {activeTab === 'student_portal' && <StudentPortalView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-200">Ustoz Jurnali</strong> — O'qituvchi:{' '}
              <span className="text-teal-400 font-semibold">Mamazulunov Nurmuhammad Xusanboy o'g'li</span> (Biokimyo kafedrasi)
            </div>
            <div className="text-slate-500">
              Davomat, Kechikishlar (minut), NB qarzdorlik va Mustaqil ta'lim boshqaruv platformasi
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
