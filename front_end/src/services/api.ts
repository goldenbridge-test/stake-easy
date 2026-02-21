// Central API service for Golden Backend
// Base URL from environment variable
const API_BASE = import.meta.env.VITE_API_URL || 'https://golden-backend-pcc1.onrender.com';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};
export const setUser = (user: any) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};
export const isAuthenticated = () => !!getAccessToken();

// ─── Core fetch with auth & auto-refresh ─────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401) {
        const refresh = getRefreshToken();
        if (refresh) {
            const refreshRes = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setTokens(data.access, refresh);
                headers['Authorization'] = `Bearer ${data.access}`;
                res = await fetch(`${API_BASE}${path}`, { ...options, headers });
            } else {
                clearTokens();
                window.location.href = '/signin';
            }
        }
    }

    return res;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
    async login(username: string, password: string) {
        const res = await fetch(`${API_BASE}/api/accounts/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Login failed');
        }
        const data = await res.json();
        setTokens(data.access, data.refresh);
        if (data.user) setUser(data.user);
        return data;
    },

    async register(username: string, email: string, password: string, firstName?: string, lastName?: string) {
        const res = await fetch(`${API_BASE}/api/accounts/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                first_name: firstName,
                last_name: lastName
            }),
        });
        if (!res.ok) {
            const err = await res.json();
            const msg = Object.values(err).flat().join(' ');
            throw new Error(msg || 'Registration failed');
        }
        return res.json();
    },

    logout() {
        clearTokens();
        window.location.href = '/';
    },
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesApi = {
    async list(params: Record<string, string> = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await apiFetch(`/api/courses/?${query}`);
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
    },

    async get(id: number) {
        const res = await apiFetch(`/api/courses/${id}/`);
        if (!res.ok) throw new Error('Course not found');
        return res.json();
    },

    async categories() {
        const res = await apiFetch('/api/courses/categories/');
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    async myCourses() {
        const res = await apiFetch('/api/courses/my_courses/');
        if (!res.ok) throw new Error('Failed to fetch your courses');
        return res.json();
    },

    async create(data: any) {
        const res = await apiFetch('/api/courses/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create course');
        return res.json();
    },

    async update(id: number, data: any) {
        const res = await apiFetch(`/api/courses/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update course');
        return res.json();
    },

    async delete(id: number) {
        const res = await apiFetch(`/api/courses/${id}/`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete course');
        return true;
    },
};


// ─── Enrollments ─────────────────────────────────────────────────────────────
export const enrollmentsApi = {
    async list() {
        const res = await apiFetch('/api/enrollments/');
        if (!res.ok) throw new Error('Failed to fetch enrollments');
        return res.json();
    },

    async enroll(courseId: number) {
        const res = await apiFetch('/api/enrollments/', {
            method: 'POST',
            body: JSON.stringify({ course: courseId }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Enrollment failed');
        }
        return res.json();
    },

    async completeLesson(enrollmentId: number, lessonId: number, timeSpent = 0) {
        const res = await apiFetch(`/api/enrollments/${enrollmentId}/complete-lesson/`, {
            method: 'POST',
            body: JSON.stringify({ lesson_id: lessonId, time_spent_minutes: timeSpent }),
        });
        if (!res.ok) throw new Error('Failed to mark lesson as complete');
        return res.json();
    },

    async getCertificate(enrollmentId: number) {
        const res = await apiFetch(`/api/enrollments/${enrollmentId}/certificate/`);
        if (!res.ok) throw new Error('Certificate not available');
        return res.json();
    },

    async myCertificates() {
        const res = await apiFetch('/api/enrollments/certificates/');
        if (!res.ok) throw new Error('Failed to fetch certificates');
        return res.json();
    },
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
    async mySummary() {
        const res = await apiFetch('/api/analytics/dashboard/my-summary/');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
    },

    async adminSummary() {
        const res = await apiFetch('/api/analytics/dashboard/admin-summary/');
        if (!res.ok) throw new Error('Failed to fetch admin analytics');
        return res.json();
    },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
    async list() {
        const res = await apiFetch('/api/accounts/users/');
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    }
};
