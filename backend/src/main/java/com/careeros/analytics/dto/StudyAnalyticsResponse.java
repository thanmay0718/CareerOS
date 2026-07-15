package com.careeros.analytics.dto;

import java.util.List;

public record StudyAnalyticsResponse(
    List<AnalyticsDataPointResponse> weeklyStudyHours,
    List<AnalyticsDataPointResponse> monthlyStudyHours,
    List<HeatmapDayResponse> heatmap) {
}
