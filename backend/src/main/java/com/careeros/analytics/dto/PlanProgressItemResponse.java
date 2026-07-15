package com.careeros.analytics.dto;

import java.time.LocalDate;

public record PlanProgressItemResponse(
    Long id,
    String planName,
    String planType,
    String status,
    int progressPercentage,
    long remainingDays,
    long completedTasks,
    long totalTasks,
    LocalDate expectedEndDate) {
}
