package com.careeros.plan.dto;

import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskCategory;
import com.careeros.plan.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTaskRequest(
    @NotBlank @Size(max = 160) String title,
    @Size(max = 4000) String description,
    @NotNull TaskCategory category,
    Long planId,
    PlanType planType,
    @NotNull PriorityLevel priority,
    TaskStatus status,
    LocalDate dueDate,
    @Min(0) Integer estimatedDurationMinutes,
    @Size(max = 4000) String notes,
    @Size(max = 1000) String reminderTimes,
    Boolean browserReminderEnabled) {
}
