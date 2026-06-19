// Controlador del Panel de Administración - AcompañaU
import { auth } from './auth.js';
import { storage } from './storage.js';

// Validar que el usuario es administrador
if (auth.checkAdmin()) {
    document.addEventListener('DOMContentLoaded', initAdmin);
}

function initAdmin() {
    const currentAdmin = auth.getCurrentUser();
    
    // Estado de la interfaz
    let currentActiveTab = 'dashboard';
    let currentSelectedStudentId = null;
    let currentSelectedAlertId = null;
    let studentDrawerTab = 'history'; // history, notes
    let testQuestionsCount = 0;

    // Elementos del DOM
    const pageTitleEl = document.getElementById('admin-page-title');
    const adminNameEl = document.getElementById('admin-user-name');
    const sidebarItems = document.querySelectorAll('.sidebar-menu-item');
    const sections = {
        dashboard: document.getElementById('admin-target-dashboard'),
        alerts: document.getElementById('admin-target-alerts'),
        students: document.getElementById('admin-target-students'),
        editor: document.getElementById('admin-target-editor'),
        reports: document.getElementById('admin-target-reports')
    };

    // Configurar nombre
    if (adminNameEl) {
        adminNameEl.textContent = currentAdmin.name;
    }

    // --- ENRUTAMIENTO BARRA LATERAL ---
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchTab(target);
        });
    });

    function switchTab(tabName) {
        currentActiveTab = tabName;
        
        // Actualizar sidebar activa
        sidebarItems.forEach(item => {
            if (item.getAttribute('data-target') === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Alternar visibilidad de secciones
        Object.keys(sections).forEach(key => {
            if (sections[key]) {
                if (key === tabName) {
                    sections[key].classList.remove('hidden');
                } else {
                    sections[key].classList.add('hidden');
                }
            }
        });

        // Configurar título del encabezado
        const titleMapping = {
            dashboard: "Dashboard de Control Estelar",
            alerts: "Monitoreo y Seguimiento de Alertas de Riesgo",
            students: "Directorio General de Campers",
            editor: "Gestor de Contenido: Guías y Pruebas del Sistema Experto",
            reports: "Análisis y Reportes de Salud Mental"
        };
        pageTitleEl.textContent = titleMapping[tabName] || "Administración";

        // Cargar datos correspondientes
        if (tabName === 'dashboard') {
            loadDashboardData();
        } else if (tabName === 'alerts') {
            loadAlertsData();
        } else if (tabName === 'students') {
            loadStudentsData();
        } else if (tabName === 'editor') {
            loadEditorData();
        } else if (tabName === 'reports') {
            loadReportsData();
        }
    }

    // Cargar datos iniciales por defecto al arrancar
    loadDashboardData();

    // Cierre de sesión
    document.getElementById('admin-logout-btn').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión como administrador?')) {
            auth.logout();
        }
    });

    // --- SECCIÓN 1: DASHBOARD ---
    function loadDashboardData() {
        // Cargar contadores métricos
        const alerts = storage.getAlerts().filter(a => a.status === 'active');
        const students = storage.getStudents();
        const appointments = storage.getAppointments().filter(app => app.status === 'scheduled');
        const activities = storage.getActivities();
        const guides = storage.getGuides();

        // Estudiantes en riesgo (aquellos con logs críticos o alertas activas)
        const uniqueRiskStudents = new Set(alerts.map(a => a.studentId));

        document.getElementById('stat-active-alerts').textContent = alerts.length;
        document.getElementById('stat-students-risk').textContent = uniqueRiskStudents.size;
        
        // Consultas para hoy (citas en la fecha actual)
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(app => app.date === todayStr);
        document.getElementById('stat-consultations').textContent = todayAppts.length;
        document.getElementById('stat-activities').textContent = activities.length;

        // Renderizar tabla rápida de alertas en el Dashboard
        const dashAlertsTable = document.getElementById('dash-alerts-table-body');
        dashAlertsTable.innerHTML = '';

        // Mostrar las 5 más recientes
        const recentAlerts = [...alerts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (recentAlerts.length === 0) {
            dashAlertsTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dust);">No hay alertas de riesgo activas en la galaxia. 🌌</td></tr>`;
        } else {
            recentAlerts.forEach(al => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size:0.8rem; color:var(--text-dust);">${formatDateTime(al.date)}</td>
                    <td style="font-weight:700;">${al.studentName}</td>
                    <td><span class="admin-badge ${al.riskLevel}">${al.riskLevel}</span></td>
                    <td style="font-size:0.8rem; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${al.reason}">${al.reason}</td>
                    <td><button class="cosmic-btn btn-manage-alert" data-id="${al.id}" style="padding:4px 8px; font-size:0.75rem; width:auto;">Gestionar</button></td>
                `;
                dashAlertsTable.appendChild(tr);
            });

            // Registrar clicks
            dashAlertsTable.querySelectorAll('.btn-manage-alert').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const alertId = e.target.getAttribute('data-id');
                    openAlertDrawer(alertId);
                });
            });
        }

        // Renderizar lista rápida de citas próximas
        const dashApptsList = document.getElementById('dash-appointments-list');
        dashApptsList.innerHTML = '';

        // Siguiente agenda ordenada
        const upcomingAppts = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);

        if (upcomingAppts.length === 0) {
            dashApptsList.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-dust); padding:10px 0;">No hay citas agendadas próximamente.</p>`;
        } else {
            upcomingAppts.forEach(app => {
                const student = students.find(s => s.id === app.studentId);
                const item = document.createElement('div');
                item.className = 'profile-option-row';
                item.style.padding = '10px 12px';
                item.style.background = 'rgba(255,255,255,0.01)';
                item.style.cursor = 'default';
                item.style.marginBottom = '0';
                item.innerHTML = `
                    <div style="text-align:left; font-size:0.8rem;">
                        <div style="font-weight:700; color:var(--cosmic-blue);">${student ? student.name : 'Estudiante'}</div>
                        <div style="color:var(--text-stellar); font-size:0.75rem; margin-top:2px;">📅 ${formatDateSpanish(app.date)} &bull; ⏰ ${app.time}</div>
                        <div style="color:var(--text-dust); font-size:0.68rem; margin-top:1px; line-height:1.2;">Motivo: ${app.reason}</div>
                    </div>
                `;
                dashApptsList.appendChild(item);
            });
        }
    }

    // Botón rápida de ver todo en dashboard
    document.getElementById('dash-view-all-alerts-btn').addEventListener('click', () => {
        switchTab('alerts');
    });

    // --- SECCIÓN 2: GESTIÓN DE CASOS Y ALERTAS ---
    function loadAlertsData() {
        const alertsTable = document.getElementById('alerts-table-body');
        alertsTable.innerHTML = '';

        const alerts = storage.getAlerts().filter(a => a.status === 'active');

        if (alerts.length === 0) {
            alertsTable.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dust); padding:20px 0;">No se registran alertas activas en el campus. ¡Excelente clima escolar! ☀️</td></tr>`;
            return;
        }

        alerts.forEach(al => {
            // Calcular porcentaje del protocolo completado
            let stepsCount = 0;
            if (al.actions.contacted) stepsCount++;
            if (al.actions.evaluated) stepsCount++;
            if (al.actions.protocolActive) stepsCount++;
            const pct = Math.round((stepsCount / 3) * 100);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:0.8rem; color:var(--text-dust);">${formatDateTime(al.date)}</td>
                <td style="font-weight:700;">${al.studentName}</td>
                <td style="font-size:0.8rem;">${al.career} (${al.semester})</td>
                <td><span class="admin-badge ${al.riskLevel}">${al.riskLevel}</span></td>
                <td style="font-size:0.8rem; max-width:250px; line-height:1.3;" title="${al.reason}">${al.reason}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="flex:1; width:50px; background:#1b203c; height:5px; border-radius:2px; overflow:hidden;">
                            <div style="width:${pct}%; background:var(--cosmic-blue); height:100%;"></div>
                        </div>
                        <span style="font-size:0.75rem; font-weight:700;">${pct}%</span>
                    </div>
                </td>
                <td>
                    <button class="cosmic-btn btn-manage-alert" data-id="${al.id}" style="padding:4px 8px; font-size:0.75rem; width:auto;">Atender</button>
                </td>
            `;
            alertsTable.appendChild(tr);
        });

        alertsTable.querySelectorAll('.btn-manage-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.target.getAttribute('data-id');
                openAlertDrawer(alertId);
            });
        });
    }

    // --- SECCIÓN 3: DIRECTORIO ESTUDIANTIL ---
    const studentsSearchInput = document.getElementById('students-search-input');
    studentsSearchInput.addEventListener('input', () => {
        loadStudentsData(studentsSearchInput.value.trim().toLowerCase());
    });

    function loadStudentsData(searchQuery = '') {
        const tableBody = document.getElementById('students-table-body');
        tableBody.innerHTML = '';

        let students = storage.getStudents();
        const alerts = storage.getAlerts().filter(a => a.status === 'active');

        if (searchQuery) {
            students = students.filter(s => 
                s.name.toLowerCase().includes(searchQuery) ||
                s.career.toLowerCase().includes(searchQuery) ||
                s.email.toLowerCase().includes(searchQuery)
            );
        }

        if (students.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dust); padding:15px 0;">No se encontraron campers registrados.</td></tr>`;
            return;
        }

        students.forEach(st => {
            // Verificar si tiene alertas activas
            const studentAlerts = alerts.filter(a => a.studentId === st.id);
            let riskLevelBadge = `<span class="risk-dot bajo" title="Sin alertas activas"></span>`;
            if (studentAlerts.some(a => a.riskLevel === 'alto')) {
                riskLevelBadge = `<span class="risk-dot alto" title="Riesgo Alto activo"></span>`;
            } else if (studentAlerts.some(a => a.riskLevel === 'medio')) {
                riskLevelBadge = `<span class="risk-dot medio" title="Riesgo Medio activo"></span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:1.5rem; text-align:center;">${getAvatarEmoji(st.avatar)}</td>
                <td style="font-weight:700; display:flex; align-items:center; gap:8px;">
                    ${st.name} ${riskLevelBadge}
                </td>
                <td style="font-size:0.8rem; color:var(--text-dust);">${st.email}</td>
                <td>${st.career}</td>
                <td style="font-size:0.8rem;">${st.semester}</td>
                <td style="font-size:0.75rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${st.interests ? st.interests.join(', ') : 'Ninguno'}
                </td>
                <td>
                    <button class="cosmic-btn btn-view-student" data-id="${st.id}" style="padding:4px 8px; font-size:0.75rem; width:auto; background:var(--cosmic-purple);">Dossier</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll('.btn-view-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.target.getAttribute('data-id');
                openStudentDrawer(studentId);
            });
        });
    }

    // --- SECCIÓN 4: GESTIONAR GUÍAS Y TESTS ---
    const tabEditorGuide = document.getElementById('tab-editor-guide');
    const tabEditorTest = document.getElementById('tab-editor-test');
    const guideForm = document.getElementById('editor-guide-form');
    const testForm = document.getElementById('editor-test-form');

    tabEditorGuide.addEventListener('click', () => {
        tabEditorGuide.classList.add('active');
        tabEditorTest.classList.remove('active');
        guideForm.classList.remove('hidden');
        testForm.classList.add('hidden');
    });

    tabEditorTest.addEventListener('click', () => {
        tabEditorTest.classList.add('active');
        tabEditorGuide.classList.remove('active');
        testForm.classList.remove('hidden');
        guideForm.classList.add('hidden');
        
        // Inicializar creador de preguntas si está vacío
        if (testQuestionsCount === 0) {
            addQuestionToBuilder();
        }
    });

    // Añadir pregunta en formulario de Test
    document.getElementById('btn-add-question-to-test').addEventListener('click', () => {
        addQuestionToBuilder();
    });

    function addQuestionToBuilder() {
        testQuestionsCount++;
        const container = document.getElementById('test-questions-builder-list');

        const card = document.createElement('div');
        card.className = 'question-creator-card';
        card.id = `q-card-${testQuestionsCount}`;
        card.innerHTML = `
            <button type="button" class="delete-question-btn" data-id="${testQuestionsCount}">&times;</button>
            <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label" style="font-size:0.75rem;">Pregunta ${testQuestionsCount}</label>
                <input type="text" class="form-input q-text" style="padding:8px 12px; font-size:0.85rem;" placeholder="Escribe el enunciado de la pregunta..." required>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:grid; grid-template-columns: 3fr 1fr; gap:10px;">
                    <input type="text" class="form-input opt1-text" style="padding:6px 10px; font-size:0.8rem;" placeholder="Opción A (Bajo Estrés)" required>
                    <input type="number" class="form-input opt1-pts" style="padding:6px 10px; font-size:0.8rem;" placeholder="Puntos" required value="1">
                </div>
                <div style="display:grid; grid-template-columns: 3fr 1fr; gap:10px;">
                    <input type="text" class="form-input opt2-text" style="padding:6px 10px; font-size:0.8rem;" placeholder="Opción B (Medio Estrés)" required>
                    <input type="number" class="form-input opt2-pts" style="padding:6px 10px; font-size:0.8rem;" placeholder="Puntos" required value="2">
                </div>
                <div style="display:grid; grid-template-columns: 3fr 1fr; gap:10px;">
                    <input type="text" class="form-input opt3-text" style="padding:6px 10px; font-size:0.8rem;" placeholder="Opción C (Alto Estrés)" required>
                    <input type="number" class="form-input opt3-pts" style="padding:6px 10px; font-size:0.8rem;" placeholder="Puntos" required value="3">
                </div>
            </div>
        `;

        // Añadir lógica de eliminación
        card.querySelector('.delete-question-btn').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const targetCard = document.getElementById(`q-card-${id}`);
            if (targetCard) {
                targetCard.remove();
            }
        });

        container.appendChild(card);
    }

    // Publicar Guía
    guideForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('guide-title').value.trim();
        const category = document.getElementById('guide-category').value;
        const readingTime = document.getElementById('guide-time').value.trim();
        const summary = document.getElementById('guide-summary').value.trim();
        const content = document.getElementById('guide-content').value.trim();

        const guide = { title, category, readingTime, summary, content };
        storage.saveGuide(guide);

        alert('¡Nueva guía publicada con éxito en el portal estudiantil! 📖');
        guideForm.reset();
        loadEditorData();
    });

    // Publicar Test
    testForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('test-title').value.trim();
        const description = document.getElementById('test-desc').value.trim();

        const questionCards = document.querySelectorAll('.question-creator-card');
        if (questionCards.length === 0) {
            alert('Por favor agrega al menos una pregunta al test experto.');
            return;
        }

        const questions = [];
        questionCards.forEach((card, idx) => {
            const qText = card.querySelector('.q-text').value.trim();
            const opt1T = card.querySelector('.opt1-text').value.trim();
            const opt1P = parseInt(card.querySelector('.opt1-pts').value, 10);
            const opt2T = card.querySelector('.opt2-text').value.trim();
            const opt2P = parseInt(card.querySelector('.opt2-pts').value, 10);
            const opt3T = card.querySelector('.opt3-text').value.trim();
            const opt3P = parseInt(card.querySelector('.opt3-pts').value, 10);

            questions.push({
                id: `q${idx + 1}`,
                text: qText,
                options: [
                    { text: opt1T, points: opt1P },
                    { text: opt2T, points: opt2P },
                    { text: opt3T, points: opt3P }
                ]
            });
        });

        // Gargar reglas
        const lowMax = parseInt(document.getElementById('rule-low-max').value, 10);
        const lowDiag = document.getElementById('rule-low-diag').value.trim();
        const medMax = parseInt(document.getElementById('rule-med-max').value, 10);
        const medDiag = document.getElementById('rule-med-diag').value.trim();
        const highMax = parseInt(document.getElementById('rule-high-max').value, 10);
        const highDiag = document.getElementById('rule-high-diag').value.trim();

        const rules = [
            { maxScore: lowMax, diagnosis: lowDiag, description: "Balance y tranquilidad académica.", riskLevel: "bajo" },
            { maxScore: medMax, diagnosis: medDiag, description: "Niveles moderados, se sugiere recreación lúdica.", riskLevel: "medio" },
            { maxScore: highMax, diagnosis: highDiag, description: "Soporte psicológico prioritario recomendado.", riskLevel: "alto" }
        ];

        const test = {
            title,
            description,
            questions,
            rules
        };

        storage.saveTest(test);
        alert('¡Nuevo Test Experto de Opción Múltiple publicado con éxito! 🧠');
        
        // Reset
        testForm.reset();
        document.getElementById('test-questions-builder-list').innerHTML = '';
        testQuestionsCount = 0;
        loadEditorData();
    });

    function loadEditorData() {
        // Renderizar guías activas en barra derecha
        const guidesList = document.getElementById('editor-guides-list');
        guidesList.innerHTML = '';
        const guides = storage.getGuides();
        guides.forEach(g => {
            const div = document.createElement('div');
            div.className = 'schedule-item';
            div.style.padding = '8px 12px';
            div.innerHTML = `
                <div style="text-align:left; font-size:0.75rem;">
                    <strong>${g.title}</strong>
                    <div style="color:var(--cosmic-pink); font-size:0.65rem;">${g.category} &bull; ${g.readingTime}</div>
                </div>
            `;
            guidesList.appendChild(div);
        });

        // Renderizar tests activos en barra derecha
        const testsList = document.getElementById('editor-tests-list');
        testsList.innerHTML = '';
        const tests = storage.getTests();
        tests.forEach(t => {
            const div = document.createElement('div');
            div.className = 'schedule-item';
            div.style.padding = '8px 12px';
            div.innerHTML = `
                <div style="text-align:left; font-size:0.75rem;">
                    <strong>${t.title}</strong>
                    <div style="color:var(--cosmic-blue); font-size:0.65rem;">${t.questions.length} preguntas de opción múltiple</div>
                </div>
            `;
            testsList.appendChild(div);
        });
    }

    // --- SECCIÓN 5: INFORMES Y GRÁFICOS (SVG DINÁMICO) ---
    function loadReportsData() {
        const history = storage.getWellbeingHistory();
        
        // 1. Estadísticas de riesgos (alto, medio, bajo) en los logs más recientes por estudiante
        const students = storage.getStudents();
        let highCount = 0;
        let medCount = 0;
        let lowCount = 0;

        students.forEach(st => {
            const studentLogs = history.filter(h => h.studentId === st.id);
            if (studentLogs.length > 0) {
                // Ordenar por fecha para tener la última evaluación
                const sortedLogs = [...studentLogs].sort((a,b) => new Date(b.date) - new Date(a.date));
                const lastRisk = sortedLogs[0].riskLevel;
                if (lastRisk === 'alto') highCount++;
                else if (lastRisk === 'medio') medCount++;
                else lowCount++;
            } else {
                lowCount++; // Sin registros = bajo riesgo por defecto
            }
        });

        // Dibujar gráfico SVG de riesgos (Telemetría circular radial de 3 anillos)
        const totalReport = highCount + medCount + lowCount;
        const highPct = totalReport > 0 ? Math.round((highCount / totalReport) * 100) : 0;
        const medPct = totalReport > 0 ? Math.round((medCount / totalReport) * 100) : 0;
        const lowPct = totalReport > 0 ? Math.round((lowCount / totalReport) * 100) : 100;

        const riskContainer = document.getElementById('chart-container-risk');
        
        // Fórmulas de stroke-dashoffset para circunferencia de 251.2
        const getOffset = (pct) => 251.2 - (251.2 * pct / 100);

        riskContainer.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                <!-- Ring 1: Low Risk (Green Aurora) -->
                <circle cx="50" cy="50" r="40" stroke="#102a27" stroke-width="6" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="var(--aurora-green)" stroke-width="6" fill="transparent"
                        stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="${getOffset(lowPct)}" 
                        style="filter: drop-shadow(0 0 3px rgba(0, 229, 163, 0.4));" />
                
                <!-- Ring 2: Medium Risk (Nova Orange) -->
                <circle cx="50" cy="50" r="30" stroke="#2d1d0f" stroke-width="6" fill="transparent" />
                <circle cx="50" cy="50" r="30" stroke="var(--nova-orange)" stroke-width="6" fill="transparent"
                        stroke-linecap="round" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - (188.4 * medPct / 100)}" 
                        style="filter: drop-shadow(0 0 3px rgba(255, 145, 0, 0.4));" />
                
                <!-- Ring 3: High Risk (Supernova Red) -->
                <circle cx="50" cy="50" r="20" stroke="#2d0f11" stroke-width="6" fill="transparent" />
                <circle cx="50" cy="50" r="20" stroke="var(--supernova-red)" stroke-width="6" fill="transparent"
                        stroke-linecap="round" stroke-dasharray="125.6" stroke-dashoffset="${125.6 - (125.6 * highPct / 100)}" 
                        style="filter: drop-shadow(0 0 3px rgba(255, 59, 48, 0.4));" />
            </svg>
        `;

        // Leyenda explicativa con porcentajes
        const riskLegend = document.getElementById('chart-legend-risk');
        riskLegend.innerHTML = `
            <div class="legend-item"><span class="legend-color" style="background: var(--supernova-red);"></span><span>Riesgo Alto: ${highCount} (${highPct}%)</span></div>
            <div class="legend-item"><span class="legend-color" style="background: var(--nova-orange);"></span><span>Riesgo Medio: ${medCount} (${medPct}%)</span></div>
            <div class="legend-item"><span class="legend-color" style="background: var(--aurora-green);"></span><span>Riesgo Bajo: ${lowCount} (${lowPct}%)</span></div>
        `;

        // 2. Gráfico de inscripciones en actividades
        const activities = storage.getActivities();
        const activitiesContainer = document.getElementById('chart-container-activities');

        if (activities.length === 0) {
            activitiesContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-dust);">No hay actividades para reportar.</p>`;
            return;
        }

        // Obtener top actividades y cantidad de inscritos
        const barData = activities.map(act => ({
            title: act.title.split(':')[0], // primer trozo de título
            count: act.enrolled.length
        })).slice(0, 5); // limitar a 5

        const maxCount = Math.max(...barData.map(d => d.count), 1); // evitar div por 0
        const chartWidth = 320;
        const chartHeight = 150;
        const barSpacing = 60;
        const barWidth = 30;

        let barsSvg = '';
        barData.forEach((d, idx) => {
            const h = (d.count / maxCount) * 100;
            const x = 30 + idx * barSpacing;
            const y = chartHeight - h - 30; // dejar margen inferior de 30px para textos

            barsSvg += `
                <!-- Barra -->
                <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="url(#blue-pink-gradient)" 
                      style="filter: drop-shadow(0 0 5px rgba(123, 97, 255, 0.3));" />
                <!-- Valor encima de la barra -->
                <text x="${x + barWidth/2}" y="${y - 6}" font-size="9" fill="white" font-weight="bold" text-anchor="middle">${d.count}</text>
                <!-- Nombre abreviado en eje X -->
                <text x="${x + barWidth/2}" y="${chartHeight - 14}" font-size="8" fill="var(--text-dust)" text-anchor="middle">${d.title.substring(0, 10)}..</text>
            `;
        });

        activitiesContainer.innerHTML = `
            <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">
                <defs>
                    <linearGradient id="blue-pink-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="var(--cosmic-purple)" />
                        <stop offset="100%" stop-color="var(--cosmic-pink)" />
                    </linearGradient>
                </defs>
                <!-- Línea de base -->
                <line x1="10" y1="${chartHeight - 28}" x2="${chartWidth - 10}" y2="${chartHeight - 28}" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
                ${barsSvg}
            </svg>
        `;
    }

    // --- EXPEDIENTE ESTUDIANTE DRAWER ---
    const studentDrawer = document.getElementById('student-detail-drawer');
    
    function openStudentDrawer(studentId) {
        currentSelectedStudentId = studentId;
        const student = storage.getStudents().find(s => s.id === studentId);
        
        if (!student) return;

        document.getElementById('drawer-student-avatar').textContent = getAvatarEmoji(student.avatar);
        document.getElementById('drawer-student-name').textContent = student.name;
        document.getElementById('drawer-student-career').textContent = `${student.career} &bull; ${student.semester}`;

        // Intereses tags
        const interestsContainer = document.getElementById('drawer-student-interests');
        interestsContainer.innerHTML = '';
        
        if (student.interests && student.interests.length > 0) {
            student.interests.forEach(int => {
                const span = document.createElement('span');
                span.className = 'student-badge';
                span.style.fontSize = '0.65rem';
                span.style.padding = '3px 8px';
                span.textContent = int;
                interestsContainer.appendChild(span);
            });
        } else {
            interestsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-dust);">No tiene intereses configurados.</span>`;
        }

        // Cargar pestañas por defecto
        selectDrawerTab('history');
        studentDrawer.classList.add('open');
    }

    document.getElementById('btn-close-student-drawer').addEventListener('click', () => {
        studentDrawer.classList.remove('open');
        currentSelectedStudentId = null;
    });

    const btnTabHistory = document.getElementById('btn-tab-drawer-history');
    const btnTabNotes = document.getElementById('btn-tab-drawer-notes');
    const contentHistory = document.getElementById('drawer-tab-content-history');
    const contentNotes = document.getElementById('drawer-tab-content-notes');

    btnTabHistory.addEventListener('click', () => selectDrawerTab('history'));
    btnTabNotes.addEventListener('click', () => selectDrawerTab('notes'));

    function selectDrawerTab(tab) {
        studentDrawerTab = tab;
        if (tab === 'history') {
            btnTabHistory.classList.add('active');
            btnTabNotes.classList.remove('active');
            contentHistory.classList.remove('hidden');
            contentNotes.classList.add('hidden');
            renderStudentDrawerHistory();
        } else {
            btnTabNotes.classList.add('active');
            btnTabHistory.classList.remove('active');
            contentNotes.classList.remove('hidden');
            contentHistory.classList.add('hidden');
            renderStudentDrawerNotes();
        }
    }

    function renderStudentDrawerHistory() {
        const list = document.getElementById('drawer-student-mood-logs');
        list.innerHTML = '';

        const logs = storage.getWellbeingHistory().filter(log => log.studentId === currentSelectedStudentId);

        if (logs.length === 0) {
            list.innerHTML = `<p style="font-size:0.75rem; color:var(--text-dust); padding:10px 0;">No se registran diagnósticos previos para este estudiante.</p>`;
            return;
        }

        const sorted = [...logs].sort((a,b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(log => {
            const div = document.createElement('div');
            div.className = 'tracker-bar-day';
            div.style.background = 'rgba(255,255,255,0.01)';
            div.style.padding = '8px 10px';
            
            let emoji = '😐';
            if (log.mood === 'muy-bien') emoji = '😊';
            if (log.mood === 'bien') emoji = '🙂';
            if (log.mood === 'regular') emoji = '😐';
            if (log.mood === 'mal') emoji = '🙁';
            if (log.mood === 'muy-mal') emoji = '😩';

            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">${emoji}</span>
                    <div style="text-align:left;">
                        <span style="font-weight:700; font-size:0.8rem;">${formatDateSpanish(log.date)}</span>
                        <div style="font-size:0.7rem; color:var(--text-dust); line-height:1.2; margin-top:1px;">${log.notes}</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:0.7rem; color:var(--text-dust);">Dif: ${log.difficulty}/10</span>
                    <span class="risk-dot ${log.riskLevel}"></span>
                </div>
            `;
            list.appendChild(div);
        });
    }

    function renderStudentDrawerNotes() {
        const list = document.getElementById('drawer-student-case-notes');
        list.innerHTML = '';

        // Cargar notas de seguimiento de LocalStorage
        const allNotes = JSON.parse(localStorage.getItem('acompanau_student_notes')) || [];
        const studentNotes = allNotes.filter(n => n.studentId === currentSelectedStudentId);

        if (studentNotes.length === 0) {
            list.innerHTML = `<p style="font-size:0.75rem; color:var(--text-dust); padding:10px 0;">No se registran notas de seguimiento aún.</p>`;
            return;
        }

        const sorted = [...studentNotes].sort((a,b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(note => {
            const item = document.createElement('div');
            item.className = 'glass-panel';
            item.style.padding = '10px 12px';
            item.style.borderColor = 'rgba(255,255,255,0.05)';
            item.style.marginBottom = '8px';
            item.innerHTML = `
                <div style="font-size:0.7rem; color:var(--cosmic-pink); font-weight:bold; margin-bottom:4px; text-align:left;">
                    Escrito por: ${note.author} &bull; ${formatDateTime(note.date)}
                </div>
                <p style="font-size:0.78rem; line-height:1.3; color:var(--text-stellar); margin-bottom:0; text-align:left;">
                    ${note.text}
                </p>
            `;
            list.appendChild(item);
        });
    }

    // Guardar Nota de Seguimiento
    document.getElementById('drawer-save-note-btn').addEventListener('click', () => {
        const txtInput = document.getElementById('drawer-new-note-text');
        const text = txtInput.value.trim();

        if (!text) {
            alert('Por favor escribe el contenido de la nota.');
            return;
        }

        const allNotes = JSON.parse(localStorage.getItem('acompanau_student_notes')) || [];
        const note = {
            id: "note-" + Date.now(),
            studentId: currentSelectedStudentId,
            author: currentAdmin.name,
            text,
            date: new Date().toISOString()
        };

        allNotes.push(note);
        localStorage.setItem('acompanau_student_notes', JSON.stringify(allNotes));
        
        txtInput.value = '';
        renderStudentDrawerNotes();
    });

    // --- GESTIÓN DE ALERTAS DRAWER ---
    const alertDrawer = document.getElementById('alert-detail-drawer');
    const checkContacted = document.getElementById('protocol-contacted');
    const checkEvaluated = document.getElementById('protocol-evaluated');
    const checkActive = document.getElementById('protocol-active');
    const alertResolutionText = document.getElementById('alert-drawer-resolution-notes');

    function openAlertDrawer(alertId) {
        currentSelectedAlertId = alertId;
        const alerts = storage.getAlerts();
        const alertObj = alerts.find(a => a.id === alertId);

        if (!alertObj) return;

        document.getElementById('alert-drawer-name').textContent = alertObj.studentName;
        document.getElementById('alert-drawer-reason').textContent = alertObj.reason;
        document.getElementById('alert-drawer-date').textContent = `Reportado: ${formatDateTime(alertObj.date)}`;

        const riskBadge = document.getElementById('alert-drawer-risk-badge');
        riskBadge.className = `admin-badge ${alertObj.riskLevel}`;
        riskBadge.textContent = `Riesgo ${alertObj.riskLevel}`;

        // Cargar checkboxes del protocolo
        checkContacted.checked = alertObj.actions.contacted || false;
        checkEvaluated.checked = alertObj.actions.evaluated || false;
        checkActive.checked = alertObj.actions.protocolActive || false;
        
        alertResolutionText.value = alertObj.notes || '';

        alertDrawer.classList.add('open');
    }

    document.getElementById('btn-close-alert-drawer').addEventListener('click', () => {
        alertDrawer.classList.remove('open');
        currentSelectedAlertId = null;
    });

    // Actualizar Avance de Alerta
    document.getElementById('alert-drawer-save-btn').addEventListener('click', () => {
        if (!currentSelectedAlertId) return;

        const updatedData = {
            actions: {
                contacted: checkContacted.checked,
                evaluated: checkEvaluated.checked,
                protocolActive: checkActive.checked
            },
            notes: alertResolutionText.value.trim()
        };

        storage.updateAlert(currentSelectedAlertId, updatedData);
        alert('¡Avances de protocolo actualizados!');
        alertDrawer.classList.remove('open');
        
        // Recargar datos activos de la vista
        if (currentActiveTab === 'dashboard') loadDashboardData();
        else if (currentActiveTab === 'alerts') loadAlertsData();
    });

    // Resolver Alerta Definitivamente (Archivar caso)
    document.getElementById('alert-drawer-resolve-btn').addEventListener('click', () => {
        if (!currentSelectedAlertId) return;

        if (confirm('¿Resolver y archivar esta alerta de riesgo definitivamente?')) {
            const updatedData = {
                status: 'resolved',
                actions: {
                    contacted: checkContacted.checked,
                    evaluated: checkEvaluated.checked,
                    protocolActive: checkActive.checked
                },
                notes: alertResolutionText.value.trim() || 'Alerta resuelta satisfactoriamente por el equipo psicopedagógico.'
            };

            storage.updateAlert(currentSelectedAlertId, updatedData);
            alert('¡La alerta ha sido resuelta y archivada con éxito!');
            alertDrawer.classList.remove('open');

            // Recargar datos activos de la vista
            if (currentActiveTab === 'dashboard') loadDashboardData();
            else if (currentActiveTab === 'alerts') loadAlertsData();
        }
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

    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const month = monthNames[date.getMonth()];
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');

        return `${day} ${month}, ${hrs}:${mins}`;
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
