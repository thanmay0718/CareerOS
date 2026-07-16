import { apiClient } from './client';

export async function fetchDashboardActivity() {
  const response = await apiClient.get('/dashboard/activity');
  return response.data.data;
}

export async function fetchDashboardStatistics() {
  const response = await apiClient.get('/dashboard/statistics');
  return response.data.data;
}

export async function fetchAnalyticsSummary() {
  const response = await apiClient.get('/analytics/summary');
  return response.data.data;
}

export async function fetchAnalyticsOverview() {
  const response = await apiClient.get('/analytics/overview');
  return response.data.data;
}

export async function fetchAnalyticsStudy() {
  const response = await apiClient.get('/analytics/study');
  return response.data.data;
}

export async function fetchAnalyticsTasks() {
  const response = await apiClient.get('/analytics/tasks');
  return response.data.data;
}

export async function fetchAnalyticsPlans() {
  const response = await apiClient.get('/analytics/plans');
  return response.data.data;
}

export async function fetchAnalyticsCheckins() {
  const response = await apiClient.get('/analytics/checkins');
  return response.data.data;
}

export async function fetchAnalyticsProductivity() {
  const response = await apiClient.get('/analytics/productivity');
  return response.data.data;
}

export async function fetchAnalyticsStory() {
  const response = await apiClient.get('/analytics/story');
  return response.data.data;
}
