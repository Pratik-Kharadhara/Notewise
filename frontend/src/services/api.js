/**
 * Real Backend API Client for EchoNote
 *
 * All endpoints follow the B.Tech team's Node.js/Express + PostgreSQL contract.
 * Switched automatically via VITE_USE_MOCK="false" in src/services/index.js.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const token = localStorage.getItem('echonote_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
      else if (payload?.error) message = payload.error;
    } catch {
      // Ignore JSON parse errors on non-JSON error bodies
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const realApi = {
  // Recordings & Jobs
  async createRecording({ audio, title, folderId, durationSeconds, source }) {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('title', title);
    formData.append('folderId', folderId);
    if (durationSeconds != null) formData.append('durationSeconds', String(durationSeconds));
    if (source) formData.append('source', source);

    return request('/api/recordings', {
      method: 'POST',
      body: formData,
    });
  },

  async getJobStatus(jobId) {
    return request(`/api/jobs/${encodeURIComponent(jobId)}`);
  },

  async retryJob(jobId) {
    return request(`/api/jobs/${encodeURIComponent(jobId)}/retry`, {
      method: 'POST',
    });
  },

  async getRecordings() {
    return request('/api/recordings');
  },

  async getRecordingById(id) {
    return request(`/api/recordings/${encodeURIComponent(id)}`);
  },

  async updateRecording(id, updates) {
    return request(`/api/recordings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteRecording(id) {
    return request(`/api/recordings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async askLectureQuestion(recordingId, question) {
    return request(`/api/recordings/${encodeURIComponent(recordingId)}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  // Folders
  async getFolders() {
    return request('/api/folders');
  },

  async createFolder({ name, description, color }) {
    return request('/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name, description, color }),
    });
  },

  async updateFolder(id, updates) {
    return request(`/api/folders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteFolder(id) {
    return request(`/api/folders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
