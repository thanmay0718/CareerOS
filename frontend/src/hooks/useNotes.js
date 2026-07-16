import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, deleteNote, fetchNote, fetchNoteCategories, fetchNotes, fetchRevisionNotes, scheduleNoteRevision, updateNote } from '../api/notes';

export function useNotes(filters = {}) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: () => fetchNotes(filters),
    staleTime: 30 * 1000,
  });
}

export function useNoteCategories() {
  return useQuery({
    queryKey: ['notes', 'categories'],
    queryFn: fetchNoteCategories,
    staleTime: 30 * 1000,
  });
}

export function useRevisionNotes() {
  return useQuery({
    queryKey: ['notes', 'revisions'],
    queryFn: fetchRevisionNotes,
    staleTime: 30 * 1000,
  });
}

export function useNote(noteId) {
  return useQuery({
    queryKey: ['notes', 'detail', noteId],
    queryFn: () => fetchNote(noteId),
    enabled: Boolean(noteId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, payload }) => updateNote(noteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useScheduleNoteRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, daysFromToday }) => scheduleNoteRevision(noteId, daysFromToday),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
