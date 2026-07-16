import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRoadmap,
  deleteRoadmap,
  fetchRoadmapRecommendations,
  fetchRoadmaps,
  updateRoadmap,
  updateRoadmapModule,
  updateRoadmapStatus,
} from '../api/roadmaps';

export function useRoadmaps(filters = {}) {
  return useQuery({
    queryKey: ['roadmaps', filters],
    queryFn: () => fetchRoadmaps(filters),
    staleTime: 30 * 1000,
  });
}

export function useRoadmapRecommendations(search) {
  return useQuery({
    queryKey: ['roadmap-recommendations', search],
    queryFn: () => fetchRoadmapRecommendations(search),
    enabled: search.trim().length >= 2,
    staleTime: 30 * 1000,
  });
}

function invalidateRoadmapData(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
  queryClient.invalidateQueries({ queryKey: ['roadmap-recommendations'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['analytics'] });
}

export function useCreateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoadmap,
    onSuccess: () => invalidateRoadmapData(queryClient),
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, payload }) => updateRoadmap(roadmapId, payload),
    onSuccess: () => invalidateRoadmapData(queryClient),
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => invalidateRoadmapData(queryClient),
  });
}

export function useUpdateRoadmapStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, status }) => updateRoadmapStatus(roadmapId, status),
    onSuccess: () => invalidateRoadmapData(queryClient),
  });
}

export function useUpdateRoadmapModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roadmapId, moduleId, payload }) => updateRoadmapModule(roadmapId, moduleId, payload),
    onSuccess: () => invalidateRoadmapData(queryClient),
  });
}
