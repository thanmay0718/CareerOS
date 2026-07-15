package com.careeros.analytics.dto;

import java.time.LocalDate;

public record AnalyticsDataPointResponse(
    LocalDate date,
    double value) {
}
