package com.careeros.analytics.dto;

public record LearningHeatmapSummaryResponse(
    double totalLearningHours,
    long totalLearningSessions,
    long activeLearningDays,
    long currentStreak,
    long longestStreak,
    double averageStudyMinutesPerDay,
    int completionPercentage,
    int selectedYear) {
}
