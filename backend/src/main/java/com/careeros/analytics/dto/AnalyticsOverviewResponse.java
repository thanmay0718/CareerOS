package com.careeros.analytics.dto;

public record AnalyticsOverviewResponse(
    int overallCareerScore,
    int planCompletion,
    int taskCompletion,
    int studyConsistency,
    int weeklyProductivity,
    int monthlyProductivity,
    int placementReadiness,
    int resumeReadiness,
    int interviewReadiness,
    int learningProgress) {
}
