package com.careeros.plan.dto;

import com.careeros.plan.enums.MissedTaskReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MissTaskRequest(
    @NotNull MissedTaskReason reason,
    @Size(max = 1000) String detail) {
}
