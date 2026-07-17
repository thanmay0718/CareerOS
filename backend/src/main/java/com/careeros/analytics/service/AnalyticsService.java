package com.careeros.analytics.service;

import com.careeros.analytics.dto.AnalyticsOverviewResponse;
import com.careeros.analytics.dto.CheckInAnalyticsResponse;
import com.careeros.analytics.dto.LearningHeatmapDayDetailResponse;
import com.careeros.analytics.dto.LearningHeatmapResponse;
import com.careeros.analytics.dto.PlanAnalyticsResponse;
import com.careeros.analytics.dto.ProductivityAnalyticsResponse;
import com.careeros.analytics.dto.StudyAnalyticsResponse;
import com.careeros.analytics.dto.TaskAnalyticsResponse;
import com.careeros.analytics.dto.AnalyticsSummaryResponse;
import com.careeros.analytics.dto.AnalyticsStoryResponse;
import com.careeros.dashboard.dto.ActivityItem;
import com.careeros.dashboard.dto.DashboardStat;
import com.careeros.user.entity.UserAccount;
import java.util.List;

public interface AnalyticsService {
  List<DashboardStat> getDashboardStatistics(UserAccount userAccount);

  List<ActivityItem> getDashboardActivity(UserAccount userAccount);

  AnalyticsSummaryResponse getSummary(UserAccount userAccount);

  AnalyticsOverviewResponse getOverview(UserAccount userAccount);

  StudyAnalyticsResponse getStudyAnalytics(UserAccount userAccount);

  TaskAnalyticsResponse getTaskAnalytics(UserAccount userAccount);

  PlanAnalyticsResponse getPlanAnalytics(UserAccount userAccount);

  CheckInAnalyticsResponse getCheckInAnalytics(UserAccount userAccount);

  ProductivityAnalyticsResponse getProductivityAnalytics(UserAccount userAccount);

  AnalyticsStoryResponse getStory(UserAccount userAccount);

  LearningHeatmapResponse getLearningHeatmap(UserAccount userAccount, Integer year);

  LearningHeatmapDayDetailResponse getLearningHeatmapDay(UserAccount userAccount, java.time.LocalDate date);
}
