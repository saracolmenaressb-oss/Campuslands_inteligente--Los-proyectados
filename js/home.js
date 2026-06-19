import { storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const activities = storage.get('activities') || [];
    const container = document.getElementById('activities-list');
    
    if (container) {
        container.innerHTML = '';
        activities.forEach(act => {
            const div = document.createElement('div');
            div.className = 'activity-strip';
            div.innerHTML = `
                <div class="activity-thumb">${act.icon}</div>
                <div class="activity-details">
                    <h3>${act.title}</h3>
                    <p>${act.type} • ${act.date}</p>
                </div>
            `;
            div.onclick = () => {
                window.location.href = `actividades.html?id=${act.id}`;
            };
            container.appendChild(div);
        });
    }
});