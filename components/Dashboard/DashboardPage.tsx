
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Role } from '../../types';
import { CourseList } from './CourseList';
import { APP_ROUTES, KEYBOARD_SHORTCUTS } from '../../constants';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface ModuleCardProps {
  title: string;
  description: string;
  linkTo: string;
  iconClass: string;
  shortcutKey?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, linkTo, iconClass, shortcutKey }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-primary-light/20 text-primary">
      <i className={`${iconClass} text-2xl`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm mb-6 leading-relaxed">{description}</p>
    <Link to={linkTo} className="block w-full">
      <AccessibleButton 
        variant="secondary" 
        fullWidth
        className="rounded-xl"
        ariaLabel={`Acceder al módulo ${title}`}
        title={shortcutKey ? `${title} (Alt + ${shortcutKey.toUpperCase()})` : title}
      >
        Acceder al Módulo
        {shortcutKey && <span className="ml-1 text-xs opacity-75">(Alt+{shortcutKey.toUpperCase()})</span>}
      </AccessibleButton>
    </Link>
  </div>
);

export const DashboardPage: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.currentUser) {
    return <p>Cargando datos del usuario...</p>;
  }

  const { currentUser } = auth;

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  useEffect(() => {
    const fetchModulesWithExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        const moduleIds = new Set<string>();
        querySnapshot.forEach((doc) => {
          moduleIds.add(doc.data().moduleId);
        });

        const allCourses = [
          { id: 'auditory-attention', title: "Atención Auditiva", status: "En curso", progress: 65, thumbnailUrl: "https://picsum.photos/seed/attention/100/100", linkTo: APP_ROUTES.SCIENCE },
          { id: 'auditory-memory', title: "Memoria Auditiva", status: "No completó criterios", progress: 30, thumbnailUrl: "https://picsum.photos/seed/memory/100/100", linkTo: APP_ROUTES.HISTORY },
          { id: 'auditory-survey', title: "Discriminación Sonora", status: "Completado", progress: 100, thumbnailUrl: "https://picsum.photos/seed/survey/100/100", linkTo: APP_ROUTES.MATH },
        ];

        setCourses(allCourses);
        setLoadingCourses(false);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchModulesWithExercises();
  }, []);

  const commonModules = [
     { title: "Foro de Consultas", description: "Comparte tus dudas y ayuda a otros compañeros.", linkTo: APP_ROUTES.FORUM, iconClass: "fas fa-comments", shortcutKey: KEYBOARD_SHORTCUTS.FORUM.key },
     { title: "Mi Progreso", description: "Visualiza tu avance y desempeño en los módulos.", linkTo: APP_ROUTES.MY_PROGRESS, iconClass: "fas fa-chart-line", shortcutKey: KEYBOARD_SHORTCUTS.MY_PROGRESS.key },
     { title: "Evaluación Personal", description: "Reflexiona sobre tu proceso de aprendizaje y establece metas.", linkTo: APP_ROUTES.PERSONAL_EVALUATION, iconClass: "fas fa-tasks", shortcutKey: KEYBOARD_SHORTCUTS.PERSONAL_EVALUATION.key },
     { title: "Entrenamiento Auditivo", description: "Mejora tus habilidades cognitivas mediante ejercicios auditivos.", linkTo: '/audio-training', iconClass: "fas fa-headphones", shortcutKey: "U" },
  ];
  
  const adminModules = [
      { title: "Panel de Administración", description: "Gestionar usuarios y consultar informes.", linkTo: APP_ROUTES.ADMIN_DASHBOARD, iconClass: "fas fa-user-shield", shortcutKey: "A" /* placeholder */ },
  ];

  let modulesToShow = [...commonModules];
  if (currentUser.role === Role.Admin) {
     modulesToShow = [...modulesToShow, ...adminModules];
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 px-4">
      <header className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            ¡Hola, {currentUser.name || currentUser.email.split('@')[0]}!
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl leading-relaxed">
            Bienvenido a tu plataforma de aprendizaje. Tienes el rol de <span className="text-primary font-bold uppercase tracking-wider text-sm bg-primary/10 px-3 py-1 rounded-full">{currentUser.role}</span>.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
      </header>

      <section aria-labelledby="courses-title">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 id="courses-title" className="text-3xl font-bold text-slate-800 mb-2">Mis Cursos y Herramientas</h2>
            <p className="text-slate-500">Selecciona un curso o herramienta para continuar.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingCourses ? (
            <div className="p-12 text-center text-slate-500 italic">Cargando...</div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <img src={course.thumbnailUrl} alt={course.title} className="w-16 h-16 mb-4 rounded-xl object-cover" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">Progreso: {course.progress}% - {course.status}</p>
                <Link to={course.id === 'auditory-attention' ? APP_ROUTES.SCIENCE : course.id === 'auditory-memory' ? APP_ROUTES.HISTORY : course.id === 'auditory-survey' ? APP_ROUTES.MATH : APP_ROUTES.TECHNOLOGY} className="block w-full">
                  <AccessibleButton variant="secondary" fullWidth className="rounded-xl" ariaLabel={`Acceder al curso ${course.title}`}>Acceder</AccessibleButton>
                </Link>
              </div>
            ))
          )}
          {modulesToShow.map(module => (
            <ModuleCard key={module.linkTo} {...module} />
          ))}
        </div>
      </section>
    </div>
  );
};
