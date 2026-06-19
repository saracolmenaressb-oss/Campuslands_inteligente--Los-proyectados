import { storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const activities = storage.get('activities') || [];
    const activity = activities.find(a => a.id === id);

    if (activity) {
        document.getElementById('act-icon').textContent = activity.icon;
        document.getElementById('act-title').textContent = activity.title;
        document.getElementById('act-desc').textContent = activity.desc;
        document.getElementById('act-type').textContent = activity.type;
        document.getElementById('act-date').textContent = activity.date;
        document.getElementById('act-time').textContent = activity.time;
        document.getElementById('act-location').textContent = activity.location;
        document.getElementById('act-spots').textContent = activity.spots;
    }
});