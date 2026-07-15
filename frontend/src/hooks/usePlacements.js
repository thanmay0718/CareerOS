import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlacement, deletePlacement, fetchPlacements, updatePlacement } from '../api/placements';

export function usePlacements() {
  return useQuery({ queryKey: ['placements'], queryFn: fetchPlacements, staleTime: 30 * 1000 });
}

export function useCreatePlacement() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createPlacement, onSuccess: () => invalidate(queryClient) });
}

export function useUpdatePlacement() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ applicationId, payload }) => updatePlacement(applicationId, payload), onSuccess: () => invalidate(queryClient) });
}

export function useDeletePlacement() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deletePlacement, onSuccess: () => invalidate(queryClient) });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['placements'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
