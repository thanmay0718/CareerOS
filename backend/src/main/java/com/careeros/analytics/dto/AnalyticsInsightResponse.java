package com.careeros.analytics.dto;

public record AnalyticsInsightResponse(
    String question,
    String answer,
    String evidence,
    String actionLabel,
    String actionPath,
    String tone) {
}
