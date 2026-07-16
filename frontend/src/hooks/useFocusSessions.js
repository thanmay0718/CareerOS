import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFocusSession, fetchFocusSessions } from '../api/focusSessions';

export function useFocusSessions() {
  return useQuery({
    queryKey: ['focus-sessions'],
    queryFn: fetchFocusSessions,
    staleTime: 30 * 1000,
  });
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFocusSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}
