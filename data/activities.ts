
import { Exercise } from '../types';

export enum Subject {
  TECHNOLOGY = 'Tecnología e Informática',
  SCIENCE = 'Ciencias Naturales',
  MATH = 'Matemáticas',
  HISTORY = 'Historia y Ciencias Sociales'
}

export interface IcfesExercise extends Exercise {
  subject: Subject;
  explanation?: string;
}

export const MODULE_ACTIVITIES: Record<string, IcfesExercise[]> = {
  'science': [
    {
      id: 'sci-1',
      moduleId: 'science',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.SCIENCE,
      title: 'Ciclo del Agua',
      content: 'El ciclo del agua consta de varios procesos fundamentales: primero, el sol calienta el agua de los océanos y esta sube a la atmósfera (evaporación); luego, el vapor se enfría y forma nubes (condensación); finalmente, el agua cae de las nubes en forma de lluvia o nieve (precipitación).',
      instruction: '¿Cuál es el orden correcto de los procesos mencionados?',
      possibleAnswers: ['Evaporación, Condensación, Precipitación', 'Precipitación, Evaporación, Condensación', 'Condensación, Precipitación, Evaporación'],
      correctAnswer: 'Evaporación, Condensación, Precipitación',
      explanation: 'El agua se evapora, se condensa en nubes y luego cae como lluvia.'
    },
    {
      id: 'sci-2',
      moduleId: 'science',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.SCIENCE,
      title: 'Fotosíntesis',
      content: 'La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias utilizan la energía de la luz solar para sintetizar compuestos orgánicos (glucosa) a partir de dióxido de carbono y agua, liberando oxígeno como subproducto.',
      instruction: '¿Qué gas liberan las plantas durante la fotosíntesis?',
      possibleAnswers: ['Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Hidrógeno'],
      correctAnswer: 'Oxígeno',
      explanation: 'Las plantas absorben dióxido de carbono y liberan oxígeno durante este proceso vital.'
    }
  ],
  'history': [
    {
      id: 'hist-1',
      moduleId: 'history',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.HISTORY,
      title: 'Independencia de Colombia',
      content: 'Durante la gesta libertadora de Colombia, figuras como Simón Bolívar, Francisco de Paula Santander y Antonio Nariño jugaron roles cruciales en la organización política y militar de la naciente república.',
      instruction: 'De acuerdo con el texto, ¿quién de los siguientes NO es mencionado como prócer de la independencia colombiana?',
      possibleAnswers: ['Simón Bolívar', 'Francisco de Paula Santander', 'Antonio Nariño', 'Napoleón Bonaparte'],
      correctAnswer: 'Napoleón Bonaparte',
      explanation: 'Napoleón fue un líder francés que influyó indirectamente, pero no es mencionado en el texto como prócer de la independencia colombiana.'
    },
    {
      id: 'hist-2',
      moduleId: 'history',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.HISTORY,
      title: 'Pensamiento de Santander',
      content: 'Francisco de Paula Santander, conocido como el "Hombre de las Leyes", afirmaba que la educación era la base fundamental para la estabilidad de las instituciones republicanas y el progreso de la nación.',
      instruction: '¿Cuál era la postura de Santander sobre la educación según el texto?',
      possibleAnswers: ['La educación es el pilar de la república', 'La educación es solo para los ricos', 'No es necesaria la educación'],
      correctAnswer: 'La educación es el pilar de la república',
      explanation: 'Santander fue un gran impulsor de la educación pública y creía firmemente que sin ciudadanos educados no habría una república sólida.'
    }
  ],
  'math': [
    {
      id: 'math-1',
      moduleId: 'math',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.MATH,
      title: 'Sucesiones Numéricas',
      content: 'Observa la siguiente secuencia de números: 3, 6, 9, 12, 15, 18...',
      instruction: 'Identifica el patrón de la secuencia. ¿Cuál es el siguiente número?',
      possibleAnswers: ['19', '20', '21', '24'],
      correctAnswer: '21',
      explanation: 'La secuencia aumenta de 3 en 3 (3+3=6, 6+3=9, etc.). Por lo tanto, 18+3 = 21.'
    },
    {
      id: 'math-2',
      moduleId: 'math',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.MATH,
      title: 'Áreas Geométricas',
      content: 'Un rectángulo tiene una base de 8 centímetros y una altura de 5 centímetros. El área de un rectángulo se calcula multiplicando la base por la altura.',
      instruction: '¿Cuál es el área del rectángulo descrito?',
      possibleAnswers: ['13 cm²', '40 cm²', '26 cm²', '30 cm²'],
      correctAnswer: '40 cm²',
      explanation: 'Área = base × altura = 8 cm × 5 cm = 40 cm².'
    }
  ],
  'technology': [
    {
      id: 'tech-1',
      moduleId: 'technology',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.TECHNOLOGY,
      title: 'Componentes del Computador',
      content: 'El procesador, también conocido como CPU, es el componente principal de un ordenador. Se encarga de interpretar y ejecutar las instrucciones de los programas, coordinando el funcionamiento de los demás componentes del sistema.',
      instruction: '¿A qué componente se refiere el texto anterior?',
      possibleAnswers: ['Memoria RAM', 'Disco Duro', 'Procesador', 'Tarjeta Madre'],
      correctAnswer: 'Procesador',
      explanation: 'El procesador es el "cerebro" del computador, encargado de ejecutar las instrucciones de los programas.'
    },
    {
      id: 'tech-2',
      moduleId: 'technology',
      createdAt: new Date('2024-01-01'),
      authorId: 'system',
      subject: Subject.TECHNOLOGY,
      title: 'Evolución de la Comunicación',
      content: 'A finales del siglo XX, para conectarse a Internet se utilizaban módems telefónicos que emitían un sonido característico de chirridos y pitidos mientras establecían la conexión a través de la línea de cobre.',
      instruction: '¿Qué dispositivo emitía el sonido descrito en el texto?',
      possibleAnswers: ['Módem telefónico', 'Impresora láser', 'Teclado mecánico', 'Disco flexible'],
      correctAnswer: 'Módem telefónico',
      explanation: 'El módem de 56k utilizaba la línea telefónica analógica para transmitir datos digitales, produciendo sonidos audibles durante el proceso de conexión.'
    }
  ]
};
