import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRecentCheckIns, fetchTodayCheckIn, saveTodayCheckIn } from '../api/checkIns';

export function useTodayCheckIn() {
  return useQuery({
    queryKey: ['check-ins', 'today'],
    queryFn: fetchTodayCheckIn,
    staleTime: 30 * 1000,
  });
}

export function useRecentCheckIns() {
  return useQuery({
    queryKey: ['check-ins', 'recent'],
    queryFn: fetchRecentCheckIns,
    staleTime: 30 * 1000,
  });
}

export function useSaveTodayCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveTodayCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
