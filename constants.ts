
export const APP_NAME = "MODULACC";

export const APP_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  SCIENCE: '/module/auditory-attention',
  HISTORY: '/module/auditory-memory',
  MATH: '/module/auditory-survey',
  TECHNOLOGY: '/module/technology',
  MY_PROGRESS: '/my-progress',
  PERSONAL_EVALUATION: '/personal-evaluation',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USER_MANAGEMENT: '/admin/users',
  COURSE_INTERNAL: '/course/:courseId',
  AUDIO_TRAINING: '/module/audio-training',
  HELP: '/help',
  FORUM: '/forum',
};

export const ARIA_LABELS = {
  EMAIL_INPUT: "Campo de entrada para correo electrónico",
  PASSWORD_INPUT: "Campo de entrada para contraseña",
  LOGIN_BUTTON: "Botón para iniciar sesión",
  REGISTER_BUTTON: "Botón para registrar una nueva cuenta",
  FORGOT_PASSWORD_LINK: "Enlace para recuperar contraseña",
  AUDIO_PLAYER_PLAY: "Reproducir audio",
  AUDIO_PLAYER_PAUSE: "Pausar audio",
  AUDIO_PLAYER_REPEAT: "Repetir audio",
  UPLOAD_VOICE_RESPONSE: "Subir respuesta de voz",
  SELECT_RESPONSE_OPTION: (option: string) => `Seleccionar opción de respuesta: ${option}`,
  TIMER_STATUS: "Temporizador",
  EXPORT_PDF_BUTTON: "Exportar resultados a PDF",
  NEXT_MODULE_SUGGESTION: "Sugerencia para el próximo módulo",
  MAIN_NAVIGATION: "Navegación principal",
  USER_MENU: "Menú de usuario",
};

export const KEYBOARD_SHORTCUTS = {
  DASHBOARD: { name: "Panel Principal", key: 'd', path: APP_ROUTES.DASHBOARD },
  ATTENTION: { name: "Atención Auditiva", key: '1', path: APP_ROUTES.SCIENCE },
  MEMORY: { name: "Memoria Auditiva", key: '2', path: APP_ROUTES.HISTORY },
  SURVEY: { name: "Discriminación Sonora", key: '3', path: APP_ROUTES.MATH },
  TECHNOLOGY: { name: "Tecnología e Informática", key: '4', path: APP_ROUTES.TECHNOLOGY },
  MY_PROGRESS: { name: "Mi Progreso", key: 'p', path: APP_ROUTES.MY_PROGRESS },
  PERSONAL_EVALUATION: { name: "Evaluación Personal", key: 'e', path: APP_ROUTES.PERSONAL_EVALUATION },
  AUDIO_TRAINING: { name: "Entrenamiento Auditivo", key: '5', path: APP_ROUTES.AUDIO_TRAINING },
  HELP: { name: "Ayuda", key: 'h', path: APP_ROUTES.HELP },
  FORUM: { name: "Foro de Consultas", key: 'f', path: APP_ROUTES.FORUM },
  LOGOUT: { name: "Cerrar Sesión", key: 'q', path: APP_ROUTES.LOGIN },
};

export const HIGH_CONTRAST_COLORS = {
  background: 'bg-white',
  text: 'text-black',
  primary: 'bg-blue-700',
  primaryText: 'text-white',
  // Add more as needed
};

export const STANDARD_COLORS = {
  background: 'bg-background', // from tailwind.config.js
  text: 'text-textDark',       // from tailwind.config.js
  primary: 'bg-primary',
  primaryText: 'text-textLight',
};
