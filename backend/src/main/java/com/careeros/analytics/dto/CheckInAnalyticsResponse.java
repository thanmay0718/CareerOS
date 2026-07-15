package com.careeros.analytics.dto;

import java.util.List;

public record CheckInAnalyticsResponse(
    long totalCheckIns,
    double averageStudyHours,
    List<HeatmapDayResponse> heatmap) {
}
