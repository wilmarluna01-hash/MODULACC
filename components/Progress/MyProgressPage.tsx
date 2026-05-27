import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { ProgressData, ChartDataPoint, Role } from '../../types';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { toast } from '../Shared/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const MODULE_NAMES: Record<string, string> = {
  'auditory-attention': 'Atención Auditiva',
  'auditory-memory': 'Memoria Auditiva',
  'auditory-survey': 'Discriminación Sonora',
  'technology': 'Tecnología e Informática'
};

const getPerformanceLabel = (score: number, completed: number, total: number): { label: string, color: string } => {
  if (completed === 0) return { label: 'No iniciado', color: 'bg-gray-200 text-gray-700' };
  if (score >= 80) return { label: 'Avanzado', color: 'bg-green-100 text-green-800' };
  if (score >= 60) return { label: 'En proceso', color: 'bg-blue-100 text-blue-800' };
  return { label: 'Necesita refuerzo', color: 'bg-red-100 text-red-800' };
};

const fetchUserProgress = async (userId: string): Promise<ProgressData[]> => {
  console.log(`Fetching real progress for user ${userId}`);
  
  // 1. Fetch all exercises to know total per module
  const exercisesSnapshot = await getDocs(collection(db, 'exercises'));
  const totalExercisesPerModule: Record<string, number> = {
    'auditory-attention': 0,
    'auditory-memory': 0,
    'auditory-survey': 0,
    'technology': 0
  };
  exercisesSnapshot.forEach(doc => {
    const modId = doc.data().moduleId;
    if (totalExercisesPerModule.hasOwnProperty(modId)) {
      totalExercisesPerModule[modId] += 1;
    }
  });

  // 2. Fetch user's progress records
  const q = query(collection(db, 'progress'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  // Initialize with all 4 modules
  const aggregated: Record<string, ProgressData> = {
    'auditory-attention': { moduleId: 'auditory-attention', score: 0, completedExercises: 0, totalExercises: totalExercisesPerModule['auditory-attention'], lastAccessed: new Date(0) },
    'auditory-memory': { moduleId: 'auditory-memory', score: 0, completedExercises: 0, totalExercises: totalExercisesPerModule['auditory-memory'], lastAccessed: new Date(0) },
    'auditory-survey': { moduleId: 'auditory-survey', score: 0, completedExercises: 0, totalExercises: totalExercisesPerModule['auditory-survey'], lastAccessed: new Date(0) },
    'technology': { moduleId: 'technology', score: 0, completedExercises: 0, totalExercises: totalExercisesPerModule['technology'], lastAccessed: new Date(0) }
  };
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const moduleId = data.moduleId;
    
    if (aggregated[moduleId]) {
      if (data.isCorrect) {
        aggregated[moduleId].completedExercises += 1;
      }
      
      const timestamp = data.timestamp.toDate();
      if (timestamp > aggregated[moduleId].lastAccessed) {
        aggregated[moduleId].lastAccessed = timestamp;
      }
    }
  });

  // Calculate score as percentage of correct answers
  Object.values(aggregated).forEach(p => {
    if (p.totalExercises > 0) {
      p.score = Math.round((p.completedExercises / p.totalExercises) * 100);
    }
  });
  
  return Object.values(aggregated);
};

// Suggestions logic
const getModuleSuggestions = (progress: ProgressData[]): string[] => {
  const suggestions: string[] = [];
  const modules = [
    { id: 'auditory-attention', name: 'Atención Auditiva' },
    { id: 'auditory-memory', name: 'Memoria Auditiva' },
    { id: 'auditory-survey', name: 'Discriminación Sonora' },
    { id: 'technology', name: 'Tecnología e Informática' }
  ];
  
  modules.forEach(mod => {
    const modProgress = progress.find(p => p.moduleId === mod.id);
    if (!modProgress) {
      suggestions.push(`Comenzar con ${mod.name}.`);
    } else if (modProgress.score < 70 && modProgress.completedExercises < modProgress.totalExercises) {
      suggestions.push(`Continuar practicando ${mod.name} para mejorar tu puntaje.`);
    }
  });

  if (suggestions.length === 0 && progress.length > 0 && progress.every(p => p.score >= 80)) {
    suggestions.push("¡Excelente trabajo en todos los módulos! Puedes repasar cualquiera o esperar nuevo contenido.");
  } else if (suggestions.length === 0) {
     suggestions.push("Explora los módulos disponibles para comenzar tu aprendizaje.");
  }
  
  return suggestions.slice(0,2); // Max 2 suggestions
};

const barColors = ["#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"];

export const MyProgressPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    if (auth?.currentUser) {
      const loadProgress = async () => {
        setLoading(true);
        try {
          const data = await fetchUserProgress(auth.currentUser!.id);
          setProgressData(data);
          const formattedChartData = data.map(p => ({ name: MODULE_NAMES[p.moduleId] || p.moduleId, value: p.score }));
          setChartData(formattedChartData);
          setSuggestions(getModuleSuggestions(data));
        } catch (error) {
          toast.error("Error al cargar el progreso.");
          console.error("Error fetching progress:", error);
        } finally {
          setLoading(false);
        }
      };
      loadProgress();
    } else {
      setLoading(false); // No user, no progress to load
    }
  }, [auth]);

  const handleExportPDF = () => {
    toast.info("Función de exportar a PDF no implementada en esta demostración.");
    console.log("Simulating PDF export of progress data:", progressData);
  };

  const getProgressSummary = () => {
    if (progressData.length === 0) return "";
    const highest = [...progressData].sort((a, b) => b.score - a.score)[0];
    const average = Math.round(progressData.reduce((acc, curr) => acc + curr.score, 0) / progressData.length);
    return `Tu puntaje promedio es del ${average}%. Tu mejor desempeño es en "${MODULE_NAMES[highest.moduleId] || highest.moduleId}" con un ${highest.score}%.`;
  };

  if (loading) {
    return <LoadingSpinner text="Cargando tu progreso..." fullScreen />;
  }

  if (!auth?.currentUser) {
    return <p className="text-center text-gray-600">Debes iniciar sesión para ver tu progreso.</p>;
  }
  
  if (progressData.length === 0 && auth?.currentUser?.role === Role.Student) {
    return <p className="text-center text-gray-600">Aún no tienes progreso registrado. ¡Comienza un módulo!</p>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 rounded-lg shadow-lg">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-wide">Mi Progreso</h1>
        <p className="text-gray-700">Aquí puedes ver tu avance en los diferentes módulos de aprendizaje.</p>
        {progressData.length > 0 && (
          <p className="mt-2 font-medium text-primary-dark" aria-live="polite">
            {getProgressSummary()}
          </p>
        )}
      </header>

      {chartData.length > 0 && (
        <section aria-labelledby="progress-chart-title" className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 id="progress-chart-title" className="text-xl font-semibold text-gray-800">
              Resumen de Calificaciones por Módulo
            </h2>
            <div className="flex items-center gap-2">
              <span id="view-toggle-label" className="text-sm font-medium text-gray-600">Ver como:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group" aria-labelledby="view-toggle-label">
                <button
                  type="button"
                  onClick={() => setShowChart(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    showChart 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  } focus:z-10 focus:ring-2 focus:ring-primary`}
                  aria-pressed={showChart}
                >
                  <i className="fas fa-chart-bar mr-2" aria-hidden="true"></i>
                  Gráfico
                </button>
                <button
                  type="button"
                  onClick={() => setShowChart(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${
                    !showChart 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  } focus:z-10 focus:ring-2 focus:ring-primary`}
                  aria-pressed={!showChart}
                >
                  <i className="fas fa-table mr-2" aria-hidden="true"></i>
                  Tabla
                </button>
              </div>
            </div>
          </div>

          {showChart ? (
            <div style={{ width: '100%', height: 350 }} role="img" aria-label="Gráfico de barras mostrando calificaciones por módulo. Usa la vista de tabla para una descripción detallada.">
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12, fill: '#4a5568'}}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{fontSize: 12, fill: '#4a5568'}}
                    label={{ 
                      value: 'Calificación (%)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { textAnchor: 'middle', fill: '#4a5568', fontWeight: 500 } 
                    }} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number, name: string) => [`${value}%`, `Módulo`]}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar 
                    dataKey="value" 
                    name="Calificación" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={barColors[index % barColors.length]}
                        tabIndex={0}
                        role="graphics-symbol"
                        aria-label={`Módulo: ${entry.name}. Calificación: ${entry.value}%.`}
                        className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            toast.info(`${entry.name}: ${entry.value}%`);
                          }
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200" aria-label="Resumen de calificaciones en formato tabla">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.map((d) => (
                    <tr key={d.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="sr-only" aria-hidden="true">
            <h3>Datos del gráfico de progreso</h3>
            <table>
              <thead><tr><th>Módulo</th><th>Calificación</th></tr></thead>
              <tbody>
                {chartData.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.value}%</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {progressData.length > 0 && (
        <section aria-labelledby="detailed-progress-title" className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 id="detailed-progress-title" className="text-xl font-semibold text-gray-800 mb-4">
            Detalles del Progreso
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label="Tabla de progreso detallado por módulo">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicios Completados</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressData.map((item) => (
                  <tr key={item.moduleId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{MODULE_NAMES[item.moduleId] || item.moduleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPerformanceLabel(item.score, item.completedExercises, item.totalExercises).color}`}>
                        {getPerformanceLabel(item.score, item.completedExercises, item.totalExercises).label}
                      </span>
                      <span className="ml-2">{item.score}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.completedExercises} / {item.totalExercises}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastAccessed.getTime() === 0 ? 'N/A' : item.lastAccessed.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section aria-labelledby="suggestions-title" className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 id="suggestions-title" className="text-xl font-semibold text-gray-800 mb-4">
            Sugerencias para Próximos Pasos
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 text-right">
        <AccessibleButton onClick={handleExportPDF} variant="primary" iconLeft={<i className="fas fa-file-pdf"></i>}>
          Exportar a PDF
        </AccessibleButton>
      </div>
    </div>
  );
};
