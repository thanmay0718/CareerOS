package com.careeros.dashboard.dto;

public record DashboardRecommendation(
    String title,
    String reason,
    String actionLabel,
    String actionPath,
    String priority,
    String source) {
}
