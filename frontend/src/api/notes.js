import api from './client';

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export async function fetchNotes(params = {}) {
  const response = await api.get('/api/notes', { params: compactParams(params) });
  return response.data.data;
}

export async function fetchNoteCategories() {
  const response = await api.get('/api/notes/categories');
  return response.data.data;
}

export async function fetchRevisionNotes() {
  const response = await api.get('/api/notes/revisions');
  return response.data.data;
}

export async function fetchNote(noteId) {
  const response = await api.get(`/api/notes/${noteId}`);
  return response.data.data;
}

export async function createNote(payload) {
  const response = await api.post('/api/notes', payload);
  return response.data.data;
}

export async function updateNote(noteId, payload) {
  const response = await api.put(`/api/notes/${noteId}`, payload);
  return response.data.data;
}

export async function scheduleNoteRevision(noteId, daysFromToday) {
  const response = await api.patch(`/api/notes/${noteId}/revision`, { daysFromToday });
  return response.data.data;
}

export async function deleteNote(noteId) {
  const response = await api.delete(`/api/notes/${noteId}`);
  return response.data.data;
}
