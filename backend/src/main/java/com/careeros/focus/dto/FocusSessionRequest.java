package com.careeros.focus.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FocusSessionRequest(
    @NotNull @Min(1) @Max(240) Integer durationMinutes,
    @Size(max = 40) String sessionType) {
}
