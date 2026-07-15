package com.careeros.analytics.dto;

import java.util.List;

public record AnalyticsSummaryResponse(
    TaskStatisticsResponse taskStatistics,
    PlanStatisticsResponse planStatistics,
    List<ActivityPointResponse> weeklyActivity,
    List<ActivityPointResponse> monthlyActivity,
    StudyHoursResponse studyHours,
    double completionRate,
    long currentStreak) {
}
