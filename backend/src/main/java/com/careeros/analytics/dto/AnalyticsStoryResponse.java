package com.careeros.analytics.dto;

import java.util.List;

public record AnalyticsStoryResponse(
    int todaysProductivity,
    String productivityLabel,
    int completionRate,
    int consistencyScore,
    double focusHours,
    int weeklyImprovement,
    String focusRecommendation,
    List<AnalyticsInsightResponse> insights,
    List<HeatmapDayResponse> activityHeatmap) {
}
