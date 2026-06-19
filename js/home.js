import { auth } from './auth.js';
import { storage } from './storage.js';

if (auth.checkAuth()) {
    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = auth.getCurrentUser();
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        // Saludo y Cerrar Sesión
        document.getElementById('home-greeting').innerHTML = `¡Hola, ${currentUser.name.split(' ')[0]}! 🚀`;
        document.querySelectorAll('.header-logout-btn').forEach(btn => {
            btn.addEventListener('click', () => { if (confirm('¿Deseas salir de la órbita?')) auth.logout(); });
        });

        // Setup Inicial (Si es nuevo usuario)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('setup') === 'true' || !currentUser.interests || currentUser.interests.length === 0) {
            document.getElementById('view-setup').classList.remove('hidden');
            renderSetupInterests();
        } else {
            document.getElementById('view-setup').classList.add('hidden');
        }

        let selectedSetupInterests = [];
        function renderSetupInterests() {
            const grid = document.getElementById('setup-interests-list');
            const cats = [{ n: "Arte", e: "🎨" }, { n: "Ciencias", e: "🔬" }, { n: "Humanidades", e: "📚" }, { n: "Grupos de apoyo", e: "👥" }, { n: "Deportes", e: "⚽" }, { n: "Tecnología", e: "💻" }, { n: "Bienestar", e: "💜" }];
            cats.forEach(cat => {
                const item = document.createElement('div');
                item.className = 'interest-item';
                item.innerHTML = `<span class="interest-emoji">${cat.e}</span><span>${cat.n}</span>`;
                item.addEventListener('click', () => {
                    if (selectedSetupInterests.includes(cat.n)) {
                        selectedSetupInterests = selectedSetupInterests.filter(c => c !== cat.n);
                        item.classList.remove('selected');
                    } else {
                        selectedSetupInterests.push(cat.n);
                        item.classList.add('selected');
                    }
                });
                grid.appendChild(item);
            });
        }

        document.getElementById('setup-continue-btn').addEventListener('click', () => {
            if (selectedSetupInterests.length === 0) return alert('Selecciona al menos un interés.');
            storage.updateStudent(currentUser.id, { interests: selectedSetupInterests });
            currentUser.interests = selectedSetupInterests;
            auth.setSession(currentUser);
            window.history.replaceState({}, document.title, "home.html");
            document.getElementById('view-setup').classList.add('hidden');
            renderFeaturedActivities(); // Refrescar recomendados
        });

        // Renderizar calendario
        renderCalendar();
        renderFeaturedActivities();

        function renderCalendar() {
            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            document.getElementById('calendar-month-year').textContent = `${monthNames[currentMonth]} ${currentYear}`;

            ["D", "L", "M", "M", "J", "V", "S"].forEach(lbl => {
                const el = document.createElement('div');
                el.className = 'calendar-day-label';
                el.textContent = lbl;
                grid.appendChild(el);
            });

            const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
            const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
            const activitiesThisMonth = storage.getActivities().filter(act => {
                const [y, m, d] = act.date.split('-');
                return parseInt(y) === currentYear && parseInt(m) === (currentMonth + 1);
            });

            for (let i = 0; i < firstDayIndex; i++) grid.appendChild(document.createElement('div'));

            const today = new Date();
            for (let day = 1; day <= totalDays; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;

                const eventOnDay = activitiesThisMonth.find(act => parseInt(act.date.split('-')[2]) === day);
                if (eventOnDay) {
                    dayEl.classList.add('has-event');
                    dayEl.addEventListener('click', () => openActivityDrawer(eventOnDay));
                }
                if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                    dayEl.classList.add('today');
                }
                grid.appendChild(dayEl);
            }
        }

        document.getElementById('cal-prev-btn').addEventListener('click', () => {
            currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            currentYear = currentMonth === 11 ? currentYear - 1 : currentYear;
            renderCalendar();
        });

        document.getElementById('cal-next-btn').addEventListener('click', () => {
            currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            currentYear = currentMonth === 0 ? currentYear + 1 : currentYear;
            renderCalendar();
        });

        function renderFeaturedActivities() {
            const list = document.getElementById('featured-activities-list');
            list.innerHTML = '';
            // Recomendar basado en intereses
            let userInterests = currentUser.interests || [];
            let activities = storage.getActivities();
            let recommended = activities.filter(act => userInterests.includes(act.category));
            let others = activities.filter(act => !userInterests.includes(act.category));
            let sorted = [...recommended, ...others].slice(0, 3);

            sorted.forEach(act => {
                const card = document.createElement('div');
                card.className = 'activity-card-horizontal';
                card.innerHTML = `
                    <img src="${act.image}" class="activity-img-thumb">
                    <div class="activity-card-body">
                        <span class="activity-card-category">${act.category}</span>
                        <h4 class="activity-card-title">${act.title}</h4>
                        <span class="activity-card-time">⏰ ${act.date} &bull; ${act.time.split(' - ')[0]}</span>
                    </div>
                `;
                card.addEventListener('click', () => openActivityDrawer(act));
                list.appendChild(card);
            });
        }

        // Lógica Modal
        function openActivityDrawer(activity) {
            document.getElementById('activity-drawer-img').src = activity.image;
            document.getElementById('activity-drawer-category').textContent = activity.category;
            document.getElementById('activity-drawer-title').textContent = activity.title;
            document.getElementById('activity-drawer-date').textContent = activity.date;
            document.getElementById('activity-drawer-time').textContent = activity.time;
            document.getElementById('activity-drawer-location').textContent = activity.location;
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
                    renderFeaturedActivities();
                });
            } else {
                newBtn.innerHTML = 'Inscribirme';
                newBtn.style.background = '';
                newBtn.addEventListener('click', () => {
                    storage.enrollInActivity(activity.id, currentUser.id);
                    document.getElementById('activity-detail-drawer').classList.add('hidden');
                    alert('¡Inscrito con éxito!');
                    renderFeaturedActivities();
                });
            }
            document.getElementById('activity-detail-drawer').classList.remove('hidden');
        }
        document.getElementById('btn-close-activity-drawer').addEventListener('click', () => {
            document.getElementById('activity-detail-drawer').classList.add('hidden');
        });
    });
}