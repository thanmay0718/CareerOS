import { useQuery } from '@tanstack/react-query';
import { fetchRewardProfile } from '../api/rewards';

export function useRewardProfile() {
  return useQuery({
    queryKey: ['rewards', 'profile'],
    queryFn: fetchRewardProfile,
    staleTime: 30 * 1000,
  });
}
