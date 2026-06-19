// Base de Conocimientos: Preguntas del Sistema Experto
export const surveyQuestions = [
    {
        id: "energia",
        text: "¿Cómo describirías tu nivel de energía actual en la jornada de Campuslands?",
        options: [
            { text: "Batería al 100%, ¡puedo compilar el mundo!", value: "alta" },
            { text: "Bajo de energía, el código me absorbió el alma.", value: "baja" }
        ]
    },
    {
        id: "estres",
        text: "¿Qué tanto estrés sientes en este momento por los proyectos o filtros?",
        options: [
            { text: "Nivel Dios. Mucha presión acumulada.", value: "alto" },
            { text: "Relax total. Todo controlado y subido a GitHub.", value: "bajo" }
        ]
    },
    {
        id: "social",
        text: "¿Qué tipo de entorno prefieres experimentar justo ahora?",
        options: [
            { text: "Rodearme de gente, hablar y hacer networking con otros campers.", value: "social" },
            { text: "Un ambiente tranquilo, poca gente o introspección.", value: "tranquilo" }
        ]
    }
];

// Base de Conocimientos: Base de Datos de Eventos del Campus
const eventsDatabase = [
    { id: 1, title: "Cine-Foro: Geek Culture Night", type: "cine", description: "Proyección de películas de culto y debates tecnológicos.", tags: ["desconexion", "relax"] },
    { id: 2, title: "Torneo de FIFA & Ping Pong", type: "fiestas", description: "Competencia relámpago en la zona de break.", tags: ["desahogo", "socializacion"] },
    { id: 3, title: "Jam Session: Micrófono Abierto", type: "musica", description: "Trae tu instrumento o siéntate a escuchar música en vivo.", tags: ["socializacion", "relax"] },
    { id: 4, title: "Club de Lectura: Code & Philosophy", type: "club de lectura", description: "Discusión de libros de ciencia ficción y crecimiento profesional.", tags: ["relax", "introspeccion"] },
    { id: 5, title: "Campus Rave: Post-Filter Party", type: "fiestas", description: "Música electrónica y luces para celebrar que sobrevivimos al filtro.", tags: ["desahogo"] },
    { id: 6, title: "Taller de Meditación y Mindfulness para Programadores", type: "salud", description: "Aprende a respirar tras un error de sintaxis intratable.", tags: ["desconexion", "introspeccion"] }
];

// Motor de Inferencia: Evalúa las respuestas mediante reglas preestablecidas
export function evaluateMood(responses) {
    const { energia, estres, social } = responses;

    // Regla 1: Energía Alta + Estrés Alto + Enfoque Social => Estado de Desahogo Activo
    if (energia === "alta" && estres === "alto" && social === "social") {
        return {
            mood: "Estresado pero Activo 🔥",
            description: "Tienes mucha energía acumulada debido a la presión. Necesitas liberar tensiones interactuando dinámicamente.",
            targetTag: "desahogo"
        };
    }
    
    // Regla 2: Energía Alta + Estrés Bajo + Enfoque Social => Estado de Socialización Pura
    if (energia === "alta" && estres === "bajo" && social === "social") {
        return {
            mood: "Camper Conectado ⚡",
            description: "Estás de excelente humor y libre de cargas. Es el momento perfecto para conectar socialmente.",
            targetTag: "socializacion"
        };
    }

    // Regla 3: Energía Baja + Estrés Alto + Enfoque Tranquilo => Estado de Desconexión Mental
    if (energia === "baja" && estres === "alto") {
        return {
            mood: "Código Quemado (Burnout leve) 🧠💥",
            description: "Tu cerebro ha trabajado demasiado y el estrés es alto. Te conviene un evento de desconexión sin presión social.",
            targetTag: "desconexion"
        };
    }

    // Regla 4: Energía Baja + Estrés Bajo => Estado de Relax / Introspección
    if (energia === "baja" && estres === "bajo") {
        return {
            mood: "Modo Zen 🧘‍♂️",
            description: "Estás tranquilo pero con ganas de bajar revoluciones. Una actividad calmada mantendrá tu paz.",
            targetTag: "relax"
        };
    }

    // Regla por Defecto (Fallback)
    return {
        mood: "Equilibrado ⚖️",
        description: "Estás en un punto medio óptimo. Cualquier actividad te vendrá bien.",
        targetTag: "relax"
    };
}

// Filtrador de Eventos basado en el Tag recomendado por el Motor de Inferencia
export function filterEvents(targetTag) {
    return eventsDatabase.filter(event => event.tags.includes(targetTag));
}