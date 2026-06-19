import { runInferenceEngine } from './sistemaExpert.js';
import { storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    let selectedMood = null;
    const emojiButtons = document.querySelectorAll('.mood-emoji-btn');
    const slider = document.getElementById('difficulty-slider');
    const submitBtn = document.getElementById('btn-submit-wellness');

    emojiButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            emojiButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = parseInt(btn.dataset.value);
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (!selectedMood) {
                alert("Por favor, selecciona un emoji que represente tu estado de ánimo.");
                return;
            }

            const difficulty = parseInt(slider.value);
            const diagnostic = runInferenceEngine(selectedMood, difficulty);
            
            // Si el sistema experto dictamina riesgo alto, se inserta una alerta para el Admin
            if (diagnostic.triggerProtocol) {
                const alerts = storage.get('alerts') || [];
                const currentUser = storage.get('currentUser');
                alerts.unshift({
                    id: Date.now(),
                    student: currentUser.name || "Camper Anónimo",
                    program: currentUser.program || "Sistemas • 1° semestre",
                    level: "alto",
                    reason: "El motor infirió un riesgo crítico basado en el test diario de bienestar.",
                    date: "Hoy, Justo ahora"
                });
                storage.set('alerts', alerts);
            }

            // Almacenar el resultado para visualizarlo en los paneles correspondientes
            storage.set('lastDiagnostic', diagnostic);
            
            // Redirección dinámica según mockup
            document.getElementById('wellness-form-view').classList.add('d-none');
            const resultView = document.getElementById('wellness-result-view');
            resultView.classList.remove('d-none');

            document.getElementById('result-emoji').textContent = diagnostic.emoji;
            document.getElementById('result-message').textContent = diagnostic.message;

            if (diagnostic.riskLevel === 'alto' || diagnostic.riskLevel === 'medio') {
                document.getElementById('action-channels').classList.remove('d-none');
            }
        });
    }
});