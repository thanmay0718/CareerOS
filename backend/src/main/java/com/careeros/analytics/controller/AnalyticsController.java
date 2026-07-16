package com.careeros.analytics.controller;

import com.careeros.analytics.dto.AnalyticsOverviewResponse;
import com.careeros.analytics.dto.CheckInAnalyticsResponse;
import com.careeros.analytics.dto.AnalyticsSummaryResponse;
import com.careeros.analytics.dto.AnalyticsStoryResponse;
import com.careeros.analytics.dto.PlanAnalyticsResponse;
import com.careeros.analytics.dto.ProductivityAnalyticsResponse;
import com.careeros.analytics.dto.StudyAnalyticsResponse;
import com.careeros.analytics.dto.TaskAnalyticsResponse;
import com.careeros.analytics.service.AnalyticsService;
import com.careeros.common.dto.ApiResponse;
import com.careeros.user.entity.UserAccount;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

  private final AnalyticsService analyticsService;

  public AnalyticsController(AnalyticsService analyticsService) {
    this.analyticsService = analyticsService;
  }

  @GetMapping("/summary")
  public ApiResponse<AnalyticsSummaryResponse> summary(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Analytics summary loaded", analyticsService.getSummary(userAccount));
  }

  @GetMapping("/overview")
  public ApiResponse<AnalyticsOverviewResponse> overview(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Analytics overview loaded", analyticsService.getOverview(userAccount));
  }

  @GetMapping("/study")
  public ApiResponse<StudyAnalyticsResponse> study(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Study analytics loaded", analyticsService.getStudyAnalytics(userAccount));
  }

  @GetMapping("/tasks")
  public ApiResponse<TaskAnalyticsResponse> tasks(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Task analytics loaded", analyticsService.getTaskAnalytics(userAccount));
  }

  @GetMapping("/plans")
  public ApiResponse<PlanAnalyticsResponse> plans(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Plan analytics loaded", analyticsService.getPlanAnalytics(userAccount));
  }

  @GetMapping("/checkins")
  public ApiResponse<CheckInAnalyticsResponse> checkins(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Check-in analytics loaded", analyticsService.getCheckInAnalytics(userAccount));
  }

  @GetMapping("/productivity")
  public ApiResponse<ProductivityAnalyticsResponse> productivity(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Productivity analytics loaded", analyticsService.getProductivityAnalytics(userAccount));
  }

  @GetMapping("/story")
  public ApiResponse<AnalyticsStoryResponse> story(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Analytics story loaded", analyticsService.getStory(userAccount));
  }
}
