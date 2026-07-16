package com.careeros.plan.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RescheduleTaskRequest(
    @NotNull LocalDate dueDate,
    @Size(max = 1000) String reason) {
}
