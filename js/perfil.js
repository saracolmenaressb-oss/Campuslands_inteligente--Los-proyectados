import { auth } from './auth.js';
import { storage } from './storage.js';

if (auth.checkAuth()) {
    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = auth.getCurrentUser();
        
        document.querySelectorAll('.header-logout-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (confirm('¿Deseas salir de la órbita?')) auth.logout(); });
        });

        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-info').textContent = currentUser.career;

        // Mostrar historial
        document.getElementById('profile-btn-history').addEventListener('click', () => {
            const panel = document.getElementById('subpanel-history');
            panel.classList.toggle('hidden');
            
            if (!panel.classList.contains('hidden')) {
                const list = document.getElementById('profile-wellbeing-history-list');
                list.innerHTML = '';
                const history = storage.getWellbeingHistory().filter(h => h.studentId === currentUser.id);
                
                if(history.length === 0) {
                    list.innerHTML = '<p style="font-size:0.8rem; color:gray;">No hay registros de diagnósticos.</p>';
                } else {
                    history.reverse().forEach(log => {
                        const div = document.createElement('div');
                        div.style.padding = "10px";
                        div.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
                        div.innerHTML = `<strong style="color:var(--cosmic-purple);">${log.date}</strong><br><span style="font-size:0.8rem; color:var(--text-dust);">Dificultad: ${log.difficulty}/10 - Riesgo: <span style="text-transform:uppercase;">${log.riskLevel}</span></span>`;
                        list.appendChild(div);
                    });
                }
            }
        });
    });
}