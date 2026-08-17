import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useDataStore } from "./store/dataStore";

import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
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
  const { loading: dataLoading, subscribeToData } = useDataStore();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" },
      );
    }
  }, [activeTab]);

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
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Navigation Sidebar (oculto en la pestaña Perfil) */}
          {activeTab !== "profile" && (
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenAddClientModal={() => setIsClientModalOpen(true)}
            />
          )}

          {/* Tab Views */}
          <div ref={mainContentRef} className="flex-1 min-w-0">
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
              />
            )}

            {activeTab === "clients_inactive" && (
              <ClientList
                statusFilter="inactive"
                globalSearchQuery={searchQuery}
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
      <footer className="border-t border-slate-200 dark:border-[#1F1F23] mt-auto py-8 bg-white/50 dark:bg-[#0F0F12] text-center text-xs text-slate-500 dark:text-[#94949E]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">
            StreamManager Pro &copy; {new Date().getFullYear()} — Plataforma de
            Gestión de Cuentas Streaming
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Realtime Firebase Database • GSAP Animations • Tailwind CSS
          </p>
        </div>
      </footer>

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
