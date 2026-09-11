import React, { useState } from 'react';
import { GradeProvider, useGrade } from './context/GradeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { StudyView } from './components/StudyView';
import { TasksView } from './components/TasksView';
import { ExamsView } from './components/ExamsView';
import { FuturePlannerView } from './components/FuturePlannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { ComparisonView } from './components/ComparisonView';
import { SubjectModal } from './components/SubjectModal';
import { SettingsModal } from './components/SettingsModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ThemeModal } from './components/ThemeModal';
import { WelcomeView } from './components/WelcomeView';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { Subject } from './types';

function MainAppContent() {
  const { isLoggedIn } = useGrade();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<Subject | null>(null);

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { isThemeModalOpen, openThemeModal, closeThemeModal } = useTheme();

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setIsSubjectModalOpen(true);
  };

  // If user is not logged in, show cute WelcomeView
  if (!isLoggedIn) {
    return (
      <>
        <WelcomeView
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top and Mobile Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'subjects') {
            setSelectedSubjectForDetail(null);
          }
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        onOpenThemeModal={openThemeModal}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-28 md:pb-12 box-border">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddScore={() => setActiveTab('subjects')}
            onOpenAddTask={() => setActiveTab('tasks')}
            onOpenAddExam={() => setActiveTab('exams')}
            onOpenAddSubject={handleOpenAddSubject}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
            onSelectSubjectDetail={(sub) => {
              setSelectedSubjectForDetail(sub);
              setActiveTab('subjects');
            }}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            onOpenAddSubject={handleOpenAddSubject}
            onOpenEditSubject={handleOpenEditSubject}
            selectedSubjectId={selectedSubjectForDetail?.id || null}
            onSelectSubject={setSelectedSubjectForDetail}
            onNavigateToStudy={() => setActiveTab('study')}
          />
        )}

        {activeTab === 'study' && <StudyView />}

        {activeTab === 'tasks' && <TasksView />}

        {activeTab === 'exams' && <ExamsView />}

        {activeTab === 'future' && <FuturePlannerView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'comparison' && (
          <ComparisonView
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🌸 MyGrade • ผู้ช่วยวางแผนคะแนนและอนาคตของนักเรียนมัธยม</span>
          <span>คำนวณตามจริง 100 คะแนน • บันทึก Portfolio • ติดตามงาน & ตารางสอบ</span>
        </div>
      </footer>

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editingSubject={editingSubject}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={closeThemeModal}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GradeProvider>
        <MainAppContent />
      </GradeProvider>
    </ThemeProvider>
  );
}
