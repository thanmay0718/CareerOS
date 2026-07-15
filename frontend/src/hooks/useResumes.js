import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateResume, archiveResume, createResume, deleteResume, fetchResumes, updateResume } from '../api/resumes';

export function useResumes() {
  return useQuery({ queryKey: ['resumes'], queryFn: fetchResumes, staleTime: 30 * 1000 });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createResume, onSuccess: () => invalidate(queryClient) });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ resumeId, payload }) => updateResume(resumeId, payload), onSuccess: () => invalidate(queryClient) });
}

export function useActivateResume() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: activateResume, onSuccess: () => invalidate(queryClient) });
}

export function useArchiveResume() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: archiveResume, onSuccess: () => invalidate(queryClient) });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteResume, onSuccess: () => invalidate(queryClient) });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['resumes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
