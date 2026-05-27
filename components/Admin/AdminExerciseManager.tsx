
import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { Exercise, Role } from '../../types';
import { AuthContext, handleFirestoreError, OperationType } from '../../App';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { toast } from '../Shared/Toast';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminExerciseManagerProps {
  moduleId: 'auditory-attention' | 'auditory-memory' | 'auditory-survey' | 'technology';
  moduleTitle: string;
}

export const AdminExerciseManager: React.FC<AdminExerciseManagerProps> = ({ moduleId, moduleTitle }) => {
  const authContext = useContext(AuthContext);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    title: '',
    content: '',
    instruction: '',
    possibleAnswers: [],
    correctAnswer: '',
    explanation: '',
    order: 0
  });
  const [newOption, setNewOption] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const isAdmin = authContext?.currentUser?.role === Role.Admin;

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'exercises'),
        where('moduleId', '==', moduleId),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedExercises: Exercise[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExercises.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Exercise);
      });
      setExercises(fetchedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      handleFirestoreError(error, OperationType.GET, 'exercises');
    } finally {
      setLoading(false);
    }
  };

  const importAllExercises = async () => {
    console.log("Botón de importar presionado");
    toast.info("Iniciando importación... por favor espera.");

    setLoading(true);
    console.log("Iniciando importación...");
    try {
      const allExercises = [
        // Atención Selectiva Auditiva (auditory-attention)
        { moduleId: 'auditory-attention', title: "Detecta la palabra clave", instruction: "Escucharás una serie de palabras. Presiona '¡Lo escuché!' únicamente cuando identifiques la palabra AGUA.", content: "Escucha con atención. Solo una palabra es el objetivo.", correctAnswer: "agua", order: 1, exerciseType: "audio_attention", difficulty: 1, explanation: "La atención selectiva te permite filtrar estímulos irrelevantes y concentrarte en el objetivo.", audioConfig: { stimulusText: "agua", distractorTexts: ["tierra", "fuego"], targetItem: "agua", noiseLevel: 0 } },
        { moduleId: 'auditory-attention', title: "Escucha el número", instruction: "Escucharás palabras mezcladas. Presiona '¡Lo escuché!' solo cuando escuches el número TRES.", content: "Mantén el foco en el número objetivo.", correctAnswer: "tres", order: 2, exerciseType: "audio_attention", difficulty: 1, explanation: "Identificar un estímulo entre distractores entrena la atención focalizada.", audioConfig: { stimulusText: "tres", distractorTexts: ["uno", "cinco", "ocho"], targetItem: "tres", noiseLevel: 0 } },
        { moduleId: 'auditory-attention', title: "Voz entre el ruido", instruction: "Escucharás varias palabras con ruido de fondo. Detecta la palabra LIBRO entre los distractores.", content: "El ruido de fondo dificulta la tarea. Concéntrate en el objetivo.", correctAnswer: "libro", order: 3, exerciseType: "audio_attention", difficulty: 2, explanation: "La atención selectiva en presencia de ruido simula entornos reales de aprendizaje.", audioConfig: { stimulusText: "libro", distractorTexts: ["mesa", "puerta", "ventana", "silla"], targetItem: "libro", noiseLevel: 0.05 } },
        { moduleId: 'auditory-attention', title: "Instrucción entre voces", instruction: "Escucharás varias instrucciones. Identifica cuándo se menciona la palabra ESTUDIAR.", content: "Filtra las instrucciones irrelevantes y detecta la palabra objetivo.", correctAnswer: "estudiar", order: 4, exerciseType: "audio_attention", difficulty: 2, explanation: "Este ejercicio simula el entorno Moodle donde debes identificar instrucciones relevantes.", audioConfig: { stimulusText: "estudiar", distractorTexts: ["descansar", "caminar", "comer", "dormir"], targetItem: "estudiar", noiseLevel: 0.05 } },
        { moduleId: 'auditory-attention', title: "Atención sostenida con ruido intenso", instruction: "Con ruido de fondo alto, detecta la palabra COMPUTADOR entre muchos distractores similares.", content: "Este es el nivel más exigente. Mantén la concentración durante toda la reproducción.", correctAnswer: "computador", order: 5, exerciseType: "audio_attention", difficulty: 3, explanation: "La atención sostenida bajo alta carga cognitiva mejora con la práctica constante.", audioConfig: { stimulusText: "computador", distractorTexts: ["calculadora", "impresora", "teclado", "monitor", "altavoz"], targetItem: "computador", noiseLevel: 0.12 } },
        
        // Memoria de Trabajo Auditiva (auditory-memory)
        { moduleId: 'auditory-memory', title: "Recuerda 2 colores", instruction: "Escucha la secuencia de 2 colores y repítela en el mismo orden seleccionando las opciones.", content: "Empieza con secuencias cortas para entrenar tu memoria auditiva.", correctAnswer: "rojo,azul", order: 1, exerciseType: "audio_memory", difficulty: 1, explanation: "La memoria de trabajo auditiva permite retener y manipular información sonora temporalmente.", audioConfig: { stimulusText: "rojo", sequenceItems: ["rojo", "azul"], distractorTexts: ["verde", "amarillo"], noiseLevel: 0 } },
        { moduleId: 'auditory-memory', title: "Secuencia de animales", instruction: "Escucha los 2 animales en orden y repite la secuencia correctamente.", content: "Escucha con atención y recuerda el orden exacto.", correctAnswer: "perro,gato", order: 2, exerciseType: "audio_memory", difficulty: 1, explanation: "Retener el orden de elementos auditivos es clave para seguir instrucciones complejas.", audioConfig: { stimulusText: "perro", sequenceItems: ["perro", "gato"], distractorTexts: ["pez", "pájaro"], noiseLevel: 0 } },
        { moduleId: 'auditory-memory', title: "Secuencia de 3 números", instruction: "Escucha los 3 números y repítelos en el mismo orden.", content: "La secuencia tiene 3 elementos. Presta atención al orden.", correctAnswer: "cuatro,siete,dos", order: 3, exerciseType: "audio_memory", difficulty: 2, explanation: "Aumentar la longitud de la secuencia entrena el bucle fonológico de la memoria de trabajo.", audioConfig: { stimulusText: "cuatro", sequenceItems: ["cuatro", "siete", "dos"], distractorTexts: ["uno", "nueve", "tres"], noiseLevel: 0 } },
        { moduleId: 'auditory-memory', title: "Instrucciones en orden", instruction: "Escucha 3 acciones y recuerda el orden en que deben ejecutarse.", content: "Sigue el orden exacto de las instrucciones auditivas.", correctAnswer: "abrir,leer,cerrar", order: 4, exerciseType: "audio_memory", difficulty: 2, explanation: "Seguir instrucciones multi-paso es una habilidad fundamental en entornos digitales como Moodle.", audioConfig: { stimulusText: "abrir", sequenceItems: ["abrir", "leer", "cerrar"], distractorTexts: ["guardar", "escribir", "enviar"], noiseLevel: 0 } },
        { moduleId: 'auditory-memory', title: "Secuencia de 4 elementos", instruction: "Escucha la secuencia de 4 palabras a velocidad normal y repítela en orden exacto.", content: "Este es el nivel más exigente de memoria. Concentra toda tu atención.", correctAnswer: "luna,sol,estrella,planeta", order: 5, exerciseType: "audio_memory", difficulty: 3, explanation: "Las secuencias largas exigen mayor capacidad de almacenamiento y recuperación auditiva.", audioConfig: { stimulusText: "luna", sequenceItems: ["luna", "sol", "estrella", "planeta"], distractorTexts: ["cometa", "nebulosa", "galaxia"], noiseLevel: 0 } },
        
        // Discriminación Sonora (auditory-survey)
        { moduleId: 'auditory-survey', title: "¿Igual o diferente? — Palabras simples", instruction: "Escucha los dos sonidos. ¿Son la misma palabra o son diferentes?", content: "Presta atención a cada sonido antes de responder.", correctAnswer: "diferente", order: 1, exerciseType: "audio_discrimination", difficulty: 1, explanation: "Discriminar sonidos distintos es la base de la comprensión auditiva del lenguaje.", audioConfig: { stimulusText: "casa", distractorTexts: ["masa"], noiseLevel: 0 } },
        { moduleId: 'auditory-survey', title: "Dos sonidos iguales", instruction: "Escucha los dos sonidos. Decide si son iguales o diferentes.", content: "Esta vez los dos sonidos pueden ser idénticos.", correctAnswer: "igual", order: 2, exerciseType: "audio_discrimination", difficulty: 1, explanation: "Reconocer la igualdad entre sonidos entrena la precisión en la percepción auditiva.", audioConfig: { stimulusText: "libro", distractorTexts: ["libro"], noiseLevel: 0 } },
        { moduleId: 'auditory-survey', title: "Palabras similares", instruction: "Escucha con atención. Las dos palabras son muy parecidas. ¿Son iguales o diferentes?", content: "La diferencia entre los sonidos es sutil. Concéntrate.", correctAnswer: "diferente", order: 3, exerciseType: "audio_discrimination", difficulty: 2, explanation: "Discriminar palabras fonéticamente similares mejora la comprensión en entornos ruidosos.", audioConfig: { stimulusText: "boca", distractorTexts: ["voca"], noiseLevel: 0.05 } },
        { moduleId: 'auditory-survey', title: "Instrucciones parecidas", instruction: "Escucha las dos instrucciones. ¿Dicen lo mismo o son instrucciones distintas?", content: "En Moodle es importante distinguir instrucciones similares pero con significados diferentes.", correctAnswer: "diferente", order: 4, exerciseType: "audio_discrimination", difficulty: 2, explanation: "Distinguir instrucciones similares reduce errores en tareas académicas digitales.", audioConfig: { stimulusText: "guarda el archivo", distractorTexts: ["abre el archivo"], noiseLevel: 0.05 } },
        { moduleId: 'auditory-survey', title: "Discriminación con ruido intenso", instruction: "Con ruido de fondo alto, determina si los dos sonidos que escuchas son iguales o diferentes.", content: "El ruido dificulta la discriminación. Este es el nivel más exigente.", correctAnswer: "diferente", order: 5, exerciseType: "audio_discrimination", difficulty: 3, explanation: "La discriminación bajo ruido intenso simula entornos reales de alta carga cognitiva.", audioConfig: { stimulusText: "presiona intro", distractorTexts: ["presiona control"], noiseLevel: 0.12 } },
      ];

      for (const ex of allExercises) {
        console.log("Intentando insertar ejercicio:", ex.title);
        try {
          await addDoc(collection(db, 'exercises'), {
            ...ex,
            createdAt: Timestamp.now(),
            authorId: authContext?.currentUser?.id || 'admin_import',
          });
          console.log("Ejercicio insertado correctamente:", ex.title);
        } catch (e) {
          console.error("Error al insertar:", ex.title, e);
          toast.error(`Error al insertar ${ex.title}`);
        }
      }
      
      toast.success("¡Actividades importadas correctamente!");
      fetchExercises();
    } catch (error) {
      console.error("Error general en importación:", error);
      toast.error("Error general al importar actividades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchExercises();
    }
  }, [moduleId, isAdmin]);

  const handleAddExercise = async () => {
    if (!newExercise.title || !newExercise.instruction) {
      toast.error("El título y la instrucción son obligatorios.");
      return;
    }

    try {
      const exerciseData = {
        ...newExercise,
        moduleId,
        createdAt: Timestamp.now(),
        authorId: authContext?.currentUser?.id || 'unknown',
        order: newExercise.order || exercises.length
      };

      await addDoc(collection(db, 'exercises'), exerciseData);
      toast.success("Ejercicio añadido correctamente.");
      setIsAdding(false);
      setNewExercise({
        title: '',
        content: '',
        instruction: '',
        possibleAnswers: [],
        correctAnswer: '',
        explanation: '',
        fileUrl: '',
        fileName: '',
        order: exercises.length + 1
      });
      fetchExercises();
    } catch (error) {
      console.error("Error adding exercise:", error);
      handleFirestoreError(error, OperationType.CREATE, 'exercises');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    console.log("Botón de eliminar presionado para ID:", id);

    try {
      console.log("Intentando eliminar documento:", id);
      await deleteDoc(doc(db, 'exercises', id));
      console.log("Documento eliminado exitosamente:", id);
      toast.success("Ejercicio eliminado.");
      fetchExercises();
    } catch (error) {
      console.error("Error al eliminar ejercicio:", id, error);
      handleFirestoreError(error, OperationType.DELETE, `exercises/${id}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for Firestore base64 storage
      toast.error("El archivo es demasiado grande. El límite es 1MB.");
      return;
    }

    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setNewExercise(prev => ({
        ...prev,
        fileUrl: base64,
        fileName: file.name
      }));
      setUploadingFile(false);
      toast.success("Archivo cargado correctamente.");
    };
    reader.onerror = () => {
      setUploadingFile(false);
      toast.error("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const addOption = () => {
    if (newOption.trim()) {
      setNewExercise(prev => ({
        ...prev,
        possibleAnswers: [...(prev.possibleAnswers || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setNewExercise(prev => ({
      ...prev,
      possibleAnswers: (prev.possibleAnswers || []).filter((_, i) => i !== index)
    }));
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-12 border-t-4 border-primary pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-user-shield text-primary"></i> Panel de Administración: {moduleTitle}
        </h2>
        <div className="flex gap-3">
          <AccessibleButton 
            onClick={importAllExercises}
            variant="secondary"
            className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Importar 20 Actividades
          </AccessibleButton>
          <AccessibleButton 
            onClick={() => setIsAdding(!isAdding)} 
            variant="primary"
            className="rounded-xl"
          >
            {isAdding ? 'Cancelar' : 'Nuevo Ejercicio / Actividad'}
          </AccessibleButton>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 overflow-hidden"
          >
            <h3 className="text-lg font-bold text-slate-700 mb-4">Añadir Nueva Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccessibleInput 
                id="ex-title"
                label="Título de la Actividad"
                value={newExercise.title || ''}
                onChange={(e) => setNewExercise({...newExercise, title: e.target.value})}
                placeholder="Ej: Lectura de Comprensión"
              />
              <AccessibleInput 
                id="ex-order"
                label="Orden de Aparición"
                type="number"
                value={String(newExercise.order || 0)}
                onChange={(e) => setNewExercise({...newExercise, order: parseInt(e.target.value)})}
              />
              <div className="md:col-span-2">
                <AccessibleInput 
                  id="ex-content"
                  label="Contenido / Texto de Apoyo (Opcional)"
                  value={newExercise.content || ''}
                  onChange={(e) => setNewExercise({...newExercise, content: e.target.value})}
                  isTextArea
                  rows={3}
                  placeholder="Texto que el estudiante debe leer o analizar..."
                />
              </div>
              <div className="md:col-span-2">
                <AccessibleInput 
                  id="ex-instruction"
                  label="Instrucción / Pregunta"
                  value={newExercise.instruction || ''}
                  onChange={(e) => setNewExercise({...newExercise, instruction: e.target.value})}
                  isTextArea
                  rows={2}
                  placeholder="¿Qué debe hacer el estudiante?"
                />
              </div>

              <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-2">Subir Archivo de Actividad (PDF, Imagen, Doc)</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-slate-100 border-2 border-dashed border-slate-300 p-4 rounded-xl hover:bg-slate-200 transition-all flex-grow text-center">
                    <span className="text-slate-500 font-medium">
                      {uploadingFile ? 'Procesando...' : newExercise.fileName || 'Haz clic para seleccionar un archivo (máx 1MB)'}
                    </span>
                    <input type="file" onChange={handleFileSelect} className="hidden" />
                  </label>
                  {newExercise.fileUrl && (
                    <button 
                      onClick={() => setNewExercise(prev => ({ ...prev, fileUrl: '', fileName: '' }))}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-600 mb-2">Opciones de Respuesta (Opcional para selección múltiple)</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Escribe una opción..."
                    className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={addOption} className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Añadir</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newExercise.possibleAnswers?.map((opt, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {opt}
                      <button onClick={() => removeOption(idx)} className="text-red-500 hover:text-red-700"><i className="fas fa-times"></i></button>
                    </span>
                  ))}
                </div>
              </div>

              <AccessibleInput 
                id="ex-correct"
                label="Respuesta Correcta (Opcional)"
                value={newExercise.correctAnswer || ''}
                onChange={(e) => setNewExercise({...newExercise, correctAnswer: e.target.value})}
                placeholder="Exactamente como aparece en las opciones o respuesta libre"
              />
              <AccessibleInput 
                id="ex-explanation"
                label="Explicación (Opcional)"
                value={newExercise.explanation || ''}
                onChange={(e) => setNewExercise({...newExercise, explanation: e.target.value})}
                placeholder="¿Por qué esta es la respuesta correcta?"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <AccessibleButton onClick={handleAddExercise} variant="primary" className="px-8" disabled={uploadingFile}>
                Guardar Actividad
              </AccessibleButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-bottom border-slate-200">
          <h3 className="font-bold text-slate-700">Actividades Cargadas ({exercises.length})</h3>
        </div>
        {loading ? (
          <div className="p-12"><LoadingSpinner text="Cargando actividades..." /></div>
        ) : exercises.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No hay actividades cargadas para este módulo.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-start gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Orden: {ex.order}</span>
                    <h4 className="font-bold text-slate-800">{ex.title}</h4>
                    {ex.fileUrl && <span className="text-emerald-500 text-xs flex items-center gap-1"><i className="fas fa-paperclip"></i> Con archivo</span>}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{ex.instruction}</p>
                </div>
                <button 
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="text-red-400 hover:text-red-600 p-2 transition-colors"
                  title="Eliminar Actividad"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
