package com.careeros.analytics.dto;

import java.util.List;

public record TaskAnalyticsResponse(
    List<AnalyticsDataPointResponse> dailyCompletedTasks,
    List<AnalyticsDataPointResponse> weeklyCompletedTasks,
    List<AnalyticsDataPointResponse> monthlyCompletedTasks,
    List<CategoryDistributionResponse> taskCategoryDistribution) {
}
