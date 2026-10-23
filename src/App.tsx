import { useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { VioraProvider, VioraContext, useViora } from './context/VioraContext';
import { TopBanner } from './components/TopBanner';
import { SideNavigation } from './components/SideNavigation';
import { BottomNavigation } from './components/BottomNavigation';
import { QuickAddModal } from './components/QuickAddModal';
import { QuickTaskModal } from './components/QuickTaskModal';
import { VoiceTaskModal } from './components/VoiceTaskModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { TeamsScreen } from './screens/TeamsScreen';
import { TeamDetailScreen } from './screens/TeamDetailScreen';
import { ListDetailScreen } from './screens/ListDetailScreen';
import { DailyBriefScreen } from './screens/DailyBriefScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { VioraPassScreen } from './screens/VioraPassScreen';
import { ScannerCameraOverlay } from './screens/ScannerCameraOverlay';
import { SearchScreen } from './screens/SearchScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ArchivesScreen } from './screens/ArchivesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CompletedTasksScreen } from './screens/CompletedTasksScreen';

// Auth screens
import { WelcomeScreen } from './screens/auth/WelcomeScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { OtpScreen } from './screens/auth/OtpScreen';
import { ProfileSetupScreen } from './screens/auth/ProfileSetupScreen';
import { DeadlineSetupScreen } from './screens/auth/DeadlineSetupScreen';

import { PushToastBanner } from './components/PushToastBanner';
import { OfflineIndicator } from './components/OfflineIndicator';

function MainAppContent() {
  const {
    currentRoute,
    activeDetailTaskId,
    setActiveDetailTaskId,
    isLoggedIn,
    setShowQuickAdd,
    showQuickTaskModal,
    setShowQuickTaskModal,
    setIsSidebarCollapsed,
    navigate,
    pushToasts,
    removePushToast,
  } = useViora();

  // Global Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setShowQuickTaskModal(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowQuickAdd(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowQuickAdd, setShowQuickTaskModal, setIsSidebarCollapsed, navigate]);

  // Enforce mandatory authentication wall
  if (!isLoggedIn) {
    let AuthScreenComponent = <LoginScreen />;
    if (currentRoute === 'welcome') AuthScreenComponent = <WelcomeScreen />;
    else if (currentRoute === 'forgot_password') AuthScreenComponent = <ForgotPasswordScreen />;
    else if (currentRoute === 'otp') AuthScreenComponent = <OtpScreen />;
    else if (currentRoute === 'profile_setup') AuthScreenComponent = <ProfileSetupScreen />;
    else if (currentRoute === 'deadline_setup') AuthScreenComponent = <DeadlineSetupScreen />;

    return (
      <div className="w-full min-h-screen bg-[#F5F6F8] flex text-zinc-900 overflow-x-hidden">
        <TopBanner />
        <ApiInspectorModal />
        <div className="flex-1 w-full">
          {AuthScreenComponent}
        </div>
      </div>
    );
  }

  // Full-screen overlays without standard navigation chrome
  if (currentRoute === 'welcome') return <WelcomeScreen />;
  if (currentRoute === 'login' || currentRoute === 'register') return <LoginScreen />;
  if (currentRoute === 'forgot_password') return <ForgotPasswordScreen />;
  if (currentRoute === 'otp') return <OtpScreen />;
  if (currentRoute === 'profile_setup') return <ProfileSetupScreen />;
  if (currentRoute === 'deadline_setup') return <DeadlineSetupScreen />;
  if (currentRoute === 'scanner_camera') return <ScannerCameraOverlay />;

  const renderActiveScreen = () => {
    switch (currentRoute) {
      case 'home':
        return <HomeScreen />;
      case 'teams':
        return <TeamsScreen />;
      case 'team_detail':
        return <TeamDetailScreen />;
      case 'list_detail':
        return <ListDetailScreen />;
      case 'daily_brief':
        return <DailyBriefScreen />;
      case 'user_profile':
        return <UserProfileScreen />;
      case 'edit_profile':
        return <EditProfileScreen />;
      case 'search':
        return <SearchScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'archives':
        return <ArchivesScreen />;
      case 'completed_tasks':
        return <CompletedTasksScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="w-full h-screen bg-viora-bg flex text-white overflow-hidden">
      {/* Top Banner for feedback */}
      <TopBanner />

      {/* Desktop Side Navigation */}
      <SideNavigation />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 h-screen bg-viora-bg overflow-x-hidden ${
          currentRoute === 'home' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`w-full h-full ${
              currentRoute === 'home' ? 'flex flex-col min-h-0 overflow-hidden' : ''
            }`}
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* M3 Mobile Bottom Navigation Bar (Active only on Compact < 600dp) */}
      <BottomNavigation />

      {/* Overlays & Modals */}
      <AnimatePresence>
        {activeDetailTaskId && (
          <TaskDetailScreen
            key={activeDetailTaskId}
            taskId={activeDetailTaskId}
            onClose={() => setActiveDetailTaskId(null)}
          />
        )}
      </AnimatePresence>

      <VioraPassScreen />
      <QuickAddModal />
      <QuickTaskModal
        isOpen={showQuickTaskModal}
        onClose={() => setShowQuickTaskModal(false)}
      />
      <VoiceTaskModal />
      <ApiInspectorModal />
      <PushToastBanner toasts={pushToasts} onDismiss={removePushToast} />
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  const existingContext = useContext(VioraContext);
  if (existingContext) {
    return <MainAppContent />;
  }
  return (
    <VioraProvider>
      <MainAppContent />
    </VioraProvider>
  );
}
