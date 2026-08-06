import api from './client';

export async function fetchDashboardActivity() {
  const response = await api.get('/api/dashboard/activity');
  return response.data.data;
}

export async function fetchDashboardStatistics() {
  const response = await api.get('/api/dashboard/statistics');
  return response.data.data;
}

export async function fetchAnalyticsSummary() {
  const response = await api.get('/api/analytics/summary');
  return response.data.data;
}

export async function fetchAnalyticsOverview() {
  const response = await api.get('/api/analytics/overview');
  return response.data.data;
}

export async function fetchAnalyticsStudy() {
  const response = await api.get('/api/analytics/study');
  return response.data.data;
}

export async function fetchAnalyticsTasks() {
  const response = await api.get('/api/analytics/tasks');
  return response.data.data;
}

export async function fetchAnalyticsPlans() {
  const response = await api.get('/api/analytics/plans');
  return response.data.data;
}

export async function fetchAnalyticsCheckins() {
  const response = await api.get('/api/analytics/checkins');
  return response.data.data;
}

export async function fetchAnalyticsProductivity() {
  const response = await api.get('/api/analytics/productivity');
  return response.data.data;
}

export async function fetchAnalyticsStory() {
  const response = await api.get('/api/analytics/story');
  return response.data.data;
}

export async function fetchLearningHeatmap(year) {
  const response = await api.get('/api/analytics/heatmap', {
    params: year ? { year } : undefined,
  });
  return response.data.data;
}

export async function fetchLearningHeatmapDay(date) {
  const response = await api.get(`/api/analytics/heatmap/${date}`);
  return response.data.data;
}
