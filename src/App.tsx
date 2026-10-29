import React, { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthScreen } from './components/Auth/AuthScreen';
import { FullScreenAppLoader } from './components/common/LoadingSpinners';
import { ThemeController } from './components/ThemeController';

// Lazily load the authenticated application so the unauthenticated view loads instantly
const AuthenticatedApp = lazy(() =>
  import('./components/AuthenticatedApp').then((m) => ({
    default: m.AuthenticatedApp,
  })),
);

function MainApp() {
  const { user, loading: authLoading, initAuth } = useAuthStore();

  useEffect(() => {
    const unsubAuth = initAuth();
    return () => unsubAuth();
  }, [initAuth]);

  if (authLoading) {
    return <FullScreenAppLoader message="Iniciando la aplicación..." />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Suspense fallback={<FullScreenAppLoader message="Cargando panel de control..." />}>
      <AuthenticatedApp />
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeController>
      <MainApp />
    </ThemeController>
  );
}
