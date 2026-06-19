// Administrador de Autenticación y Sesiones - CampusLife
import { storage } from './storage.js';

const SESSION_KEY = "acompanau_session";

// Fallback de administrador si falla la carga del JSON por CORS (protocolo file://)
const ADMIN_FALLBACK = {
    email: "admin@acompanau.edu",
    password: "admin123_space",
    name: "Comandante de Bienestar",
    role: "admin"
};

export const auth = {
    // Registrar estudiante
    registerStudent: (name, email, password, career, semester, avatar) => {
        const students = storage.getStudents();
        
        // Verificar duplicados
        const exists = students.some(s => s.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return { success: false, message: "El correo ya se encuentra registrado." };
        }

        const newStudent = {
            id: "student-" + Date.now(),
            name,
            email,
            password, // En una app real iría encriptado
            career,
            semester,
            avatar: avatar || "astronaut",
            interests: [], // Se define en el primer login
            createdAt: new Date().toISOString().split("T")[0]
        };

        storage.saveStudent(newStudent);
        
        // Iniciar sesión de inmediato
        auth.setSession(newStudent);
        return { success: true, user: newStudent };
    },

    // Iniciar Sesión (Estudiante o Admin)
    login: async (email, password) => {
        // 1. Validar si es administrador
        if (email.toLowerCase() === "admin@acompanau.edu") {
            try {
                // Intentar cargar desde el JSON
                const response = await fetch('data/admin.json').catch(() => null);
                let adminCredentials = ADMIN_FALLBACK;
                
                if (response && response.ok) {
                    adminCredentials = await response.json();
                }

                if (password === adminCredentials.password) {
                    const adminSession = {
                        id: "admin",
                        name: adminCredentials.name,
                        email: adminCredentials.email,
                        role: "admin"
                    };
                    auth.setSession(adminSession);
                    return { success: true, user: adminSession, redirect: "/pages/admin.html" };
                } else {
                    return { success: false, message: "Contraseña de administrador incorrecta." };
                }
            } catch (err) {
                // Si hay CORS o error de red, usar el fallback seguro
                if (password === ADMIN_FALLBACK.password) {
                    const adminSession = {
                        id: "admin",
                        name: ADMIN_FALLBACK.name,
                        email: ADMIN_FALLBACK.email,
                        role: "admin"
                    };
                    auth.setSession(adminSession);
                    return { success: true, user: adminSession, redirect: "/pages/admin.html" };
                }
                return { success: false, message: "Error al validar administrador." };
            }
        }

        // 2. Validar estudiante
        const students = storage.getStudents();
        const student = students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
        
        if (student) {
            auth.setSession(student);
            // Si no tiene intereses seleccionados, debe hacer el filtro
            const needsFilter = !student.interests || student.interests.length === 0;
            return { 
                success: true, 
                user: student, 
                redirect: needsFilter ? "/index.html?setup=true" : "/index.html" 
            };
        }

        return { success: false, message: "Correo o contraseña incorrectos." };
    },

    // Obtener sesión activa
    getCurrentUser: () => {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Guardar sesión activa
    setSession: (user) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },

    // Cerrar sesión
    logout: () => {
        localStorage.removeItem(SESSION_KEY);
        // Redirigir a login
        const currentPath = window.location.pathname;
        if (currentPath.includes("/pages/")) {
            window.location.href = "../login.html";
        } else {
            window.location.href = "login.html";
        }
    },

    // Verificar ruta protegida de estudiante
    checkAuth: () => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return false;
        }
        if (user.role === "admin") {
            window.location.href = "pages/admin.html";
            return false;
        }
        return true;
    },

    // Verificar ruta protegida de admin
    checkAdmin: () => {
        const user = auth.getCurrentUser();
        if (!user || user.role !== "admin") {
            window.location.href = "../login.html";
            return false;
        }
        return true;
    }
};
