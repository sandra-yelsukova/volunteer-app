const API_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export function getProjects() {
  return request('/projects');
}

export function getProjectsByOrganizerId(organizerId) {
  return request(`/projects/by-organizer/${organizerId}`);
}

export function getProjectsByParticipantId(userId) {
  return request(`/projects/by-participant/${userId}`);
}

export function getProjectsByNonParticipantId(userId) {
  return request(`/projects/by-non-participant/${userId}`);
}

export async function createProject(data) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Ошибка создания проекта');
  }

  return response.json();
}

export async function createTask(data) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Ошибка создания задачи');
  }

  return response.json();
}

export function getProjectById(id) {
  return request(`/projects/${id}`);
}

export function getTasks() {
  return request('/tasks');
}

export function getTasksByProjectId(projectId) {
  return request(`/tasks/by-project/${projectId}`);
}

export function getTasksByOrganizerId(organizerId) {
  return request(`/tasks/by-organizer/${organizerId}`);
}

export function getTasksByParticipantId(userId) {
  return request(`/tasks/by-participant/${userId}`);
}

export function getProjectParticipants(projectId) {
  return request(`/projects/${projectId}/participants`);
}

export function addProjectParticipant(projectId, userId) {
  return request(`/projects/${projectId}/participants/${userId}`, {
    method: 'POST',
  });
}

export function removeProjectParticipant(projectId, userId) {
  return request(`/projects/${projectId}/participants/${userId}`, {
    method: 'DELETE',
  });
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Неверный email или пароль');
  }

  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Ошибка регистрации');
  }

  return res.json();
}

export function getUserById(id) {
  return request(`/users/${id}`);
}

export async function getTaskById(id) {
  const res = await fetch(`http://localhost:8080/api/tasks/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    },
  });

  if (!res.ok) {
    throw new Error('Ошибка загрузки задачи');
  }

  return res.json();
}

export function getGroupsByOrganizer(organizerId) {
  return request(`/groups/by-organizer/${organizerId}`);
}

export function getReports() {
  return request('/reports');
}

export async function getReportHtml(reportId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reports/${reportId}/render`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ошибка ${response.status}: ${text}`);
  }

  return response.text();
}

export function getGroupMembers(groupId) {
  return request(`/groups/${groupId}/members`);
}

export function getGroupById(groupId) {
  return request(`/groups/${groupId}`);
}


export function getOrganizerParticipants(organizerId) {
  return request(`/projects/participants/by-organizer/${organizerId}`);
}

export function updateUser(id, data) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: 'DELETE',
  });
}

export function updateTask(id, data) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export function addGroupMember(groupId, userId) {
  return request(`/groups/${groupId}/members/${userId}`, {
    method: 'POST',
  });
}

export function removeGroupMember(groupId, userId) {
  return request(`/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export function updateGroup(id, data) {
  return request(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteGroup(id) {
  return request(`/groups/${id}`, {
    method: 'DELETE',
  });
}

export async function createGroup(data) {
  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Ошибка создания группы');
  }

  return response.json();
}
