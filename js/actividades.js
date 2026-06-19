import { auth } from './auth.js';
import { storage } from './storage.js';

if (auth.checkAuth()) {
    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = auth.getCurrentUser();
        
        document.querySelectorAll('.header-logout-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (confirm('¿Deseas salir de la órbita?')) auth.logout(); });
        });

        const INTEREST_CATEGORIES = [
            { name: "Arte", emoji: "🎨" }, { name: "Ciencias", emoji: "🔬" },
            { name: "Humanidades", emoji: "📚" }, { name: "Grupos de apoyo", emoji: "👥" },
            { name: "Deportes", emoji: "⚽" }, { name: "Tecnología", emoji: "💻" },
            { name: "Bienestar emocional", emoji: "💜" }
        ];

        let selectedCategoryFilter = '';
        const catGrid = document.getElementById('explore-categories-list');
        const activities = storage.getActivities();
        
        INTEREST_CATEGORIES.forEach(cat => {
            const count = activities.filter(act => act.category.includes(cat.name)).length;
            const card = document.createElement('div');
            card.className = 'explore-cat-card';
            card.innerHTML = `<span style="font-size:1.5rem;">${cat.emoji}</span><div class="explore-cat-title">${cat.name}</div><div style="font-size:0.75rem; color:gray;">${count} act.</div>`;
            card.addEventListener('click', () => {
                selectedCategoryFilter = cat.name;
                document.getElementById('explore-results-title').style.display = 'block';
                document.getElementById('explore-results-title').textContent = `Categoría: ${cat.name}`;
                renderExploreResults();
            });
            catGrid.appendChild(card);
        });

        document.getElementById('explore-search-input').addEventListener('input', (e) => {
            selectedCategoryFilter = '';
            renderExploreResults(e.target.value.toLowerCase());
        });

        function renderExploreResults(query = '') {
            const container = document.getElementById('explore-activities-list');
            container.innerHTML = '';
            let filtered = storage.getActivities();

            if (selectedCategoryFilter) filtered = filtered.filter(a => a.category.includes(selectedCategoryFilter));
            if (query) filtered = filtered.filter(a => a.title.toLowerCase().includes(query));

            filtered.forEach(act => {
                const card = document.createElement('div');
                card.className = 'activity-card-horizontal';
                card.innerHTML = `
                    <img src="${act.image}" class="activity-img-thumb">
                    <div class="activity-card-body">
                        <span class="activity-card-category">${act.category}</span>
                        <h4 class="activity-card-title">${act.title}</h4>
                    </div>
                `;
                card.addEventListener('click', () => openActivityDrawer(act));
                container.appendChild(card);
            });
        }

        function openActivityDrawer(activity) {
            document.getElementById('activity-drawer-img').src = activity.image;
            document.getElementById('activity-drawer-category').textContent = activity.category;
            document.getElementById('activity-drawer-title').textContent = activity.title;
            document.getElementById('activity-drawer-desc').textContent = activity.description;
            
            const btn = document.getElementById('activity-drawer-action-btn');
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            if (activity.enrolled.includes(currentUser.id)) {
                newBtn.innerHTML = 'Anular Inscripción';
                newBtn.style.background = 'rgba(255, 59, 48, 0.2)';
                newBtn.addEventListener('click', () => {
                    storage.unenrollFromActivity(activity.id, currentUser.id);
                    document.getElementById('activity-detail-drawer').classList.add('hidden');
                    renderExploreResults();
                });
            } else {
                newBtn.innerHTML = 'Inscribirme';
                newBtn.style.background = '';
                newBtn.addEventListener('click', () => {
                    storage.enrollInActivity(activity.id, currentUser.id);
                    document.getElementById('activity-detail-drawer').classList.add('hidden');
                    alert('¡Inscrito con éxito!');
                    renderExploreResults();
                });
            }
            document.getElementById('activity-detail-drawer').classList.remove('hidden');
        }
        document.getElementById('btn-close-activity-drawer').addEventListener('click', () => document.getElementById('activity-detail-drawer').classList.add('hidden'));
    });
}