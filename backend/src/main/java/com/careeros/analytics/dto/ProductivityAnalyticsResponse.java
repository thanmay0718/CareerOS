package com.careeros.analytics.dto;

public record ProductivityAnalyticsResponse(
    int dailyProductivity,
    int weeklyProductivity,
    int monthlyProductivity,
    long currentStreak,
    int consistencyScore) {
}
