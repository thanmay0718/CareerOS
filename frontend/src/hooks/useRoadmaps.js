import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRoadmaps, updateRoadmapModule, updateRoadmapStatus } from '../api/roadmaps';

export function useRoadmaps() {
  return useQuery({ queryKey: ['roadmaps'], queryFn: fetchRoadmaps, staleTime: 30 * 1000 });
}

export function useUpdateRoadmapStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, status }) => updateRoadmapStatus(roadmapId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateRoadmapModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, moduleId, payload }) => updateRoadmapModule(roadmapId, moduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
