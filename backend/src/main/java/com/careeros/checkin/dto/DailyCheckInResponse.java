package com.careeros.checkin.dto;

import java.time.LocalDate;

public record DailyCheckInResponse(
    Long id,
    LocalDate checkInDate,
    Double studyHours,
    Integer problemsSolved,
    String mood,
    Integer productivityRating,
    String energyLevel,
    Integer energy,
    Integer confidence,
    String todaysAchievement,
    String todaysBlocker,
    String tomorrowGoal,
    String notes) {
}
