import { surveyQuestions, evaluateMood, filterEvents } from './expertSystem.js';

// Estado de la aplicación
let currentQuestionIndex = 0;
let userResponses = {};

// Selectores del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const surveyScreen = document.getElementById('survey-screen');
const resultsScreen = document.getElementById('results-screen');
const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const moodDiagnosis = document.getElementById('mood-diagnosis');
const moodDescription = document.getElementById('mood-description');
const eventsGrid = document.getElementById('events-grid');

// Botones de control de flujo
document.getElementById('start-survey-btn').addEventListener('click', startSurvey);
document.getElementById('retry-btn').addEventListener('click', restartApp);

function startSurvey() {
    welcomeScreen.classList.add('hidden');
    surveyScreen.classList.remove('hidden');
    currentQuestionIndex = 0;
    userResponses = {};
    renderQuestion();
}

function renderQuestion() {
    const currentQuestion = surveyQuestions[currentQuestionIndex];
    
    // Actualizar barra de progreso
    const progressPercent = ((currentQuestionIndex) / surveyQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Generar estructura HTML de la pregunta
    questionContainer.innerHTML = `
        <h2>${currentQuestion.text}</h2>
        <div class="options-list">
            ${currentQuestion.options.map((option, idx) => `
                <button class="option-btn" data-value="${option.value}">
                    ${option.text}
                </button>
            `).join('')}
        </div>
    `;

    // Escuchar selección de respuesta
    const optionButtons = questionContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedValue = e.target.getAttribute('data-value');
            userResponses[currentQuestion.id] = selectedValue;
            nextQuestion();
        });
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < surveyQuestions.length) {
        renderQuestion();
    } else {
        processExpertSystemResults();
    }
}

function processExpertSystemResults() {
    progressBar.style.width = '100%';
    surveyScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    // Ejecutar Motor de Inferencia
    const evaluation = evaluateMood(userResponses);
    
    // Renderizar Diagnóstico
    moodDiagnosis.textContent = evaluation.mood;
    moodDescription.textContent = evaluation.description;

    // Filtrar y Renderizar Eventos
    const recommendedEvents = filterEvents(evaluation.targetTag);
    renderEvents(recommendedEvents);
}

function renderEvents(events) {
    eventsGrid.innerHTML = '';
    
    if (events.length === 0) {
        eventsGrid.innerHTML = `<p class="text-center">No hay eventos configurados para este humor exacto hoy. ¡Ve a descansar un rato!</p>`;
        return;
    }

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-content">
                <span class="event-tag">${event.type}</span>
                <h4 class="event-title">${event.title}</h4>
                <p class="event-time">⏰ Hoy - 6:00 PM</p>
                <p style="font-size: 0.95rem; margin-bottom: 0;">${event.description}</p>
            </div>
        `;
        eventsGrid.appendChild(card);
    });
}

function restartApp() {
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
}