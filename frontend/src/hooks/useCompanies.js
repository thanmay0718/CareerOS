import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCompany, deleteCompany, fetchCompanies, updateCompany } from '../api/companies';

export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: fetchCompanies, staleTime: 30 * 1000 });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createCompany, onSuccess: () => invalidate(queryClient) });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ companyId, payload }) => updateCompany(companyId, payload), onSuccess: () => invalidate(queryClient) });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteCompany, onSuccess: () => invalidate(queryClient) });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['companies'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
