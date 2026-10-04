// TaskFlow Frontend API Client with seamless connectivity and fallback

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('taskflow_token') || null;
    this.refreshToken = localStorage.getItem('taskflow_refreshToken') || null;
    this.user = JSON.parse(localStorage.getItem('taskflow_user') || 'null');
  }

  setAuth(token, refreshToken, user) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;
    if (token) localStorage.setItem('taskflow_token', token);
    else localStorage.removeItem('taskflow_token');
    if (refreshToken) localStorage.setItem('taskflow_refreshToken', refreshToken);
    else localStorage.removeItem('taskflow_refreshToken');
    if (user) localStorage.setItem('taskflow_user', JSON.stringify(user));
    else localStorage.removeItem('taskflow_user');
  }

  clearAuth() {
    this.setAuth(null, null, null);
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && this.refreshToken && !options._retry && path !== '/auth/signin' && path !== '/auth/signup') {
        const refreshed = await this.refreshAuth();
        if (refreshed) {
          options._retry = true;
          return this.request(path, options);
        } else {
          this.clearAuth();
        }
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`API error on ${path}:`, err.message);
      throw err;
    }
  }

  async refreshAuth() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        this.token = data.token;
        localStorage.setItem('taskflow_token', data.token);
        return true;
      }
    } catch (e) {
      console.error('Refresh token failed:', e);
    }
    return false;
  }

  // --- Auth Endpoints ---
  async signup(name, email, password, inviteWorkspace, inviteRole) {
    const body = { name, email, password };
    if (inviteWorkspace) {
      body.inviteWorkspace = inviteWorkspace;
      body.inviteRole = inviteRole || 'member';
    }
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setAuth(data.token, data.refreshToken, data.user);
    return data;
  }

  async signin(email, password) {
    const data = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(data.token, data.refreshToken, data.user);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    this.clearAuth();
  }

  // --- Password Reset Endpoints ---
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getMe() {
    const data = await this.request('/auth/me');
    if (data?.user) {
      this.user = data.user;
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    }
    return data;
  }

  // --- AI Endpoints ---
  async parseTaskDescription(description) {
    return this.request('/ai/parse-description', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  // --- Tasks Endpoints ---
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, v);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/tasks${queryString}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderTasks(tasks) {
    return this.request('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ tasks }),
    });
  }

  // Subtasks
  async addSubtask(taskId, { title, dueDate }) {
    return this.request(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title, dueDate }),
    });
  }

  async updateSubtask(taskId, subtaskId, updates) {
    return this.request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteSubtask(taskId, subtaskId) {
    return this.request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`);
  }

  async addComment(taskId, content) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Activity
  async getActivities(taskId) {
    return this.request(`/tasks/${taskId}/activities`);
  }

  // Workspaces
  async getWorkspaces() {
    return this.request('/workspaces');
  }

  async createWorkspace(name, description) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getWorkspaceMembers(workspaceId) {
    return this.request(`/workspaces/${workspaceId}/members`);
  }

  async inviteMember(workspaceId, email, role = 'member') {
    return this.request(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  // Analytics
  async getAnalytics(workspaceId) {
    const q = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return this.request(`/analytics/overview${q}`);
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Admin Endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/admin/users${qStr}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async deactivateUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
