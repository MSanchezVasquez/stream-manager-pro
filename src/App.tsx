import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useDataStore } from "./store/dataStore";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import { FloatingSidebarDrawer } from "./components/FloatingSidebarDrawer";
import { OverviewCards } from "./components/Dashboard/OverviewCards";
import { PlatformDistributionChart } from "./components/Dashboard/PlatformDistributionChart";
import { ExpirationAlerts } from "./components/Dashboard/ExpirationAlerts";
import { ClientList } from "./components/Clients/ClientList";
import { SupplierList } from "./components/Suppliers/SupplierList";
import { FreeProfilesList } from "./components/Profiles/FreeProfilesList";
import { QuickLinksView } from "./components/Links/QuickLinksView";
import { ClientModal } from "./components/Clients/ClientModal";
import { AuthModal } from "./components/Auth/AuthModal";
import { AuthScreen } from "./components/Auth/AuthScreen";
import { FullScreenAppLoader } from "./components/common/LoadingSpinners";
import { UserProfile } from "./components/Profiles/UserProfile";
import gsap from "gsap";
import { ThemeController } from "./components/ThemeController";

function MainApp() {
  const { user, loading: authLoading, initAuth } = useAuthStore();
  const { loading: dataLoading, isSyncing, subscribeToData } = useDataStore();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Estado para el sidebar flotante en tablet y celular
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 1. Inicializar Autenticación al montar la app
  useEffect(() => {
    const unsubAuth = initAuth();
    return () => unsubAuth();
  }, [initAuth]);

  // 2. Inicializar Datos cuando cambia el usuario
  useEffect(() => {
    const unsubData = subscribeToData(user?.uid || null);
    return () => unsubData();
  }, [user?.uid, subscribeToData]);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Animar transición al cambiar de pestaña
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 450);

    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" },
      );
    }

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Transición suave y cambio automático de pestaña al buscar
  useEffect(() => {
    if (!searchQuery) return;
    if (activeTab !== "clients_active" && activeTab !== "clients_inactive") {
      setActiveTab("clients_active");
    }
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (authLoading) {
    return <FullScreenAppLoader message="Iniciando la aplicación..." />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (dataLoading) {
    return (
      <FullScreenAppLoader message="Cargando base de datos de cuentas y clientes..." />
    );
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
        onToggleSidebar={() => setIsMobileDrawerOpen(true)}
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start flex-1 w-full min-h-[calc(100vh-22rem)]">
          {/* Static Navigation Sidebar for Laptop & Desktop (hidden lg:block, never pushes content) */}
          {activeTab !== "profile" && (
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenAddClientModal={() => setIsClientModalOpen(true)}
            />
          )}

          {/* Tab Views */}
          <div ref={mainContentRef} className="flex-1 min-w-0 w-full flex flex-col">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <OverviewCards onNavigateTab={(tab) => setActiveTab(tab)} />
                <ExpirationAlerts />
                <PlatformDistributionChart />
              </div>
            )}

            {activeTab === "profile" && <UserProfile />}

            {activeTab === "clients_active" && (
              <ClientList
                statusFilter="active"
                globalSearchQuery={searchQuery}
                onSwitchTab={setActiveTab}
              />
            )}

            {activeTab === "clients_inactive" && (
              <ClientList
                statusFilter="inactive"
                globalSearchQuery={searchQuery}
                onSwitchTab={setActiveTab}
              />
            )}

            {activeTab === "suppliers" && <SupplierList />}

            {activeTab === "free_profiles" && <FreeProfilesList />}

            {activeTab === "alerts" && <ExpirationAlerts />}

            {activeTab === "links" && <QuickLinksView />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Modals */}
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
    </div>
  );
}

export default function App() {
  return (
    <ThemeController>
      <MainApp />
    </ThemeController>
  );
}
