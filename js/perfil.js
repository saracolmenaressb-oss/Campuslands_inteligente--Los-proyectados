import { auth } from './auth.js';
import { storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = storage.get('currentUser');
    if (currentUser) {
        document.getElementById('prof-name').textContent = currentUser.name || "Administrador";
        document.getElementById('prof-prog').textContent = currentUser.program || "Panel Central";
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.onclick = () => auth.logout();
    }
});