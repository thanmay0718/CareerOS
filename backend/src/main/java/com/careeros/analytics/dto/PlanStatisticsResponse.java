package com.careeros.analytics.dto;

public record PlanStatisticsResponse(
    long totalPlans,
    long activePlans,
    long completedPlans,
    long archivedPlans,
    long planAPlans,
    long planBPlans,
    long bothPlans) {
}
