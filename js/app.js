// Controlador Principal del Portal del Estudiante - AcompañaU
import { auth } from './auth.js';
import { storage } from './storage.js';
import { evaluateMood, evaluateCustomTest } from './sistemaExperto.js';

// Proteger ruta
if (auth.checkAuth()) {
    document.addEventListener('DOMContentLoaded', initApp);
}

function initApp() {
    const currentUser = auth.getCurrentUser();
    
    // Estado interno del portal
    let currentActiveView = 'home';
    let currentMonth = new Date().getMonth(); // 0-indexed
    let currentYear = new Date().getFullYear();
    
    // Elementos del DOM generales
    const mainHeader = document.getElementById('app-main-header');
    const headerUserBadge = document.getElementById('header-user-badge');
    const bottomNav = document.getElementById('app-nav-bar');
    const simTimeEl = document.getElementById('simulator-time');
    
    // Vistas principales
    const views = {
        setup: document.getElementById('view-setup'),
        home: document.getElementById('view-home'),
        explore: document.getElementById('view-explore'),
        wellbeing: document.getElementById('view-wellbeing'),
        profile: document.getElementById('view-profile')
    };

    // Actualizar hora del simulador móvil
    function updateClock() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        if (simTimeEl) simTimeEl.textContent = `${hrs}:${mins}`;
    }
    updateClock();
    setInterval(updateClock, 60000);

    // Configurar avatar y saludo en encabezado
    if (headerUserBadge) {
        headerUserBadge.textContent = `${getAvatarEmoji(currentUser.avatar)} Camper`;
    }

    // --- ENRUTAMIENTO Y VISTAS ---
    
    // Verificar si se requiere setup de intereses (primer ingreso)
    const urlParams = new URLSearchParams(window.location.search);
    const forceSetup = urlParams.get('setup') === 'true' || !currentUser.interests || currentUser.interests.length === 0;

    if (forceSetup) {
        switchView('setup');
    } else {
        switchView('home');
    }

    // Configurar clicks de la barra de navegación inferior
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            switchView(targetView);
        });
    });

    function switchView(viewName) {
        currentActiveView = viewName;
        
        // Ocultar todas las vistas
        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.add('hidden');
        });

        // Mostrar vista solicitada
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
        }

        // Estilos de navegación e indicación activa
        navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Configuración especial de cabeceras en Setup de intereses
        if (viewName === 'setup') {
            mainHeader.classList.add('hidden');
            bottomNav.classList.add('hidden');
            renderSetupInterests();
        } else {
            mainHeader.classList.remove('hidden');
            bottomNav.classList.remove('hidden');
        }

        // Disparar recargas específicas de vistas
        if (viewName === 'home') {
            loadHomeView();
        } else if (viewName === 'explore') {
            loadExploreView();
        } else if (viewName === 'wellbeing') {
            loadWellbeingView();
        } else if (viewName === 'profile') {
            loadProfileView();
        }
    }

    // --- VISTA 0: SETUP DE INTERESES ---
    const INTEREST_CATEGORIES = [
        { name: "Arte", emoji: "🎨" },
        { name: "Ciencias", emoji: "🔬" },
        { name: "Humanidades", emoji: "📚" },
        { name: "Grupos de apoyo", emoji: "👥" },
        { name: "Deportes", emoji: "⚽" },
        { name: "Tecnología", emoji: "💻" },
        { name: "Bienestar emocional", emoji: "💜" }
    ];

    let selectedSetupInterests = [];

    function renderSetupInterests() {
        const grid = document.getElementById('setup-interests-list');
        grid.innerHTML = '';
        selectedSetupInterests = [];

        INTEREST_CATEGORIES.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'interest-item';
            item.setAttribute('data-category', cat.name);
            item.innerHTML = `
                <span class="interest-emoji">${cat.emoji}</span>
                <span>${cat.name}</span>
            `;

            item.addEventListener('click', () => {
                if (selectedSetupInterests.includes(cat.name)) {
                    selectedSetupInterests = selectedSetupInterests.filter(c => c !== cat.name);
                    item.classList.remove('selected');
                } else {
                    selectedSetupInterests.push(cat.name);
                    item.classList.add('selected');
                }
            });
            grid.appendChild(item);
        });
    }

    document.getElementById('setup-continue-btn').addEventListener('click', () => {
        if (selectedSetupInterests.length === 0) {
            alert('Por favor selecciona al menos un área de interés para personalizar tu experiencia.');
            return;
        }

        // Guardar en LocalStorage y base de datos
        storage.updateStudent(currentUser.id, { interests: selectedSetupInterests });
        currentUser.interests = selectedSetupInterests;
        auth.setSession(currentUser);

        // Ir a inicio
        // Limpiar parámetro URL
        window.history.replaceState({}, document.title, "/index.html");
        switchView('home');
    });

    // --- VISTA 1: INICIO (HOME) ---
    function loadHomeView() {
        // Saludo personalizado
        const greetingEl = document.getElementById('home-greeting');
        greetingEl.innerHTML = `¡Hola, ${currentUser.name.split(' ')[0]}! ${getAvatarEmoji(currentUser.avatar)}`;
        
        renderCalendar();
        renderFeaturedActivities();
    }

    // Renderizar Calendario Mensual
    function renderCalendar() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        monthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        // Etiquetas de día
        const daysLabels = ["D", "L", "M", "M", "J", "V", "S"];
        daysLabels.forEach(lbl => {
            const el = document.createElement('div');
            el.className = 'calendar-day-label';
            el.textContent = lbl;
            grid.appendChild(el);
        });

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

        // Obtener actividades de este mes
        const activities = storage.getActivities();
        const monthString = String(currentMonth + 1).padStart(2, '0');
        const activitiesThisMonth = activities.filter(act => {
            const [y, m, d] = act.date.split('-');
            return parseInt(y) === currentYear && parseInt(m) === (currentMonth + 1);
        });

        // Rellenar días del mes anterior
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day inactive';
            dayEl.textContent = prevMonthTotalDays - i;
            grid.appendChild(dayEl);
        }

        // Rellenar días del mes actual
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const dayStr = String(day).padStart(2, '0');
            const dateStr = `${currentYear}-${monthString}-${dayStr}`;

            // Buscar si hay actividades en esta fecha
            const eventOnDay = activitiesThisMonth.find(act => {
                const [, , d] = act.date.split('-');
                return parseInt(d) === day;
            });

            if (eventOnDay) {
                dayEl.classList.add('has-event');
                dayEl.addEventListener('click', () => {
                    openActivityDrawer(eventOnDay);
                });
            }

            // Marcar hoy
            if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                dayEl.classList.add('today');
            }

            grid.appendChild(dayEl);
        }

        // Completar días del mes siguiente para grid cuadrado de 6 semanas (42 celdas en total con cabecera)
        const currentCellsCount = firstDayIndex + totalDays;
        const remainingCells = 42 - currentCellsCount;
        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day inactive';
            dayEl.textContent = i;
            grid.appendChild(dayEl);
        }
    }

    // Calendario navegación
    document.getElementById('cal-prev-btn').addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar();
    });

    document.getElementById('cal-next-btn').addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar();
    });

    // Actividades Destacadas (Inicio)
    function renderFeaturedActivities() {
        const listContainer = document.getElementById('featured-activities-list');
        listContainer.innerHTML = '';
        
        // Obtener actividades recomendadas (coincidentes con intereses del estudiante)
        const activities = storage.getActivities();
        
        // Mostrar primero las que coinciden con los intereses, luego el resto
        const matched = activities.filter(act => currentUser.interests.includes(act.category));
        const unmatched = activities.filter(act => !currentUser.interests.includes(act.category));
        const sorted = [...matched, ...unmatched].slice(0, 3); // top 3

        sorted.forEach(act => {
            const card = document.createElement('div');
            card.className = 'activity-card-horizontal';
            card.innerHTML = `
                <img src="${act.image}" alt="${act.title}" class="activity-img-thumb">
                <div class="activity-card-body">
                    <span class="activity-card-category">${act.category}</span>
                    <h4 class="activity-card-title">${act.title}</h4>
                    <span class="activity-card-time">
                        ⏰ ${formatDateSpanish(act.date)} &bull; ${act.time.split(' - ')[0]}
                    </span>
                </div>
            `;
            card.addEventListener('click', () => {
                openActivityDrawer(act);
            });
            listContainer.appendChild(card);
        });
    }

    // --- VISTA 2: EXPLORAR ---
    let selectedCategoryFilter = '';

    function loadExploreView() {
        const catGrid = document.getElementById('explore-categories-list');
        catGrid.innerHTML = '';
        selectedCategoryFilter = '';
        document.getElementById('explore-results-title').style.display = 'none';
        document.getElementById('explore-activities-list').innerHTML = '';
        document.getElementById('explore-search-input').value = '';

        const activities = storage.getActivities();

        INTEREST_CATEGORIES.forEach(cat => {
            // Contar cuántas actividades hay de esta categoría
            const count = activities.filter(act => act.category === cat.name).length;
            
            const card = document.createElement('div');
            card.className = 'explore-cat-card';
            card.innerHTML = `
                <span class="interest-emoji" style="font-size:1.5rem; margin-bottom:8px;">${cat.emoji}</span>
                <div class="explore-cat-title">${cat.name}</div>
                <div class="explore-cat-count">${count} actividades</div>
            `;

            card.addEventListener('click', () => {
                // Alternar filtro de categoría
                selectedCategoryFilter = cat.name;
                document.getElementById('explore-results-title').style.display = 'block';
                document.getElementById('explore-results-title').textContent = `Actividades de: ${cat.name}`;
                
                // Desplazar visualmente hacia abajo
                renderExploreResults();
            });

            catGrid.appendChild(card);
        });
    }

    // Buscar y renderizar resultados en Explorar
    const searchInput = document.getElementById('explore-search-input');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length > 0) {
            selectedCategoryFilter = '';
            document.getElementById('explore-results-title').style.display = 'block';
            document.getElementById('explore-results-title').textContent = `Resultados de búsqueda: "${query}"`;
            renderExploreResults(query);
        } else {
            document.getElementById('explore-results-title').style.display = 'none';
            document.getElementById('explore-activities-list').innerHTML = '';
        }
    });

    function renderExploreResults(searchQuery = '') {
        const container = document.getElementById('explore-activities-list');
        container.innerHTML = '';

        let activities = storage.getActivities();

        if (selectedCategoryFilter) {
            activities = activities.filter(act => act.category === selectedCategoryFilter);
        } else if (searchQuery) {
            activities = activities.filter(act => 
                act.title.toLowerCase().includes(searchQuery) || 
                act.description.toLowerCase().includes(searchQuery) ||
                act.category.toLowerCase().includes(searchQuery)
            );
        }

        if (activities.length === 0) {
            container.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-dust); margin-top:15px;">No se encontraron actividades en esta órbita.</p>`;
            return;
        }

        activities.forEach(act => {
            const card = document.createElement('div');
            card.className = 'activity-card-horizontal';
            card.innerHTML = `
                <img src="${act.image}" alt="${act.title}" class="activity-img-thumb">
                <div class="activity-card-body">
                    <span class="activity-card-category">${act.category}</span>
                    <h4 class="activity-card-title">${act.title}</h4>
                    <span class="activity-card-time">
                        ⏰ ${formatDateSpanish(act.date)} &bull; ${act.time.split(' - ')[0]}
                    </span>
                </div>
            `;
            card.addEventListener('click', () => {
                openActivityDrawer(act);
            });
            container.appendChild(card);
        });
    }

    // --- VISTA 3: BIENESTAR (TESTS Y CITAS) ---
    let selectedMood = '';
    let currentTest = null;
    let currentQuestionIdx = 0;
    let testResponses = {};

    function loadWellbeingView() {
        // Restablecer a menú principal de bienestar
        document.getElementById('wellbeing-menu').classList.remove('hidden');
        document.getElementById('wellbeing-mood-form').classList.add('hidden');
        document.getElementById('wellbeing-test-runner').classList.add('hidden');
        document.getElementById('wellbeing-booking-form').classList.add('hidden');
        document.getElementById('wellbeing-results-screen').classList.add('hidden');
        
        renderWellbeingTestsHub();
    }

    // Renderizar tests disponibles en el Hub
    function renderWellbeingTestsHub() {
        const testsContainer = document.getElementById('available-expert-tests');
        testsContainer.innerHTML = '';

        const tests = storage.getTests();

        tests.forEach(test => {
            const item = document.createElement('div');
            item.className = 'profile-option-row';
            item.style.padding = '12px 14px';
            item.style.background = 'rgba(255, 255, 255, 0.01)';
            item.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:4px; text-align:left;">
                    <span style="font-weight:700; font-size:0.85rem; color:var(--text-stellar);">${test.title}</span>
                    <span style="font-size:0.68rem; color:var(--text-dust); line-height:1.2;">${test.description.substring(0, 75)}...</span>
                </div>
                <button class="cosmic-btn" style="width:auto; padding:6px 12px; font-size:0.75rem; border-radius:8px;">Iniciar</button>
            `;
            
            item.querySelector('button').addEventListener('click', () => {
                startExpertTest(test);
            });

            testsContainer.appendChild(item);
        });
    }

    // --- 3.1: Formulario Diario de Ánimo ---
    const btnTriggerMoodCheck = document.getElementById('btn-trigger-mood-check');
    btnTriggerMoodCheck.addEventListener('click', () => {
        document.getElementById('wellbeing-menu').classList.add('hidden');
        document.getElementById('wellbeing-mood-form').classList.remove('hidden');
        
        // Reset form
        selectedMood = '';
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('mood-difficulty-slider').value = 5;
        document.getElementById('slider-current-val').textContent = '5';
        document.getElementById('mood-notes').value = '';
    });

    document.getElementById('btn-back-to-wellbeing-menu').addEventListener('click', () => {
        loadWellbeingView();
    });

    // Slider dificultad
    const difficultySlider = document.getElementById('mood-difficulty-slider');
    difficultySlider.addEventListener('input', (e) => {
        document.getElementById('slider-current-val').textContent = e.target.value;
    });

    // Selección de emojis de ánimo
    const emojiBtns = document.querySelectorAll('.emoji-btn');
    emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            emojiBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.getAttribute('data-mood');
        });
    });

    // Guardar diagnóstico de ánimo diario
    document.getElementById('mood-submit-btn').addEventListener('click', () => {
        if (!selectedMood) {
            alert('Por favor selecciona un emoji representativo de tu estado de ánimo.');
            return;
        }

        const difficulty = difficultySlider.value;
        const notes = document.getElementById('mood-notes').value.trim();

        // Motor de inferencia
        const evaluation = evaluateMood(selectedMood, difficulty);

        // Registrar bienestar
        const log = {
            studentId: currentUser.id,
            mood: selectedMood,
            difficulty: parseInt(difficulty, 10),
            riskLevel: evaluation.riskLevel,
            notes: notes || evaluation.diagnosis
        };
        storage.addWellbeingLog(log);

        // Mostrar resultados
        showWellbeingResults(evaluation);
    });

    // --- 3.2: Ejecución de Test del Sistema Experto ---
    function startExpertTest(test) {
        currentTest = test;
        currentQuestionIdx = 0;
        testResponses = {};

        document.getElementById('wellbeing-menu').classList.add('hidden');
        document.getElementById('wellbeing-test-runner').classList.remove('hidden');
        document.getElementById('runner-test-title').textContent = test.title;

        renderTestQuestion();
    }

    function renderTestQuestion() {
        const question = currentTest.questions[currentQuestionIdx];
        const progressFill = document.getElementById('runner-progress-fill');
        const questionText = document.getElementById('runner-question-text');
        const optionsContainer = document.getElementById('runner-options-container');

        // barra de progreso
        const progress = ((currentQuestionIdx) / currentTest.questions.length) * 100;
        progressFill.style.width = `${progress}%`;

        questionText.textContent = question.text;
        optionsContainer.innerHTML = '';

        question.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-button-vertical';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                testResponses[question.id] = opt.points;
                nextTestQuestion();
            });
            optionsContainer.appendChild(btn);
        });
    }

    function nextTestQuestion() {
        currentQuestionIdx++;
        if (currentQuestionIdx < currentTest.questions.length) {
            renderTestQuestion();
        } else {
            finishExpertTest();
        }
    }

    function finishExpertTest() {
        document.getElementById('runner-progress-fill').style.width = '100%';
        
        // Motor de inferencia de tests expertos
        const evaluation = evaluateCustomTest(currentTest, testResponses);

        // Registrar resultado en historial de bienestar
        const log = {
            studentId: currentUser.id,
            mood: evaluation.riskLevel === 'alto' ? 'muy-mal' : (evaluation.riskLevel === 'medio' ? 'mal' : 'bien'),
            difficulty: evaluation.riskLevel === 'alto' ? 8 : (evaluation.riskLevel === 'medio' ? 5 : 2),
            riskLevel: evaluation.riskLevel,
            notes: `Completó test "${currentTest.title}": Diagnóstico: ${evaluation.diagnosis}. Puntaje total: ${evaluation.score}.`
        };
        storage.addWellbeingLog(log);

        // Mapear respuesta a formato de resultados
        const resultFormatted = {
            diagnosis: evaluation.diagnosis,
            description: evaluation.description,
            riskLevel: evaluation.riskLevel,
            emoji: evaluation.riskLevel === 'alto' ? '😩' : (evaluation.riskLevel === 'medio' ? '😐' : '😊')
        };

        document.getElementById('wellbeing-test-runner').classList.add('hidden');
        showWellbeingResults(resultFormatted);
    }

    document.getElementById('btn-back-test-runner').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cancelar el test? Se perderá tu progreso.')) {
            loadWellbeingView();
        }
    });

    // --- 3.3: Agendamiento de Citas ---
    const btnTriggerBooking = document.getElementById('btn-trigger-appointment-booking');
    btnTriggerBooking.addEventListener('click', () => {
        document.getElementById('wellbeing-menu').classList.add('hidden');
        document.getElementById('wellbeing-booking-form').classList.remove('hidden');
        
        // Cargar fecha mínima (hoy)
        const dateInput = document.getElementById('book-date');
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.min = todayStr;
        dateInput.value = todayStr;
        document.getElementById('book-reason').value = '';
    });

    document.getElementById('btn-back-booking-form').addEventListener('click', () => {
        loadWellbeingView();
    });

    document.getElementById('book-submit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const date = document.getElementById('book-date').value;
        const time = document.getElementById('book-time').value;
        const reason = document.getElementById('book-reason').value.trim();

        if (!date || !reason) {
            alert('Por favor completa todos los campos del agendamiento.');
            return;
        }

        const appt = {
            studentId: currentUser.id,
            date,
            time,
            reason
        };

        storage.saveAppointment(appt);
        
        alert(`¡Cita agendada con éxito para el ${formatDateSpanish(date)} a las ${time.split(' - ')[0]}!`);
        loadWellbeingView();
    });

    // --- 3.4: Pantalla de Resultados ---
    function showWellbeingResults(evaluation) {
        document.getElementById('wellbeing-mood-form').classList.add('hidden');
        document.getElementById('wellbeing-results-screen').classList.remove('hidden');

        const resultEmoji = document.getElementById('result-badge-emoji');
        const resultTitle = document.getElementById('result-diagnosis-title');
        const resultDesc = document.getElementById('result-diagnosis-desc');
        const whatsappBtn = document.getElementById('result-whatsapp-btn');

        resultEmoji.textContent = evaluation.emoji || '😊';
        resultTitle.textContent = evaluation.diagnosis;
        resultDesc.textContent = evaluation.description;

        // Limpiar clases de riesgo anteriores
        resultEmoji.className = 'mood-result-avatar';
        if (evaluation.riskLevel === 'alto') {
            resultEmoji.classList.add('alto');
            whatsappBtn.style.display = 'flex'; // Forzar botón de ayuda directa
        } else if (evaluation.riskLevel === 'medio') {
            resultEmoji.classList.add('medio');
            whatsappBtn.style.display = 'flex';
        } else {
            whatsappBtn.style.display = 'none'; // ocultar whatsapp si todo va bien
        }
    }

    document.getElementById('result-back-home-btn').addEventListener('click', () => {
        switchView('home');
    });

    document.getElementById('result-view-schedules-btn').addEventListener('click', () => {
        loadWellbeingView();
    });

    // --- VISTA 4: PERFIL ---
    function loadProfileView() {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-info').textContent = `${currentUser.career} &bull; ${currentUser.semester}`;
        document.getElementById('profile-avatar').textContent = getAvatarEmoji(currentUser.avatar);

        // Ocultar sub-paneles por defecto
        hideAllProfileSubpanels();
        
        // Cargar listas ocultas por defecto
        renderProfileInterests();
    }

    function hideAllProfileSubpanels() {
        const panels = document.querySelectorAll('#profile-subpanels-container .glass-panel');
        panels.forEach(p => p.classList.add('hidden'));
    }

    function toggleSubpanel(panelId) {
        const panel = document.getElementById(panelId);
        const isHidden = panel.classList.contains('hidden');
        
        hideAllProfileSubpanels();
        
        if (isHidden) {
            panel.classList.remove('hidden');
            // Hacer scroll hasta el panel
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Eventos de botones del perfil
    document.getElementById('profile-btn-interests').addEventListener('click', () => {
        toggleSubpanel('subpanel-interests');
    });
    
    document.getElementById('profile-btn-activities').addEventListener('click', () => {
        renderProfileActivities();
        toggleSubpanel('subpanel-activities');
    });

    document.getElementById('profile-btn-history').addEventListener('click', () => {
        renderProfileHistory();
        toggleSubpanel('subpanel-history');
    });

    document.getElementById('profile-btn-appointments').addEventListener('click', () => {
        renderProfileAppointments();
        toggleSubpanel('subpanel-appointments');
    });

    document.getElementById('profile-btn-guides').addEventListener('click', () => {
        renderProfileGuides();
        toggleSubpanel('subpanel-guides');
    });

    document.getElementById('profile-btn-logout').addEventListener('click', () => {
        if (confirm('¿Deseas salir de la órbita de AcompañaU?')) {
            auth.logout();
        }
    });

    // Sub-panel: Editar Intereses
    function renderProfileInterests() {
        const grid = document.getElementById('profile-interests-edit-list');
        grid.innerHTML = '';
        
        // Copiar intereses del usuario actual
        let currentInterests = [...currentUser.interests];

        INTEREST_CATEGORIES.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'interest-item';
            item.style.padding = '10px 14px';
            item.innerHTML = `
                <span class="interest-emoji" style="width:30px; height:30px; font-size:1.1rem;">${cat.emoji}</span>
                <span style="font-size:0.85rem;">${cat.name}</span>
            `;

            if (currentInterests.includes(cat.name)) {
                item.classList.add('selected');
            }

            item.addEventListener('click', () => {
                if (currentInterests.includes(cat.name)) {
                    currentInterests = currentInterests.filter(c => c !== cat.name);
                    item.classList.remove('selected');
                } else {
                    currentInterests.push(cat.name);
                    item.classList.add('selected');
                }
            });
            grid.appendChild(item);
        });

        // Configurar botón guardar
        const currentSaveBtn = document.getElementById('profile-save-interests-btn');
        // Remover listeners anteriores reemplazando el botón
        const newSaveBtn = currentSaveBtn.cloneNode(true);
        currentSaveBtn.parentNode.replaceChild(newSaveBtn, currentSaveBtn);

        newSaveBtn.addEventListener('click', () => {
            if (currentInterests.length === 0) {
                alert('Debes seleccionar al menos un interés.');
                return;
            }
            storage.updateStudent(currentUser.id, { interests: currentInterests });
            currentUser.interests = currentInterests;
            auth.setSession(currentUser);
            alert('¡Intereses estelares actualizados!');
            hideAllProfileSubpanels();
        });
    }

    // Sub-panel: Mis Actividades
    function renderProfileActivities() {
        const list = document.getElementById('profile-enrolled-activities-list');
        list.innerHTML = '';

        const activities = storage.getActivities();
        const enrolled = activities.filter(act => act.enrolled.includes(currentUser.id));

        if (enrolled.length === 0) {
            list.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-dust); padding:15px 0;">No estás inscrito en ninguna actividad actualmente. Explora las opciones disponibles.</p>`;
            return;
        }

        enrolled.forEach(act => {
            const card = document.createElement('div');
            card.className = 'activity-card-horizontal';
            card.innerHTML = `
                <img src="${act.image}" class="activity-img-thumb" style="width:50px; height:50px;">
                <div class="activity-card-body">
                    <h4 class="activity-card-title" style="font-size:0.8rem;">${act.title}</h4>
                    <span class="activity-card-time" style="font-size:0.65rem;">
                        📅 ${formatDateSpanish(act.date)} &bull; ${act.time.split(' - ')[0]}
                    </span>
                </div>
                <button class="cosmic-btn cosmic-btn-secondary" style="width:auto; padding:0 8px; font-size:0.85rem; border-color:rgba(255,59,48,0.3); color:#ff8e89;">&times;</button>
            `;
            
            // Anular inscripción
            card.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation(); // evitar abrir modal
                if (confirm(`¿Anular tu inscripción para: "${act.title}"?`)) {
                    storage.unenrollFromActivity(act.id, currentUser.id);
                    renderProfileActivities();
                }
            });

            // Abrir detalle
            card.addEventListener('click', () => {
                openActivityDrawer(act);
            });

            list.appendChild(card);
        });
    }

    // Sub-panel: Historial de Bienestar
    function renderProfileHistory() {
        const list = document.getElementById('profile-wellbeing-history-list');
        list.innerHTML = '';

        const history = storage.getWellbeingHistory().filter(log => log.studentId === currentUser.id);

        if (history.length === 0) {
            list.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-dust); padding:15px 0;">No has realizado diagnósticos de bienestar aún.</p>`;
            return;
        }

        // Ordenar del más reciente al más antiguo
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(log => {
            const row = document.createElement('div');
            row.className = 'tracker-bar-day';
            
            let moodEmoji = '😐';
            if (log.mood === 'muy-bien') moodEmoji = '😊';
            if (log.mood === 'bien') moodEmoji = '🙂';
            if (log.mood === 'regular') moodEmoji = '😐';
            if (log.mood === 'mal') moodEmoji = '🙁';
            if (log.mood === 'muy-mal') moodEmoji = '😩';

            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.2rem;">${moodEmoji}</span>
                    <div style="display:flex; flex-direction:column; text-align:left;">
                        <span style="font-weight:700; color:var(--text-stellar);">${formatDateSpanish(log.date)}</span>
                        <span style="font-size:0.68rem; color:var(--text-dust); line-height:1.2;">${log.notes}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:0.7rem; color:var(--text-dust);">Dif: ${log.difficulty}/10</span>
                    <span class="risk-dot ${log.riskLevel}" title="Riesgo ${log.riskLevel}"></span>
                </div>
            `;
            list.appendChild(row);
        });
    }

    // Sub-panel: Mis Citas
    function renderProfileAppointments() {
        const list = document.getElementById('profile-appointments-list');
        list.innerHTML = '';

        const appointments = storage.getAppointments().filter(app => app.studentId === currentUser.id && app.status === 'scheduled');

        if (appointments.length === 0) {
            list.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-dust); padding:15px 0;">No tienes citas activas agendadas.</p>`;
            return;
        }

        appointments.forEach(app => {
            const row = document.createElement('div');
            row.className = 'profile-option-row';
            row.style.background = 'rgba(255,255,255,0.01)';
            row.style.cursor = 'default';
            row.style.padding = '12px';
            row.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:4px; text-align:left; flex:1;">
                    <span style="font-weight:700; font-size:0.85rem; color:var(--cosmic-blue);">📅 ${formatDateSpanish(app.date)}</span>
                    <span style="font-size:0.75rem; color:var(--text-stellar);">⏰ ${app.time}</span>
                    <span style="font-size:0.68rem; color:var(--text-dust); line-height:1.2;">Motivo: ${app.reason}</span>
                </div>
                <button class="cosmic-btn cosmic-btn-secondary" style="width:auto; padding:6px 10px; font-size:0.75rem; border-color:rgba(255,59,48,0.3); color:#ff8e89;">
                    Cancelar
                </button>
            `;

            row.querySelector('button').addEventListener('click', () => {
                if (confirm(`¿Estás seguro de que deseas cancelar la cita del día ${formatDateSpanish(app.date)}?`)) {
                    storage.cancelAppointment(app.id);
                    renderProfileAppointments();
                }
            });

            list.appendChild(row);
        });
    }

    // Sub-panel: Biblioteca de Guías
    function renderProfileGuides() {
        const list = document.getElementById('profile-guides-list');
        list.innerHTML = '';

        const guides = storage.getGuides();

        guides.forEach(guide => {
            const item = document.createElement('div');
            item.className = 'glass-panel';
            item.style.padding = '12px 16px';
            item.style.borderColor = 'rgba(123, 97, 255, 0.15)';
            item.style.marginBottom = '0';
            item.innerHTML = `
                <div style="display:flex; justify-content:between; align-items:center; cursor:pointer;" class="guide-title-row">
                    <div style="text-align:left; flex:1;">
                        <span style="font-size:0.6rem; font-weight:700; color:var(--cosmic-pink); text-transform:uppercase;">${guide.category} &bull; ${guide.readingTime}</span>
                        <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-stellar); margin-top:2px;">${guide.title}</h4>
                    </div>
                    <span style="font-size:1.1rem; color:var(--cosmic-blue);" class="arrow">&plus;</span>
                </div>
                <div class="guide-content-area hidden" style="border-top:1px solid rgba(255,255,255,0.08); margin-top:10px; padding-top:10px; font-size:0.78rem; color:var(--text-dust); text-align:left; line-height:1.4;">
                    <p style="font-weight:600; color:var(--text-stellar); margin-bottom:8px;">${guide.summary}</p>
                    <div style="white-space: pre-wrap;">${guide.content}</div>
                </div>
            `;

            const titleRow = item.querySelector('.guide-title-row');
            const contentArea = item.querySelector('.guide-content-area');
            const arrow = item.querySelector('.arrow');

            titleRow.addEventListener('click', () => {
                const isHidden = contentArea.classList.contains('hidden');
                if (isHidden) {
                    contentArea.classList.remove('hidden');
                    arrow.innerHTML = '&minus;';
                    arrow.style.color = 'var(--cosmic-pink)';
                } else {
                    contentArea.classList.add('hidden');
                    arrow.innerHTML = '&plus;';
                    arrow.style.color = 'var(--cosmic-blue)';
                }
            });

            list.appendChild(item);
        });
    }

    // --- DETALLE DE ACTIVIDAD (DRAWER OVERLAY) ---
    const activityDrawer = document.getElementById('activity-detail-drawer');
    const drawerImg = document.getElementById('activity-drawer-img');
    const drawerCategory = document.getElementById('activity-drawer-category');
    const drawerTitle = document.getElementById('activity-drawer-title');
    const drawerDate = document.getElementById('activity-drawer-date');
    const drawerTime = document.getElementById('activity-drawer-time');
    const drawerLocation = document.getElementById('activity-drawer-location');
    const drawerSpots = document.getElementById('activity-drawer-spots');
    const drawerDesc = document.getElementById('activity-drawer-desc');

    function openActivityDrawer(activity) {
        drawerImg.src = activity.image;
        drawerCategory.textContent = activity.category;
        drawerTitle.textContent = activity.title;
        drawerDate.textContent = formatDateSpanish(activity.date);
        drawerTime.textContent = activity.time;
        drawerLocation.textContent = activity.location;
        drawerDesc.textContent = activity.description;
        
        updateDrawerActionBtn(activity);
        
        activityDrawer.classList.remove('hidden');
    }

    function updateDrawerActionBtn(activity) {
        const isEnrolled = activity.enrolled.includes(currentUser.id);
        const spotsLeft = activity.capacity - activity.enrolled.length;
        
        drawerSpots.textContent = `Cupos disponibles: ${spotsLeft} / ${activity.capacity}`;

        // CORRECCIÓN: Leer el botón actual del DOM cada vez para no perder la referencia
        const currentActionBtn = document.getElementById('activity-drawer-action-btn');

        // Reset click listener
        const newBtn = currentActionBtn.cloneNode(true);
        currentActionBtn.parentNode.replaceChild(newBtn, currentActionBtn);
        
        if (isEnrolled) {
            newBtn.innerHTML = '<span>Anular Inscripción</span>';
            newBtn.className = 'cosmic-btn cosmic-btn-secondary';
            newBtn.style.borderColor = 'rgba(255, 59, 48, 0.4)';
            newBtn.style.color = '#ff8e89';
            
            newBtn.addEventListener('click', () => {
                if (confirm('¿Seguro que deseas anular tu inscripción para este evento?')) {
                    const res = storage.unenrollFromActivity(activity.id, currentUser.id);
                    if (res.success) {
                        updateDrawerActionBtn(res.activity);
                        // Recargar listas tras cambios
                        if (currentActiveView === 'home') loadHomeView();
                        if (currentActiveView === 'explore') renderExploreResults(searchInput.value.trim().toLowerCase());
                    }
                }
            });
        } else {
            if (spotsLeft <= 0) {
                newBtn.innerHTML = '<span>Sin Cupos Disponibles</span>';
                newBtn.className = 'cosmic-btn cosmic-btn-secondary';
                newBtn.style.cursor = 'not-allowed';
                newBtn.style.opacity = '0.5';
                newBtn.disabled = true;
            } else {
                newBtn.innerHTML = '<span>Inscribirme en esta actividad</span>';
                newBtn.className = 'cosmic-btn';
                newBtn.disabled = false;
                
                newBtn.addEventListener('click', () => {
                    const res = storage.enrollInActivity(activity.id, currentUser.id);
                    if (res.success) {
                        alert('¡Felicidades, te has inscrito con éxito en la actividad! 🚀');
                        updateDrawerActionBtn(res.activity);
                        // Recargar listas tras cambios
                        if (currentActiveView === 'home') loadHomeView();
                        if (currentActiveView === 'explore') renderExploreResults(searchInput.value.trim().toLowerCase());
                    }
                });
            }
        }
    }

    document.getElementById('btn-close-activity-drawer').addEventListener('click', () => {
        activityDrawer.classList.add('hidden');
    });

    // --- FUNCIONES HELPER / FORMATO ---
    function getAvatarEmoji(avatarKey) {
        const mapping = {
            astronaut: "👨‍🚀",
            rocket: "🚀",
            planet: "🪐",
            alien: "👽",
            comet: "☄️",
            satellite: "🛰️",
            monster: "👾",
            telescope: "🔭"
        };
        return mapping[avatarKey] || "👨‍🚀";
    }

    function formatDateSpanish(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[0];

        const monthNames = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];
        return `${day} ${monthNames[monthIndex]}, ${year}`;
    }
}