// Motor de Inferencia del Sistema Experto - CampusLife

/**
 * Evalúa el cuestionario diario de estado de ánimo
 * aplicando reglas basadas en el humor reportado y la dificultad de tareas diarias.
 * 
 * @param {string} mood - 'muy-bien', 'bien', 'regular', 'mal', 'muy-mal'
 * @param {number} difficulty - Nivel de dificultad reportado de 0 a 10
 * @returns {object} Evaluación con diagnóstico, nivel de riesgo, recomendación y tag de filtrado.
 */
export function evaluateMood(mood, difficulty) {
    difficulty = parseInt(difficulty, 10);

    // REGLA 1: Estado Crítico de Ánimo + Dificultad Alta (>= 6) => RIESGO ALTO
    if ((mood === "muy-mal" || mood === "mal") && difficulty >= 6) {
        return {
            diagnosis: "Alerta de Riesgo Alto (Supernova) 💥",
            description: "Tus respuestas reflejan un nivel de malestar emocional y dificultad cognitiva severa. Estamos aquí para acompañarte. Se ha enviado una notificación de apoyo al equipo de bienestar y te sugerimos agendar una cita de atención de inmediato.",
            riskLevel: "alto",
            targetTag: "desconexion", // Recomendar actividades tranquilas e introspectivas
            emoji: "😩"
        };
    }

    // REGLA 2: Estado Crítico de Ánimo + Dificultad Baja (< 6) => RIESGO MEDIO
    if ((mood === "muy-mal" || mood === "mal") && difficulty < 6) {
        return {
            diagnosis: "Alerta de Riesgo Moderado (Órbita Inestable) 🪐",
            description: "Experimentas un ánimo bajo, aunque logras realizar tus actividades diarias. Te recomendamos conectar con nuestros grupos de apoyo y buscar desconexión en talleres artísticos.",
            riskLevel: "medio",
            targetTag: "desahogo", // Recomendar actividades de liberación de tensiones
            emoji: "🙁"
        };
    }

    // REGLA 3: Estado de Ánimo Regular + Dificultad Alta (>= 6) => RIESGO MEDIO
    if (mood === "regular" && difficulty >= 6) {
        return {
            diagnosis: "Sobrecarga Cognitiva Moderada (Polvo de Estrellas) ☄️",
            description: "Aunque tu estado de ánimo es neutro, estás experimentando una sobrecarga importante para cumplir con tus tareas diarias. Considera programar pausas activas con el método Pomodoro y asistir a actividades lúdicas.",
            riskLevel: "medio",
            targetTag: "relax",
            emoji: "😐"
        };
    }

    // REGLA 4: Estado Regular + Dificultad Baja (< 6) => RIESGO BAJO
    if (mood === "regular" && difficulty < 6) {
        return {
            diagnosis: "Estado Estable Neutro (Modo Órbita) 🛰️",
            description: "Te encuentras en un punto de equilibrio tranquilo. Es un buen momento para mantener tu rutina o participar en alguna actividad recreativa en el campus para despejar la mente.",
            riskLevel: "bajo",
            targetTag: "relax",
            emoji: "😐"
        };
    }

    // REGLA 5: Estado de Ánimo Positivo (Muy Bien / Bien) => RIESGO BAJO
    if (mood === "bien" || mood === "muy-bien") {
        const isSuper = mood === "muy-bien";
        return {
            diagnosis: isSuper ? "Energía al 100% (Cadete Estelar) 🚀" : "Estado Estable Positivo (Cielo Despejado) 🌌",
            description: isSuper 
                ? "¡Excelente! Tu energía está al máximo. Es el momento ideal para liderar iniciativas, estudiar temas complejos o socializar activamente con otros campers en el torneo."
                : "Te sientes bien y mantienes el control de tus actividades diarias. Participar en eventos recreativos o de aprendizaje te ayudará a sostener este estado.",
            riskLevel: "bajo",
            targetTag: "socializacion",
            emoji: isSuper ? "😊" : "🙂"
        };
    }

    // Fallback por defecto
    return {
        diagnosis: "Equilibrio Cósmico ⚖️",
        description: "Mantienes un nivel balanceado. Cualquier actividad recreativa o deportiva te vendrá bien para sostener tu órbita.",
        riskLevel: "bajo",
        targetTag: "relax",
        emoji: "🙂"
    };
}

/**
 * Evalúa las respuestas de un test del sistema experto dinámico.
 * Realiza una sumatoria de puntos y busca el diagnóstico correspondiente.
 * 
 * @param {object} test - El objeto del test del sistema experto.
 * @param {object} responses - Las respuestas del usuario en formato {qId: puntos}
 * @returns {object} El diagnóstico inferido según el rango de puntos.
 */
export function evaluateCustomTest(test, responses) {
    let totalScore = 0;
    
    // Sumar puntajes de las respuestas
    Object.keys(responses).forEach(qId => {
        totalScore += parseInt(responses[qId], 10);
    });

    // Ordenar reglas por puntaje máximo de menor a mayor
    const sortedRules = [...test.rules].sort((a, b) => a.maxScore - b.maxScore);

    // Evaluar reglas del motor de inferencia (primer acople que sea <= maxScore)
    for (const rule of sortedRules) {
        if (totalScore <= rule.maxScore) {
            return {
                score: totalScore,
                diagnosis: rule.diagnosis,
                description: rule.description,
                riskLevel: rule.riskLevel || "bajo"
            };
        }
    }

    // Si supera el puntaje de todas las reglas, retornar la regla con mayor puntaje (la más severa)
    const worstRule = sortedRules[sortedRules.length - 1];
    return {
        score: totalScore,
        diagnosis: worstRule.diagnosis,
        description: worstRule.description,
        riskLevel: worstRule.riskLevel || "bajo"
    };
}