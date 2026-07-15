package com.careeros.analytics.dto;

import java.time.LocalDate;

public record ActivityPointResponse(
    LocalDate date,
    long tasksCompleted,
    long plansCreated,
    long checkIns,
    double studyHours) {
}
