package com.careeros.dashboard.dto;

import java.util.List;

public record UpcomingTasksSection(
    List<TaskPreview> todayTasks,
    List<TaskPreview> tomorrowTasks,
    List<TaskPreview> upcomingDeadlines) {
}

