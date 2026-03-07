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

    async getCertificateDetail(id: number) {
        const res = await apiFetch(`/api/enrollments/certificates/${id}/`);
        if (!res.ok) throw new Error('Certificate not found');
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

    async dailyStats() {
        const res = await apiFetch('/api/analytics/daily-stats/');
        if (!res.ok) throw new Error('Failed to fetch daily stats');
        return res.json();
    },

    async courseStats() {
        const res = await apiFetch('/api/analytics/courses/');
        if (!res.ok) throw new Error('Failed to fetch course stats');
        return res.json();
    },

    async userStats() {
        const res = await apiFetch('/api/analytics/users/');
        if (!res.ok) throw new Error('Failed to fetch user stats');
        return res.json();
    },
};

// ─── Coaching ─────────────────────────────────────────────────────────────────
export const coachingApi = {
    async subscribe(instructorId: number, sessions: number, price: string) {
        const res = await apiFetch('/api/courses/coaching-programs/', {
            method: 'POST',
            body: JSON.stringify({
                instructor: instructorId,
                total_sessions: sessions,
                price: price
            }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Coaching subscription failed');
        }
        return res.json();
    },

    async list() {
        const res = await apiFetch('/api/courses/coaching-programs/');
        if (!res.ok) throw new Error('Failed to fetch coaching programs');
        return res.json();
    },

    async validateSession(sessionId: number) {
        const res = await apiFetch(`/api/courses/coaching-sessions/${sessionId}/validate_session/`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to validate session');
        return res.json();
    },

    async confirmSession(sessionId: number) {
        const res = await apiFetch(`/api/courses/coaching-sessions/${sessionId}/confirm_session/`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to confirm session');
        return res.json();
    },
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileApi = {
    async get() {
        const res = await apiFetch('/api/accounts/profile/me/');
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    async update(data: Partial<{ username: string; email: string; first_name: string; last_name: string }>) {
        const user = getUser();
        const id = user?.id;
        if (!id) throw new Error('User ID not found');
        const res = await apiFetch(`/api/accounts/profile/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update profile');
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

// ─── Course Modules & Chapters ────────────────────────────────────────────────
export const modulesApi = {
    // Get full course curriculum (modules + chapters)
    async getCurriculum(courseId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/curriculum/`);
        if (!res.ok) throw new Error('Failed to fetch curriculum');
        return res.json();
    },

    // Get a secure streaming URL for a chapter video
    async getVideoUrl(courseId: number, moduleId: number, chapterId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/video-url/`);
        if (!res.ok) throw new Error('Video not available');
        return res.json(); // Returns { url, token, expires_at }
    },

    // Mark a chapter as completed
    async completeChapter(courseId: number, moduleId: number, chapterId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/complete/`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to mark chapter complete');
        return res.json();
    },

    // Instructor: create a module
    async createModule(courseId: number, data: { title: string; order?: number }) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create module');
        return res.json();
    },

    // Instructor: create a chapter inside a module
    async createChapter(courseId: number, moduleId: number, data: any) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/chapters/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create chapter');
        return res.json();
    },

    // Instructor: upload video for a chapter
    async uploadVideo(courseId: number, moduleId: number, chapterId: number, file: File, onProgress?: (pct: number) => void) {
        const formData = new FormData();
        formData.append('file', file);
        const token = getAccessToken();
        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE}/api/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/upload-video/`);
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
            xhr.onload = () => xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Upload failed'));
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.send(formData);
        });
    },
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressApi = {
    // Get student's progress for a course
    async get(courseId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/my-progress/`);
        if (!res.ok) return { percentage: 0, completed_chapters: [] };
        return res.json(); // Returns { percentage, completed_chapters: [id,...], last_chapter_id }
    },

    // Save video watch position (for resume)
    async savePosition(courseId: number, moduleId: number, chapterId: number, positionSeconds: number) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/save-position/`, {
            method: 'POST',
            body: JSON.stringify({ position_seconds: positionSeconds }),
        });
        if (!res.ok) return;
        return res.json();
    },
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizApi = {
    // Get quiz for a chapter
    async getForChapter(courseId: number, moduleId: number, chapterId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/quiz/`);
        if (!res.ok) return null;
        return res.json(); // Returns { id, questions: [{id, text, choices:[{id,text}]}] }
    },

    // Submit quiz answers
    async submit(quizId: number, answers: { question_id: number; choice_id: number }[]) {
        const res = await apiFetch(`/api/courses/quizzes/${quizId}/submit/`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
        if (!res.ok) throw new Error('Quiz submission failed');
        return res.json(); // Returns { score, passed, correct_answers }
    },
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
    async list(courseId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/reviews/`);
        if (!res.ok) return [];
        return res.json();
    },

    async create(courseId: number, data: { rating: number; comment: string }) {
        const res = await apiFetch(`/api/courses/${courseId}/reviews/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to submit review');
        }
        return res.json();
    },

    async get(id: number) {
        const res = await apiFetch(`/api/reviews/${id}/`);
        if (!res.ok) throw new Error('Review not found');
        return res.json();
    },

    async update(id: number, data: { rating?: number; comment?: string }) {
        const res = await apiFetch(`/api/reviews/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update review');
        return res.json();
    },

    async delete(id: number) {
        const res = await apiFetch(`/api/reviews/${id}/`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete review');
        return true;
    },
};

// ─── Certificate ──────────────────────────────────────────────────────────────
export const certificateApi = {
    // Get or generate certificate for a course
    async get(courseId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/certificate/`);
        if (!res.ok) throw new Error('Certificate not yet available. Complete all chapters first.');
        return res.json(); // Returns { id, issued_at, student_name, course_title, pdf_url }
    },

    // Download certificate as PDF
    async downloadPdf(courseId: number): Promise<Blob> {
        const token = (await import('./api')).getAccessToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://golden-backend-pcc1.onrender.com'}/api/courses/${courseId}/certificate/pdf/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('PDF generation failed');
        return res.blob();
    },

    // Verify certificate by code (public endpoint)
    async verify(code: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://golden-backend-pcc1.onrender.com'}/api/courses/certificates/verify/${code}/`);
        if (!res.ok) throw new Error('Invalid certificate code');
        return res.json();
    },
};

// ─── Notes (Personal student notes) ───────────────────────────────────────────
export const notesApi = {
    async list(courseId: number) {
        const res = await apiFetch(`/api/courses/${courseId}/notes/`);
        if (!res.ok) return [];
        return res.json();
    },

    async save(courseId: number, chapterId: number, content: string) {
        const res = await apiFetch(`/api/courses/${courseId}/notes/`, {
            method: 'POST',
            body: JSON.stringify({ chapter: chapterId, content }),
        });
        if (!res.ok) throw new Error('Failed to save note');
        return res.json();
    },

    async update(noteId: number, content: string) {
        const res = await apiFetch(`/api/courses/notes/${noteId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error('Failed to update note');
        return res.json();
    },
};
