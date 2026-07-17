package com.careeros.analytics.dto;

import java.time.LocalDate;
import java.util.List;

public record HeatmapDayResponse(
    LocalDate date,
    int intensity,
    double studyHours,
    int studyMinutes,
    long checkIns,
    List<String> topics,
    long completedConcepts,
    long tasksCompleted,
    long notesCreated,
    boolean goalCompleted,
    long currentStreak,
    int productivityScore) {
}
