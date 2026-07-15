package com.careeros.analytics.dto;

import java.time.LocalDate;

public record HeatmapDayResponse(
    LocalDate date,
    int intensity,
    double studyHours,
    long checkIns) {
}
