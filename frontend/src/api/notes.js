import { apiClient } from './client';

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export async function fetchNotes(params = {}) {
  const response = await apiClient.get('/notes', { params: compactParams(params) });
  return response.data.data;
}

export async function fetchNoteCategories() {
  const response = await apiClient.get('/notes/categories');
  return response.data.data;
}

export async function fetchRevisionNotes() {
  const response = await apiClient.get('/notes/revisions');
  return response.data.data;
}

export async function fetchNote(noteId) {
  const response = await apiClient.get(`/notes/${noteId}`);
  return response.data.data;
}

export async function createNote(payload) {
  const response = await apiClient.post('/notes', payload);
  return response.data.data;
}

export async function updateNote(noteId, payload) {
  const response = await apiClient.put(`/notes/${noteId}`, payload);
  return response.data.data;
}

export async function scheduleNoteRevision(noteId, daysFromToday) {
  const response = await apiClient.patch(`/notes/${noteId}/revision`, { daysFromToday });
  return response.data.data;
}

export async function deleteNote(noteId) {
  const response = await apiClient.delete(`/notes/${noteId}`);
  return response.data.data;
}
