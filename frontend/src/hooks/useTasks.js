import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeTask,
  createTask,
  deleteTask,
  fetchMissedTaskInsights,
  fetchTaskTimeline,
  fetchTasks,
  missTask,
  rescheduleTask,
  updateTask,
} from '../api/tasks';

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['taskTimeline'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['taskTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

export function useMissTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => missTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['taskTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['missedTaskInsights'] });
    },
  });
}

export function useRescheduleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => rescheduleTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['taskTimeline'] });
    },
  });
}

export function useTaskTimeline() {
  return useQuery({
    queryKey: ['taskTimeline'],
    queryFn: fetchTaskTimeline,
    staleTime: 30 * 1000,
  });
}

export function useMissedTaskInsights() {
  return useQuery({
    queryKey: ['missedTaskInsights'],
    queryFn: fetchMissedTaskInsights,
    staleTime: 30 * 1000,
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
