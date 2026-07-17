package com.careeros.analytics.dto;

import java.util.List;

public record LearningHeatmapResponse(
    LearningHeatmapSummaryResponse summary,
    List<HeatmapDayResponse> days,
    List<AnalyticsDataPointResponse> dailyLearningHours,
    List<AnalyticsDataPointResponse> weeklyProgress,
    List<AnalyticsDataPointResponse> monthlyGrowth,
    List<AnalyticsDataPointResponse> streakTrend,
    List<AnalyticsDataPointResponse> productivityTrend,
    List<CategoryDistributionResponse> technologyBreakdown,
    List<String> achievements,
    List<String> smartInsights,
    List<Integer> availableYears) {
}
