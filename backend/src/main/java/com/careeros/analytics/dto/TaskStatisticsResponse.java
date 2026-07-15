package com.careeros.analytics.dto;

public record TaskStatisticsResponse(
    long totalTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks,
    long completedToday,
    long dueTomorrow) {
}
