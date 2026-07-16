package com.careeros.checkin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DailyCheckInRequest(
    @NotNull @DecimalMin(value = "0.0", inclusive = true) Double studyHours,
    @NotNull @Min(0) Integer problemsSolved,
    @Size(max = 80) String mood,
    @Min(1) @Max(5) Integer productivityRating,
    @Size(max = 20) String energyLevel,
    @NotNull @Min(0) @Max(10) Integer energy,
    @NotNull @Min(0) @Max(10) Integer confidence,
    @Size(max = 4000) String todaysAchievement,
    @Size(max = 4000) String todaysBlocker,
    @Size(max = 4000) String tomorrowGoal,
    @Size(max = 4000) String notes) {
}
