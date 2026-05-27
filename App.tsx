
import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { AuditoryAttentionModule } from './components/Modules/AuditoryAttentionModule';
import { AuditoryMemoryModule } from './components/Modules/AuditoryMemoryModule';
import { AuditorySurveyModule } from './components/Modules/AuditorySurveyModule';
import { TechnologyModule } from './components/Modules/TechnologyModule';
import { ModuleContainer } from './components/Modules/ModuleContainer';
import { MyProgressPage } from './components/Progress/MyProgressPage';
import { PersonalEvaluationPage } from './components/Evaluation/PersonalEvaluationPage';
import { AdminDashboardPage } from './components/Admin/AdminDashboardPage';
import { CourseInternalView } from './components/Courses/CourseInternalView';
import { AIAssistant } from './components/Shared/AIAssistant';
import { HelpPage } from './components/Help/HelpPage';
import { ForumPage } from './components/Forum/ForumPage';
import { ScreenReaderProvider } from './components/Shared/ScreenReaderProvider';
import { SmartAccessibilityButton } from './components/Shared/SmartAccessibilityButton';
import { OnboardingModal } from './components/Shared/OnboardingModal';
import { DiagnosticModal } from './components/Shared/DiagnosticModal';
import { Navbar } from './components/Layout/Navbar';
import { ToastContainer, toast } from './components/Shared/Toast';
import { RouteAnnouncer } from './components/Shared/RouteAnnouncer';
import { User, Role, AuthContextType } from './types';
import { APP_ROUTES, KEYBOARD_SHORTCUTS, APP_NAME } from './constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AuthContext = createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            
            // Show onboarding
            setShowOnboarding(true);
            
            // Apply accessibility settings
            if (userData.accessibilityProfile) {
              const { highContrastMode, fontSize } = userData.accessibilityProfile;
              document.body.className = highContrastMode ? 'high-contrast' : '';
              document.body.setAttribute('data-font-size', fontSize);
            }
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setCurrentUser(null);
        // Clear accessibility settings on logout
        document.body.className = '';
        document.body.removeAttribute('data-font-size');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    setShowDiagnostic(true);
  };

  const login = useCallback(async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setCurrentUser(userData);
        toast.success(`Bienvenido, ${userData.name}!`);
        return userData;
      } else {
        // Handle case where user is in Auth but not in Firestore (e.g. failed previous registration)
        // If it's Wilson or Wilmar, we can auto-create the profile as Admin
        const isSpecialAdmin = email === "wilson123@gmail.com" || email === "wilmarluna01@gmail.com";
        if (isSpecialAdmin) {
          const newUser: User = {
            id: userCredential.user.uid,
            email: email,
            name: "Administrador Wilson",
            role: Role.Admin,
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
          setCurrentUser(newUser);
          toast.success(`Perfil de administrador restaurado. ¡Bienvenido!`);
          return newUser;
        }
        throw new Error("Perfil de usuario no encontrado. Por favor, intenta registrarte de nuevo.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setCurrentUser(userData);
        toast.success(`Bienvenido, ${userData.name}!`);
        return userData;
      } else {
        // Create profile for first time Google login
        const newUser: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || "",
          name: userCredential.user.displayName || "Usuario",
          role: Role.Student,
        };
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
          setCurrentUser(newUser);
          toast.success(`Registro exitoso. Bienvenido, ${newUser.name}!`);
          return newUser;
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.log('Login cancelled by user');
        return;
      }
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, pass: string, name: string, role: Role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: User = {
        id: userCredential.user.uid,
        email,
        name,
        role,
      };
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists()) throw new Error("Error guardando el perfil de usuario, por favor intenta de nuevo.");
        
        setCurrentUser(newUser);
        toast.success(`Registro exitoso. Bienvenido, ${name}!`);
        return newUser;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${userCredential.user.uid}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      toast.info("Has cerrado sesión.");
    } catch (error) {
      toast.error("Error al cerrar sesión.");
    }
  }, []);

  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentUser) { // Only active if logged in
        Object.values(KEYBOARD_SHORTCUTS).forEach(shortcut => {
          if (shortcut && event.altKey && event.key === shortcut.key) {
            event.preventDefault();
            if (shortcut.name === KEYBOARD_SHORTCUTS.LOGOUT.name) {
              logout();
            } else {
              console.log(`Shortcut activated for: ${shortcut.name} - Path: ${shortcut.path}`);
              toast.info(`Navegando a ${shortcut.name}`);
              window.location.hash = shortcut.path;
            }
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser, logout]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-background text-textDark"><p className="text-xl">Cargando aplicación...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, loginWithGoogle, register, logout, loadingAuth: loading }}>
      <ScreenReaderProvider>
        <HashRouter>
          <RouteAnnouncer />
          <div className="flex flex-col min-h-screen">
            {currentUser && <Navbar />}
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8" id="main-content" role="main">
              <Routes>
                <Route path={APP_ROUTES.LOGIN} element={!currentUser ? <LoginPage /> : <Navigate to={APP_ROUTES.DASHBOARD} />} />
                <Route path={APP_ROUTES.REGISTER} element={!currentUser ? <RegisterPage /> : <Navigate to={APP_ROUTES.DASHBOARD} />} />
                <Route path={APP_ROUTES.FORGOT_PASSWORD} element={!currentUser ? <ForgotPasswordPage /> : <Navigate to={APP_ROUTES.DASHBOARD} />} />
                
                <Route element={<ProtectedRoute roles={[Role.Student, Role.Admin, Role.Tutor]} />}>
                  <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={APP_ROUTES.SCIENCE} element={<AuditoryAttentionModule />} />
                  <Route path={APP_ROUTES.HISTORY} element={<AuditoryMemoryModule />} />
                  <Route path={APP_ROUTES.MATH} element={<AuditorySurveyModule />} />
                  <Route path={APP_ROUTES.TECHNOLOGY} element={<TechnologyModule />} />
                  <Route
                    path={APP_ROUTES.AUDIO_TRAINING}
                    element={
                      <ModuleContainer
                        moduleId={"audio-training" as any}
                        moduleTitle="Entrenamiento Auditivo"
                      />
                    }
                  />
                  <Route path={APP_ROUTES.COURSE_INTERNAL} element={<CourseInternalView />} />
                  <Route path={APP_ROUTES.MY_PROGRESS} element={<MyProgressPage />} />
                  <Route path={APP_ROUTES.PERSONAL_EVALUATION} element={<PersonalEvaluationPage />} />
                  <Route path={APP_ROUTES.HELP} element={<HelpPage />} />
                  <Route path={APP_ROUTES.FORUM} element={<ForumPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={[Role.Admin]} />}>
                  <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to={!currentUser ? APP_ROUTES.LOGIN : APP_ROUTES.DASHBOARD} />} />
              </Routes>
            </main>
            {currentUser && <SmartAccessibilityButton />}
            {currentUser && <AIAssistant />}
            {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
            {showDiagnostic && currentUser && (
              <DiagnosticModal 
                userId={currentUser.id} 
                onClose={() => setShowDiagnostic(false)} 
              />
            )}
            <ToastContainer />
            <footer className="bg-primary text-textLight p-4 text-center">
              <p>&copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
              {currentUser && <Link to={APP_ROUTES.HELP} className="underline hover:text-secondary">Página de Ayuda (Alt + H)</Link>}
            </footer>
            {/* Focus trap looper */}
            <div 
              onFocus={() => {
                const brandButton = document.querySelector('nav button[aria-haspopup="true"]');
                if (brandButton instanceof HTMLElement) brandButton.focus();
              }} 
              tabIndex={0} 
              aria-hidden="true"
            />
          </div>
        </HashRouter>
      </ScreenReaderProvider>
    </AuthContext.Provider>
  );
};

interface ProtectedRouteProps {
  roles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!auth || auth.loadingAuth) return;

    if (!auth.currentUser) {
      setTimeout(() => toast.warning("Debes iniciar sesión para acceder a esta página."), 0);
    } else if (roles && roles.length > 0 && !roles.includes(auth.currentUser.role)) {
      setTimeout(() => toast.error("No tienes permiso para acceder a esta página."), 0);
    }
  }, [auth, roles]);

  if (!auth || auth.loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><p>Verificando autenticación...</p></div>;
  }

  if (!auth.currentUser) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(auth.currentUser.role)) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return <React.Fragment><Outlet /></React.Fragment>;
};

export default App;
