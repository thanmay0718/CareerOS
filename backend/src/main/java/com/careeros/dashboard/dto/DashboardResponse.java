package com.careeros.dashboard.dto;

import java.util.List;

public record DashboardResponse(
    boolean hasData,
    WelcomeSection welcome,
    List<SummaryCard> summaryCards,
    List<ProgressCard> progressCards,
    UpcomingTasksSection upcomingTasks,
    List<ActivityItem> recentActivity,
    EmptyState emptyState) {
}

