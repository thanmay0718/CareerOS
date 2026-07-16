import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsCheckins,
  fetchAnalyticsOverview,
  fetchAnalyticsPlans,
  fetchAnalyticsProductivity,
  fetchAnalyticsStudy,
  fetchAnalyticsStory,
  fetchAnalyticsSummary,
  fetchAnalyticsTasks,
  fetchDashboardActivity,
  fetchDashboardStatistics,
} from '../api/analytics';

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchDashboardActivity,
    staleTime: 30 * 1000,
  });
}

export function useDashboardStatistics() {
  return useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: fetchDashboardStatistics,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: fetchAnalyticsSummary,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsStudy() {
  return useQuery({
    queryKey: ['analytics', 'study'],
    queryFn: fetchAnalyticsStudy,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsTasks() {
  return useQuery({
    queryKey: ['analytics', 'tasks'],
    queryFn: fetchAnalyticsTasks,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsPlans() {
  return useQuery({
    queryKey: ['analytics', 'plans'],
    queryFn: fetchAnalyticsPlans,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsCheckins() {
  return useQuery({
    queryKey: ['analytics', 'checkins'],
    queryFn: fetchAnalyticsCheckins,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsProductivity() {
  return useQuery({
    queryKey: ['analytics', 'productivity'],
    queryFn: fetchAnalyticsProductivity,
    staleTime: 30 * 1000,
  });
}

export function useAnalyticsStory() {
  return useQuery({
    queryKey: ['analytics', 'story'],
    queryFn: fetchAnalyticsStory,
    staleTime: 30 * 1000,
  });
}
