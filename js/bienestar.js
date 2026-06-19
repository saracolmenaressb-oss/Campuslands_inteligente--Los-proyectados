import { auth } from './auth.js';
import { storage } from './storage.js';
import { evaluateMood } from './sistemaExperto.js';

if (auth.checkAuth()) {
    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = auth.getCurrentUser();
        let selectedMood = '';

        document.querySelectorAll('.header-logout-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (confirm('¿Deseas salir de la órbita?')) auth.logout(); });
        });

        const testsContainer = document.getElementById('available-expert-tests');
        storage.getTests().forEach(test => {
            const btn = document.createElement('button');
            btn.className = 'cosmic-btn cosmic-btn-secondary';
            btn.style.marginTop = '10px';
            btn.textContent = test.title;
            btn.addEventListener('click', () => alert('El test: "' + test.title + '" iniciará pronto.'));
            testsContainer.appendChild(btn);
        });

        document.getElementById('btn-trigger-mood-check').addEventListener('click', () => {
            document.getElementById('wellbeing-menu').classList.add('hidden');
            document.getElementById('wellbeing-mood-form').classList.remove('hidden');
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            document.getElementById('wellbeing-mood-form').classList.add('hidden');
            document.getElementById('wellbeing-menu').classList.remove('hidden');
        });

        const emojis = document.querySelectorAll('.emoji-btn');
        emojis.forEach(btn => {
            btn.addEventListener('click', () => {
                emojis.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedMood = btn.getAttribute('data-mood');
            });
        });

        document.getElementById('mood-submit-btn').addEventListener('click', () => {
            if (!selectedMood) return alert('Selecciona una emoción.');
            const diff = document.getElementById('mood-difficulty-slider').value;
            const evalResult = evaluateMood(selectedMood, diff);

            storage.addWellbeingLog({
                studentId: currentUser.id,
                mood: selectedMood,
                difficulty: diff,
                riskLevel: evalResult.riskLevel,
                notes: evalResult.diagnosis
            });

            document.getElementById('wellbeing-mood-form').classList.add('hidden');
            document.getElementById('wellbeing-results-screen').classList.remove('hidden');
            
            document.getElementById('result-badge-emoji').textContent = evalResult.emoji;
            document.getElementById('result-diagnosis-title').textContent = evalResult.diagnosis;
            document.getElementById('result-diagnosis-desc').textContent = evalResult.description;
            
            const wpp = document.getElementById('result-whatsapp-btn');
            if (evalResult.riskLevel === 'alto' || evalResult.riskLevel === 'medio') {
                wpp.style.display = 'block';
            }
        });
    });
}