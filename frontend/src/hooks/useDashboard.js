import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000,
  });
}
