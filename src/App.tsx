import React, { useState } from 'react';
import { GradeProvider, useGrade } from './context/GradeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { SubjectsView } from './components/SubjectsView';
import { StudyView } from './components/StudyView';
import { TasksView } from './components/TasksView';
import { ExamsView } from './components/ExamsView';
import { FuturePlannerView } from './components/FuturePlannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { ComparisonView } from './components/ComparisonView';
import { DevelopersView } from './components/DevelopersView';
import { SubjectModal } from './components/SubjectModal';
import { SettingsModal } from './components/SettingsModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ThemeModal } from './components/ThemeModal';
import { WelcomeView } from './components/WelcomeView';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ThemeBackground } from './components/ThemeBackground';
import { AiQuickFillProvider, useAiQuickFill } from './context/AiQuickFillContext';
import { AiQuickFillModal } from './components/AiQuickFillModal';
import { Sparkles } from 'lucide-react';
import { Subject } from './types';

function MainAppContent() {
  const { isLoggedIn } = useGrade();
  const { openAiQuickFill } = useAiQuickFill();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<Subject | null>(null);
  const [calendarTargetDate, setCalendarTargetDate] = useState<string | null>(null);

  const handleNavigateToCalendar = (date?: string) => {
    if (date) {
      setCalendarTargetDate(date);
    }
    setActiveTab('calendar');
  };

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

  return (
    <ThemeBackground className="text-slate-900 selection:bg-pink-500 selection:text-white">
      {!isLoggedIn ? (
        <WelcomeView
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      ) : (
        <>
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
                onNavigate={(tab) => {
                  if (tab === 'calendar') {
                    handleNavigateToCalendar();
                  } else {
                    setActiveTab(tab);
                  }
                }}
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

            {activeTab === 'calendar' && (
              <CalendarView
                initialDate={calendarTargetDate}
                onNavigateToExams={() => setActiveTab('exams')}
                onNavigateToTasks={() => setActiveTab('tasks')}
                onNavigateToStudy={() => setActiveTab('study')}
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

            {activeTab === 'tasks' && (
              <TasksView onNavigateToCalendar={handleNavigateToCalendar} />
            )}

            {activeTab === 'exams' && (
              <ExamsView onNavigateToCalendar={handleNavigateToCalendar} />
            )}

            {activeTab === 'future' && <FuturePlannerView />}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'profile' && <ProfileView onNavigate={(tab) => setActiveTab(tab)} />}

            {activeTab === 'comparison' && (
              <ComparisonView
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
              />
            )}

            {activeTab === 'developers' && (
              <DevelopersView onNavigate={(tab) => setActiveTab(tab)} />
            )}
          </main>

          {/* Subtle Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 mb-16 md:mb-0">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>🌸 MyGrade • ผู้ช่วยวางแผนคะแนนและอนาคตของนักเรียนมัธยม</span>
              <span>คำนวณตามจริง 100 คะแนน • บันทึก Portfolio • ติดตามงาน & ตารางสอบ</span>
            </div>
          </footer>
        </>
      )}

      {/* Theme Modal - Always available at root */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={closeThemeModal}
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

      {isLoggedIn && (
        <>
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
            onNavigate={(tab) => setActiveTab(tab)}
          />
          <NotificationCenterModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          {/* Floating AI Quick Fill Button */}
          <button
            id="floating-ai-quick-fill-btn"
            onClick={() => openAiQuickFill({ scope: 'all' })}
            className="app-ai-btn fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-primary-foreground, #ffffff)',
              borderColor: 'var(--theme-primary)',
              boxShadow: '0 8px 24px 0 rgba(var(--app-primary-rgb, 219, 39, 119), 0.4)',
            }}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="font-black text-xs tracking-wide pr-0.5">✨ AI ช่วยกรอกข้อมูล</span>
          </button>

          {/* AI Quick Fill Modal */}
          <AiQuickFillModal />
        </>
      )}
    </ThemeBackground>
  );
}

export default function App() {
  return (
    <GradeProvider>
      <ThemeProvider>
        <AiQuickFillProvider>
          <MainAppContent />
        </AiQuickFillProvider>
      </ThemeProvider>
    </GradeProvider>
  );
}
