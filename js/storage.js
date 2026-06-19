// Administrador y almacén central en LocalStorage para CampusLife

// Actividades por defecto (Espacio Exterior/Bienestar)
const DEFAULT_ACTIVITIES = [
    {
        id: "act-1",
        title: "Taller de pintura: Expresa y conecta",
        description: "Un espacio de desconexión artística para explorar tu creatividad libre de código y conectar con otros estudiantes a través del lienzo.",
        category: "Arte",
        date: "2026-06-25",
        time: "4:00 p.m. - 6:00 p.m.",
        location: "Aula de Arte, Bloque C",
        capacity: 15,
        enrolled: ["student-1"],
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop"
    },
    {
        id: "act-2",
        title: "Grupo de apoyo emocional: Comparte y escucha",
        description: "Sesión grupal facilitada por psicólogos del campus para compartir experiencias sobre la presión académica, la ansiedad y el bienestar.",
        category: "Grupos de apoyo",
        date: "2026-06-26",
        time: "6:00 p.m. - 7:30 p.m.",
        location: "Auditorio de Bienestar, Piso 2",
        capacity: 20,
        enrolled: [],
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop"
    },
    {
        id: "act-3",
        title: "Torneo de FIFA & Ping Pong Cósmico",
        description: "Relájate en nuestra zona recreativa con competencias rápidas y socialización para despejar tu mente de las pantallas.",
        category: "Deportes",
        date: "2026-06-27",
        time: "2:00 p.m. - 5:00 p.m.",
        location: "Zona Gamer y Recreativa, Bloque A",
        capacity: 32,
        enrolled: ["student-2"],
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop"
    },
    {
        id: "act-4",
        title: "Taller de Meditación y Mindfulness para Programadores",
        description: "Aprende técnicas de respiración consciente y reducción de estrés diseñadas específicamente para momentos de bloqueo mental o frustración de código.",
        category: "Bienestar emocional",
        date: "2026-06-28",
        time: "8:00 a.m. - 9:30 a.m.",
        location: "Sala Zen, Bloque D",
        capacity: 15,
        enrolled: ["student-1", "student-2"],
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop"
    },
    {
        id: "act-5",
        title: "Club de lectura: Code & Philosophy",
        description: "Discusión grupal de ciencia ficción, ética de la IA y crecimiento humano. Acompañado de café estelar.",
        category: "Humanidades",
        date: "2026-06-29",
        time: "5:00 p.m. - 6:30 p.m.",
        location: "Biblioteca Central, Cubículo 4",
        capacity: 10,
        enrolled: [],
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&auto=format&fit=crop"
    }
];

// Guías por defecto
const DEFAULT_GUIDES = [
    {
        id: "guide-1",
        title: "Manejo del síndrome del impostor en el código",
        category: "Bienestar emocional",
        readingTime: "5 min de lectura",
        summary: "Sentir que tus logros son por suerte es común en tecnología. Aprende a combatirlo.",
        content: "El síndrome del impostor es un fenómeno psicológico en el que la persona es incapaz de asimilar sus logros y sufre un miedo constante a ser descubierta como un fraude. En el ámbito del desarrollo de software, donde las tecnologías cambian tan rápido, este sentimiento se amplifica.\n\n### Estrategias de Afrontamiento:\n1. **Registra tus victorias:** Lleva una bitácora de los bugs que solucionas y los conceptos que aprendes.\n2. **Acepta que no puedes saberlo todo:** Nadie conoce todas las librerías o frameworks. Enfócate en tu capacidad de aprender.\n3. **Comparte tus dudas:** Hablar de tus dudas con otros compañeros te hará ver que muchos pasan por lo mismo.",
        createdAt: "2026-06-15"
    },
    {
        id: "guide-2",
        title: "Técnicas Pomodoro para evitar el burnout en filtros",
        category: "Tecnología",
        readingTime: "4 min de lectura",
        summary: "Cómo programar de manera intensiva sin desgastar tu salud mental.",
        content: "Durante las semanas de filtros de Campuslands, las horas frente al computador vuelan. Trabajar sin pausas desgasta tu rendimiento cognitivo y aumenta la ansiedad.\n\n### El método 25/5 Cósmico:\n1. Trabaja enfocado 25 minutos sin distracciones.\n2. Toma una pausa obligatoria de 5 minutos: levántate, estírate y toma agua.\n3. Cada 4 ciclos Pomodoro, toma un descanso largo de 15 a 20 minutos alejado de las pantallas.\n\nEsto ayuda a mantener activa la corteza prefrontal de tu cerebro y reduce el estrés acumulado.",
        createdAt: "2026-06-16"
    },
    {
        id: "guide-3",
        title: "Hacks de ergonomía y descanso visual",
        category: "Bienestar emocional",
        readingTime: "3 min de lectura",
        summary: "Posturas y ejercicios oculares rápidos para programadores de alto rendimiento.",
        content: "El cansancio ocular y los dolores de espalda reducen drásticamente tu bienestar. Implementa la regla 20-20-20:\n- Cada 20 minutos, mira un objeto situado a 20 pies (unos 6 metros) durante al menos 20 segundos. Esto relaja el músculo ciliar del ojo.\n\nAjusta tu monitor a la altura de tus ojos y mantén los codos en un ángulo de 90 grados para evitar lesiones de túnel carpiano.",
        createdAt: "2026-06-17"
    }
];

// Estudiantes por defecto
const DEFAULT_STUDENTS = [
    {
        id: "student-1",
        name: "María González",
        email: "maria@campuslands.com",
        password: "user123",
        career: "Psicología & Software",
        semester: "4º Semestre",
        avatar: "astronaut",
        interests: ["Arte", "Humanidades", "Bienestar emocional"],
        createdAt: "2026-06-10"
    },
    {
        id: "student-2",
        name: "Juan Pérez",
        email: "juan@campuslands.com",
        password: "user123",
        career: "Desarrollo de Software",
        semester: "2º Semestre",
        avatar: "rocket",
        interests: ["Deportes", "Tecnología", "Ciencias"],
        createdAt: "2026-06-12"
    }
];

// Historial de bienestar por defecto (para gráficos del admin)
const DEFAULT_WELLBEING_LOGS = [
    {
        id: "log-1",
        studentId: "student-1",
        date: "2026-06-16",
        mood: "bien", // muy-bien, bien, regular, mal, muy-mal
        difficulty: 3, // 0 to 10
        riskLevel: "bajo",
        notes: "Excelente jornada, logré entender la lógica del backend."
    },
    {
        id: "log-2",
        studentId: "student-1",
        date: "2026-06-17",
        mood: "regular",
        difficulty: 5,
        riskLevel: "bajo",
        notes: "Cansada a mitad del día, pero logré completar las tareas."
    },
    {
        id: "log-3",
        studentId: "student-1",
        date: "2026-06-19",
        mood: "muy-mal",
        difficulty: 9,
        riskLevel: "alto",
        notes: "Siento demasiada frustración con el filtro de base de datos. Pienso en retirarme."
    },
    {
        id: "log-4",
        studentId: "student-2",
        date: "2026-06-18",
        mood: "mal",
        difficulty: 7,
        riskLevel: "medio",
        notes: "Mucho dolor de cabeza por la luz azul. No logré avanzar mucho hoy."
    },
    {
        id: "log-5",
        studentId: "student-2",
        date: "2026-06-19",
        mood: "bien",
        difficulty: 2,
        riskLevel: "bajo",
        notes: "¡Ya solucioné el bug! Todo marcha bien en el grupo."
    }
];

// Alertas de riesgo por defecto
const DEFAULT_ALERTS = [
    {
        id: "alert-1",
        studentId: "student-1",
        studentName: "María González",
        career: "Psicología & Software",
        semester: "4º Semestre",
        date: "2026-06-19T10:30:00",
        riskLevel: "alto", // alto, medio, bajo
        reason: "Respuestas en formulario indican riesgo de deserción o crisis (Ánimo: Muy Mal, Dificultad: 9/10).",
        actions: {
            contacted: false,
            evaluated: false,
            protocolActive: false
        },
        notes: "El estudiante manifiesta frustración extrema por el filtro y deseos de retirarse.",
        status: "active" // active, resolved
    },
    {
        id: "alert-2",
        studentId: "student-2",
        studentName: "Juan Pérez",
        career: "Desarrollo de Software",
        semester: "2º Semestre",
        date: "2026-06-18T09:15:00",
        riskLevel: "medio",
        reason: "Respuestas en formulario indican malestar moderado prolongado (Ánimo: Mal, Dificultad: 7/10).",
        actions: {
            contacted: true,
            evaluated: false,
            protocolActive: false
        },
        notes: "Menciona dolores de cabeza. Se le sugirió usar lentes con filtro azul y descanso.",
        status: "active"
    }
];

// Citas programadas por defecto
const DEFAULT_APPOINTMENTS = [
    {
        id: "app-1",
        studentId: "student-1",
        date: "2026-06-22",
        time: "09:00 a.m. - 10:00 a.m.",
        reason: "Asesoría emocional y manejo de estrés por filtros",
        status: "scheduled"
    }
];

// Tests predeterminados
const DEFAULT_TESTS = [
    {
        id: "test-stress",
        title: "Test de Estrés Académico",
        description: "Evalúa tu nivel de sobrecarga mental y detecta si te encuentras en un nivel saludable o requieres soporte especializado.",
        questions: [
            {
                id: "q1",
                text: "¿Con qué frecuencia experimentas dolores físicos como tensión en cuello, espalda o cabeza al estudiar?",
                options: [
                    { text: "Casi nunca, mi cuerpo se siente relajado", points: 1 },
                    { text: "A veces, cuando se acerca una entrega difícil", points: 2 },
                    { text: "Constantemente, casi todos los días de código", points: 3 }
                ]
            },
            {
                id: "q2",
                text: "¿Cómo consideras la calidad de tu sueño durante esta semana?",
                options: [
                    { text: "Excelente, duermo entre 7 y 8 horas y despierto descansado", points: 1 },
                    { text: "Interrumpido, me cuesta conciliar el sueño pensando en el código", points: 2 },
                    { text: "Insomnio severo, me despierto cansado y ansioso", points: 3 }
                ]
            },
            {
                id: "q3",
                text: "Cuando tu código arroja un error persistente, ¿cómo reaccionas?",
                options: [
                    { text: "Tomo una pausa, respiro y busco con calma en la documentación o StackOverflow", points: 1 },
                    { text: "Me frustro temporalmente pero continúo intentando con insistencia", points: 2 },
                    { text: "Siento desesperación extrema, ira o deseos de cerrar el computador por completo", points: 3 }
                ]
            },
            {
                id: "q4",
                text: "¿Has dejado de socializar o realizar tus pasatiempos favoritos por falta de tiempo o cansancio?",
                options: [
                    { text: "No, logro balancear mis tiempos de descanso y actividades", points: 1 },
                    { text: "Un poco, pero sigo compartiendo esporádicamente", points: 2 },
                    { text: "Totalmente, toda mi energía se consume en Campuslands", points: 3 }
                ]
            }
        ],
        rules: [
            { maxScore: 5, diagnosis: "Estrés Saludable 🌌", description: "Mantienes una excelente gestión emocional y balance del tiempo. ¡Sigue así, cadete estelar!", riskLevel: "bajo" },
            { maxScore: 9, diagnosis: "Estrés Moderado 🪐", description: "Tienes niveles de tensión que debes vigilar. Se te recomienda tomar descansos frecuentes (técnica Pomodoro) e inscribirte en actividades lúdicas o deportivas en el campus.", riskLevel: "medio" },
            { maxScore: 12, diagnosis: "Sobrecarga Cognitiva Alta 💥", description: "Tus niveles de estrés son críticos. Tu mente y cuerpo están enviando señales de alarma. Te sugerimos agendar una cita de bienestar y tomar un día de descanso activo.", riskLevel: "alto" }
        ]
    },
    {
        id: "test-personality",
        title: "Test de Personalidad del Programador",
        description: "Descubre tu estilo cognitivo y en qué entorno del desarrollo encajas mejor según tus afinidades innatas.",
        questions: [
            {
                id: "q1",
                text: "Al diseñar una solución de software, ¿qué te genera mayor entusiasmo?",
                options: [
                    { text: "Hacer que la interfaz se vea espectacular, fluida y con microinteracciones agradables", points: 1 }, // Front
                    { text: "Diseñar una estructura lógica de datos sólida, eficiente y veloz", points: 2 }, // Back
                    { text: "Organizar al equipo, definir prioridades y planear la entrega", points: 3 } // Leader/PM
                ]
            },
            {
                id: "q2",
                text: "¿Cómo te sientes trabajando con sistemas abstractos o configuraciones complejas de servidores?",
                options: [
                    { text: "Prefiero verlo visualizado; lo abstracto me cansa rápido", points: 1 },
                    { text: "Me apasiona; resolver problemas de lógica pura me parece fascinante", points: 2 },
                    { text: "Me interesa si sirve para organizar el flujo del proyecto entero", points: 3 }
                ]
            },
            {
                id: "q3",
                text: "¿Qué cualidad valoras más en un software?",
                options: [
                    { text: "La usabilidad e impacto visual inmediato en el usuario", points: 1 },
                    { text: "El rendimiento del algoritmo y la seguridad de la información", points: 2 },
                    { text: "La escalabilidad, orden del código y mantenibilidad del equipo", points: 3 }
                ]
            }
        ],
        rules: [
            { maxScore: 4, diagnosis: "Arquitecto Visual (Front-End Designer) 🎨", description: "Tienes una fuerte inclinación hacia la estética y la experiencia de usuario. Tu mente conecta el arte con el código para maravillar visualmente.", riskLevel: "bajo" },
            { maxScore: 7, diagnosis: "Explorador del Abismo Lógico (Back-End Developer) 💻", description: "Lo tuyo es la lógica pura, algoritmos, bases de datos y resolver problemas intrincados tras bambalinas. Te apasiona la eficiencia.", riskLevel: "bajo" },
            { maxScore: 9, diagnosis: "Comandante de Misión (Project Manager / DevOps) 🚀", description: "Posees una visión integral. Te enfocas en el orden del flujo, la integración y liderar equipos hacia un despliegue exitoso.", riskLevel: "bajo" }
        ]
    }
];

// Inicializar base de datos local
export function initializeDatabase() {
    if (!localStorage.getItem("acompanau_initialized")) {
        localStorage.setItem("acompanau_students", JSON.stringify(DEFAULT_STUDENTS));
        localStorage.setItem("acompanau_activities", JSON.stringify(DEFAULT_ACTIVITIES));
        localStorage.setItem("acompanau_guides", JSON.stringify(DEFAULT_GUIDES));
        localStorage.setItem("acompanau_wellbeing_history", JSON.stringify(DEFAULT_WELLBEING_LOGS));
        localStorage.setItem("acompanau_alerts", JSON.stringify(DEFAULT_ALERTS));
        localStorage.setItem("acompanau_appointments", JSON.stringify(DEFAULT_APPOINTMENTS));
        localStorage.setItem("acompanau_tests", JSON.stringify(DEFAULT_TESTS));
        localStorage.setItem("acompanau_initialized", "true");
        console.log("CampusLife DB: Base de datos inicializada en LocalStorage con temática cósmica 🪐");
    }
}

// Métodos de acceso genéricos
export function getFromStorage(key) {
    initializeDatabase();
    return JSON.parse(localStorage.getItem(key)) || [];
}

export function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Métodos específicos
export const storage = {
    // Estudiantes
    getStudents: () => getFromStorage("acompanau_students"),
    saveStudent: (student) => {
        const students = storage.getStudents();
        students.push(student);
        saveToStorage("acompanau_students", students);
    },
    updateStudent: (studentId, updatedData) => {
        const students = storage.getStudents();
        const index = students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            saveToStorage("acompanau_students", students);
            return students[index];
        }
        return null;
    },

    // Actividades
    getActivities: () => getFromStorage("acompanau_activities"),
    saveActivity: (activity) => {
        const activities = storage.getActivities();
        activities.push(activity);
        saveToStorage("acompanau_activities", activities);
    },
    enrollInActivity: (activityId, studentId) => {
        const activities = storage.getActivities();
        const index = activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            if (!activities[index].enrolled.includes(studentId)) {
                activities[index].enrolled.push(studentId);
                saveToStorage("acompanau_activities", activities);
                return { success: true, activity: activities[index] };
            }
        }
        return { success: false };
    },
    unenrollFromActivity: (activityId, studentId) => {
        const activities = storage.getActivities();
        const index = activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            activities[index].enrolled = activities[index].enrolled.filter(id => id !== studentId);
            saveToStorage("acompanau_activities", activities);
            return { success: true, activity: activities[index] };
        }
        return { success: false };
    },

    // Guías
    getGuides: () => getFromStorage("acompanau_guides"),
    saveGuide: (guide) => {
        const guides = storage.getGuides();
        guide.id = "guide-" + Date.now();
        guide.createdAt = new Date().toISOString().split("T")[0];
        guides.push(guide);
        saveToStorage("acompanau_guides", guides);
    },

    // Tests (Creados por Administrador y por defecto)
    getTests: () => getFromStorage("acompanau_tests"),
    saveTest: (test) => {
        const tests = storage.getTests();
        test.id = "test-" + Date.now();
        tests.push(test);
        saveToStorage("acompanau_tests", tests);
    },

    // Historial de bienestar (mood checks)
    getWellbeingHistory: () => getFromStorage("acompanau_wellbeing_history"),
    addWellbeingLog: (log) => {
        const history = storage.getWellbeingHistory();
        log.id = "log-" + Date.now();
        log.date = new Date().toISOString().split("T")[0];
        history.push(log);
        saveToStorage("acompanau_wellbeing_history", history);
        
        // Si el estado es crítico, crear alerta de riesgo automáticamente
        if (log.riskLevel === "alto" || log.riskLevel === "medio") {
            const student = storage.getStudents().find(s => s.id === log.studentId);
            const alert = {
                id: "alert-" + Date.now(),
                studentId: log.studentId,
                studentName: student ? student.name : "Estudiante Desconocido",
                career: student ? student.career : "Programación",
                semester: student ? student.semester : "Desconocido",
                date: new Date().toISOString(),
                riskLevel: log.riskLevel,
                reason: `Registro de bienestar indica riesgo (${log.mood === 'muy-mal' ? 'Ánimo: Muy Mal' : 'Ánimo: Mal'}, Dificultad: ${log.difficulty}/10).`,
                actions: {
                    contacted: false,
                    evaluated: false,
                    protocolActive: false
                },
                notes: log.notes || "Respuestas automáticas recopiladas desde el portal de salud.",
                status: "active"
            };
            storage.addAlert(alert);
        }
    },

    // Alertas de riesgo
    getAlerts: () => getFromStorage("acompanau_alerts"),
    addAlert: (alert) => {
        const alerts = storage.getAlerts();
        alerts.push(alert);
        saveToStorage("acompanau_alerts", alerts);
    },
    updateAlert: (alertId, updatedData) => {
        const alerts = storage.getAlerts();
        const index = alerts.findIndex(a => a.id === alertId);
        if (index !== -1) {
            alerts[index] = { ...alerts[index], ...updatedData };
            saveToStorage("acompanau_alerts", alerts);
            return alerts[index];
        }
        return null;
    },

    // Citas
    getAppointments: () => getFromStorage("acompanau_appointments"),
    saveAppointment: (appointment) => {
        const appointments = storage.getAppointments();
        appointment.id = "app-" + Date.now();
        appointment.status = "scheduled";
        appointments.push(appointment);
        saveToStorage("acompanau_appointments", appointments);
    },
    cancelAppointment: (appId) => {
        const appointments = storage.getAppointments();
        const index = appointments.findIndex(a => a.id === appId);
        if (index !== -1) {
            appointments[index].status = "cancelled";
            saveToStorage("acompanau_appointments", appointments);
        }
    }
};

// Autoejecutar inicialización en importación
initializeDatabase();
