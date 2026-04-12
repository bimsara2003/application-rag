const API_BASE = "http://localhost:8000";

/**
 * Fetch wrapper that auto-attaches JWT and handles JSON.
 */
async function request(endpoint, options = {}) {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        let errorMessage = err.detail || `HTTP ${res.status}`;

        // Handle FastAPI 422 Validation Error format (array of objects)
        if (Array.isArray(err.detail)) {
            errorMessage = err.detail.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(", ");
        }

        throw new Error(errorMessage);
    }

    return res.json();
}

// ── Auth API ────────────────────────────────────────────────────

export const authApi = {
    login: (email, password) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    adminLogin: (email, password) =>
        request("/auth/admin-login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    register: (data) =>
        request("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    refresh: (refresh_token) =>
        request("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refresh_token }),
        }),

    logout: (refresh_token) =>
        request("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refresh_token }),
        }),
};

// ── User API ────────────────────────────────────────────────────

export const userApi = {
    getProfile: () => request("/users/me"),

    uploadAvatar: (file) => {
        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("file", file);

        return fetch(`${API_BASE}/users/me/avatar`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Request failed" }));
                throw new Error(err.detail || `HTTP ${res.status}`);
            }
            return res.json();
        });
    },

    updateProfile: (data) =>
        request("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    changePassword: (current_password, new_password) =>
        request("/users/me/password", {
            method: "PUT",
            body: JSON.stringify({ current_password, new_password }),
        }),

    // Admin methods
    listAll: () => request("/users/"),

    createStaff: (data) =>
        request("/users/staff", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    deleteUser: (id) =>
        request(`/users/${id}`, { method: "DELETE" }),

    updateUser: (id, data) =>
        request(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
};

// ── Ticket API ──────────────────────────────────────────────────

export const ticketApi = {
    create: (data) =>
        request("/tickets/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    list: () => request("/tickets/"),

    getById: (id) => request(`/tickets/${id}`),

    updateStatus: (id, data) =>
        request(`/tickets/${id}/status`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    postComment: (id, data) =>
        request(`/tickets/${id}/comments`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

// ── Notification API ────────────────────────────────────────────

export const notificationApi = {
    list: () => request("/notifications/"),

    unreadCount: () => request("/notifications/unread-count"),

    markRead: (id) =>
        request(`/notifications/${id}/read`, { method: "PUT" }),

    markAllRead: () =>
        request("/notifications/read-all", { method: "PUT" }),
};

// ── Knowledge Base API ──────────────────────────────────────────

export const kbApi = {
    // Categories
    listCategories: () => request("/kb/categories"),
    createCategory: (data) =>
        request("/kb/categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id, data) =>
        request(`/kb/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCategory: (id) =>
        request(`/kb/categories/${id}`, { method: "DELETE" }),

    // Articles
    listArticles: (categoryId) =>
        request(`/kb/articles${categoryId ? `?category_id=${categoryId}` : ""}`),
    listAllArticles: (categoryId) =>
        request(`/kb/articles/all${categoryId ? `?category_id=${categoryId}` : ""}`),
    getArticle: (id) => request(`/kb/articles/${id}`),
    createArticle: (data) =>
        request("/kb/articles", { method: "POST", body: JSON.stringify(data) }),
    updateArticle: (id, data) =>
        request(`/kb/articles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteArticle: (id) =>
        request(`/kb/articles/${id}`, { method: "DELETE" }),
    markHelpful: (id) =>
        request(`/kb/articles/${id}/helpful`, { method: "POST" }),
};

// ── Chat API ────────────────────────────────────────────────────

export const chatApi = {
    ask: (question, sessionId) =>
        request("/chat/ask", {
            method: "POST",
            body: JSON.stringify({ question, session_id: sessionId || null }),
        }),
    createSession: (title) =>
        request("/chat/sessions", { method: "POST", body: JSON.stringify({ title }) }),
    listSessions: () => request("/chat/sessions"),
    getMessages: (sessionId) => request(`/chat/sessions/${sessionId}/messages`),
    ingest: () => request("/chat/ingest", { method: "POST" }),
};

// ── Announcement API ────────────────────────────────────────────

export const announcementApi = {
    listActive: () => request("/announcements/active"),
    listAll: () => request("/announcements/"),
    getById: (id) => request(`/announcements/${id}`),
    create: (data) =>
        request("/announcements/", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
        request(`/announcements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) =>
        request(`/announcements/${id}`, { method: "DELETE" }),
};
