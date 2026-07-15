package com.careeros.plan.dto;

import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskCategory;
import com.careeros.plan.enums.TaskStatus;
import java.time.LocalDate;

public record CareerTaskResponse(
    Long id,
    String title,
    String description,
    TaskCategory category,
    Long planId,
    String planName,
    PlanType planType,
    PriorityLevel priority,
    TaskStatus status,
    LocalDate dueDate,
    LocalDate completedAt,
    Integer estimatedDurationMinutes,
    String notes,
    boolean overdue,
    String progressBadge) {
}
