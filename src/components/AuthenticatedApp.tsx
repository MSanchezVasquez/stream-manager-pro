import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useVaultStore } from '../store/vaultStore';

import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { FloatingSidebarDrawer } from './FloatingSidebarDrawer';
import { FullScreenAppLoader, CircularSpinner } from './common/LoadingSpinners';
import { Menu } from 'lucide-react';

// Lazy-loaded components for optimal bundle splitting
const OverviewCards = lazy(() =>
  import('./Dashboard/OverviewCards').then((m) => ({
    default: m.OverviewCards,
  })),
);
const PlatformDistributionChart = lazy(() =>
  import('./Dashboard/PlatformDistributionChart').then((m) => ({
    default: m.PlatformDistributionChart,
  })),
);
const ExpirationAlerts = lazy(() =>
  import('./Dashboard/ExpirationAlerts').then((m) => ({
    default: m.ExpirationAlerts,
  })),
);
const FinancialAndActivitySummary = lazy(() =>
  import('./Dashboard/FinancialAndActivitySummary').then((m) => ({
    default: m.FinancialAndActivitySummary,
  })),
);
const ClientList = lazy(() =>
  import('./Clients/ClientList').then((m) => ({
    default: m.ClientList,
  })),
);
const SupplierList = lazy(() =>
  import('./Suppliers/SupplierList').then((m) => ({
    default: m.SupplierList,
  })),
);
const FreeProfilesList = lazy(() =>
  import('./Profiles/FreeProfilesList').then((m) => ({
    default: m.FreeProfilesList,
  })),
);
const QuickLinksView = lazy(() =>
  import('./Links/QuickLinksView').then((m) => ({
    default: m.QuickLinksView,
  })),
);
const MessageTemplatesView = lazy(() =>
  import('./Templates/MessageTemplatesView').then((m) => ({
    default: m.MessageTemplatesView,
  })),
);
const UserProfile = lazy(() =>
  import('./Profiles/UserProfile').then((m) => ({
    default: m.UserProfile,
  })),
);
const ClientModal = lazy(() =>
  import('./Clients/ClientModal').then((m) => ({
    default: m.ClientModal,
  })),
);
const AuthModal = lazy(() =>
  import('./Auth/AuthModal').then((m) => ({
    default: m.AuthModal,
  })),
);
const VaultUnlockModal = lazy(() =>
  import('./Vault/VaultUnlockModal').then((m) => ({
    default: m.VaultUnlockModal,
  })),
);
const SettingsModal = lazy(() =>
  import('./Settings/SettingsModal').then((m) => ({
    default: m.SettingsModal,
  })),
);
const SetAccountPasswordModal = lazy(() =>
  import('./Auth/SetAccountPasswordModal').then((m) => ({
    default: m.SetAccountPasswordModal,
  })),
);

function useDelayedLoading(isLoading: boolean, delay = 400): boolean {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false);
      return;
    }
    const timer = setTimeout(() => setShowLoader(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showLoader;
}

export const AuthenticatedApp: React.FC = () => {
  const { user } = useAuthStore();
  const { loading: dataLoading, subscribeToData } = useDataStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsMobileDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const unsubData = subscribeToData(user?.uid || null);
    return () => unsubData();
  }, [user?.uid, subscribeToData]);

  useEffect(() => {
    if (user?.uid) {
      useVaultStore.getState().checkVaultStatus(user.uid);
    }
  }, [user?.uid]);

  // Transición suave al cambiar de pestaña
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Cambio automático a clientes si hay búsqueda global
  useEffect(() => {
    if (!searchQuery) return;
    if (activeTab !== 'clients_active' && activeTab !== 'clients_inactive') {
      setActiveTab('clients_active');
    }
  }, [searchQuery]);

  const showDataLoader = useDelayedLoading(dataLoading);

  if (dataLoading) {
    return showDataLoader ? (
      <FullScreenAppLoader message="Cargando base de datos de cuentas y clientes..." />
    ) : null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0C] text-slate-900 dark:text-[#E4E4E7] font-sans transition-colors duration-300 overflow-x-hidden flex flex-col">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Floating Sidebar Drawer (ONLY for Tablet & Mobile, does not push content) */}
      <FloatingSidebarDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddClientModal={() => setIsClientModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col relative">
        {/* Mobile / Tablet Sidebar Toggle Button - stuck to the left, below navbar */}
        {activeTab !== 'profile' && (
          <div className="lg:hidden mb-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Abrir menú de navegación"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-space uppercase tracking-wider">
              Menú
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start flex-1 w-full min-h-[calc(100vh-22rem)]">
          {/* Static Navigation Sidebar for Laptop & Desktop */}
          {activeTab !== 'profile' && (
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenAddClientModal={() => setIsClientModalOpen(true)}
            />
          )}

          {/* Tab Views with CSS GPU-accelerated fade-in */}
          <div
            key={activeTab}
            className="flex-1 min-w-0 w-full flex flex-col animate-fade-in"
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-12 min-h-[300px]">
                  <CircularSpinner size={32} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              }
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <OverviewCards onNavigateTab={(tab) => setActiveTab(tab)} />
                  <FinancialAndActivitySummary
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onOpenAddClientModal={() => setIsClientModalOpen(true)}
                  />
                  <ExpirationAlerts />
                  <PlatformDistributionChart />
                </div>
              )}

              {activeTab === 'profile' && <UserProfile />}

              {activeTab === 'clients_active' && (
                <ClientList
                  statusFilter="active"
                  globalSearchQuery={searchQuery}
                  onSwitchTab={setActiveTab}
                />
              )}

              {activeTab === 'clients_inactive' && (
                <ClientList
                  statusFilter="inactive"
                  globalSearchQuery={searchQuery}
                  onSwitchTab={setActiveTab}
                />
              )}

              {activeTab === 'suppliers' && <SupplierList />}

              {activeTab === 'free_profiles' && <FreeProfilesList />}

              {activeTab === 'alerts' && <ExpirationAlerts />}

              {activeTab === 'templates' && <MessageTemplatesView />}

              {activeTab === 'links' && <QuickLinksView />}
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Modals with Suspense */}
      <Suspense fallback={null}>
        {isClientModalOpen && (
          <ClientModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}

        {isVaultModalOpen && (
          <VaultUnlockModal
            isOpen={isVaultModalOpen}
            onClose={() => setIsVaultModalOpen(false)}
            allowSkip={true}
          />
        )}

        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onOpenVaultModal={() => {
              setIsSettingsModalOpen(false);
              setIsVaultModalOpen(true);
            }}
            onOpenSetPasswordModal={() => {
              setIsSettingsModalOpen(false);
              setIsSetPasswordModalOpen(true);
            }}
          />
        )}

        {isSetPasswordModalOpen && (
          <SetAccountPasswordModal
            isOpen={isSetPasswordModalOpen}
            onClose={() => setIsSetPasswordModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
};
