import React, { useState } from 'react';
import { GradeProvider, useGrade } from './context/GradeContext';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { TasksView } from './components/TasksView';
import { ExamsView } from './components/ExamsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ComparisonView } from './components/ComparisonView';
import { SubjectModal } from './components/SubjectModal';
import { SettingsModal } from './components/SettingsModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Subject } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setIsSubjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top and Mobile Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddScore={() => setActiveTab('subjects')}
            onOpenAddTask={() => setActiveTab('tasks')}
            onOpenAddExam={() => setActiveTab('exams')}
            onOpenAddSubject={handleOpenAddSubject}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            onOpenAddSubject={handleOpenAddSubject}
            onOpenEditSubject={handleOpenEditSubject}
          />
        )}

        {activeTab === 'tasks' && <TasksView />}

        {activeTab === 'exams' && <ExamsView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'comparison' && (
          <ComparisonView
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GradeMate • ระบบจัดการคะแนนและคำนวณเกรด 2 ภาคเรียน (เทอม 1 & เทอม 2)</span>
          <span>เก็บคะแนน 4 ช่วง • ติดตามงาน • ตารางสอบ & นับถอยหลัง</span>
        </div>
      </footer>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editingSubject={editingSubject}
      />

      {/* Edit Profile & Student Name Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <GradeProvider>
      <MainApp />
    </GradeProvider>
  );
}
