package com.careeros.plan.dto;

import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.PlanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreatePlanRequest(
    @NotNull PlanType planType,
    @NotBlank @Size(max = 160) String title,
    @Size(max = 4000) String description,
    @Size(max = 120) String targetRole,
    @Size(max = 120) String targetPackage,
    @Size(max = 200) String targetCompanies,
    LocalDate expectedStartDate,
    LocalDate expectedEndDate,
    @NotNull PriorityLevel priority,
    PlanStatus status,
    @Size(max = 4000) String notes) {
}
