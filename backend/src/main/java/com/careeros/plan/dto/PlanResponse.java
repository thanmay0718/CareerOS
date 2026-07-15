package com.careeros.plan.dto;

import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.PlanType;
import java.time.LocalDate;

public record PlanResponse(
    Long id,
    String planName,
    PlanType planType,
    String description,
    String targetRole,
    String targetPackage,
    String targetCompanies,
    LocalDate expectedStartDate,
    LocalDate expectedEndDate,
    PriorityLevel priority,
    PlanStatus status,
    String notes,
    int progressPercentage,
    long remainingDays,
    long totalTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks) {
}
