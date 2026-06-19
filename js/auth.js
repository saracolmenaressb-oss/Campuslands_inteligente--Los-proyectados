import { storage } from './storage.js';

const SESSION_KEY = "acompanau_session";

const ADMIN_FALLBACK = {
    email: "admin@acompanau.edu",
    password: "admin123_space",
    name: "Comandante de Bienestar",
    role: "admin"
};

const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '../' : './';

export const auth = {
    registerStudent: (name, email, password, career, semester, avatar) => {
        const students = storage.getStudents();
        const exists = students.some(s => s.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return { success: false, message: "El correo ya se encuentra registrado." };
        }

        const newStudent = {
            id: "student-" + Date.now(),
            name,
            email,
            password,
            career,
            semester,
            avatar: avatar || "astronaut",
            interests: [], 
            createdAt: new Date().toISOString().split("T")[0]
        };

        storage.saveStudent(newStudent);
        auth.setSession(newStudent);
        return { success: true, user: newStudent };
    },

    login: async (email, password) => {
        if (email.toLowerCase() === "admin@acompanau.edu") {
            try {
                const response = await fetch(basePath + 'data/admin.json').catch(() => null);
                let adminCredentials = ADMIN_FALLBACK;
                
                if (response && response.ok) {
                    adminCredentials = await response.json();
                }

                if (password === adminCredentials.password) {
                    const adminSession = { id: "admin", name: adminCredentials.name, email: adminCredentials.email, role: "admin" };
                    auth.setSession(adminSession);
                    return { success: true, user: adminSession, redirect: basePath + "pages/admin.html" };
                } else {
                    return { success: false, message: "Contraseña de administrador incorrecta." };
                }
            } catch (err) {
                if (password === ADMIN_FALLBACK.password) {
                    const adminSession = { id: "admin", name: ADMIN_FALLBACK.name, email: ADMIN_FALLBACK.email, role: "admin" };
                    auth.setSession(adminSession);
                    return { success: true, user: adminSession, redirect: basePath + "pages/admin.html" };
                }
                return { success: false, message: "Error al validar administrador." };
            }
        }

        const students = storage.getStudents();
        const student = students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
        
        if (student) {
            auth.setSession(student);
            // MODIFICACIÓN: Siempre redirige directo a Home (Ya no pasa por setup)
            return { success: true, user: student, redirect: basePath + "pages/home.html" };
        }

        return { success: false, message: "Correo o contraseña incorrectos." };
    },

    getCurrentUser: () => {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    setSession: (user) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = basePath + "login.html";
    },

    checkAuth: () => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = basePath + "login.html";
            return false;
        }
        if (user.role === "admin") {
            window.location.href = basePath + "pages/admin.html";
            return false;
        }
        return true;
    },

    checkAdmin: () => {
        const user = auth.getCurrentUser();
        if (!user || user.role !== "admin") {
            window.location.href = basePath + "login.html";
            return false;
        }
        return true;
    }
};