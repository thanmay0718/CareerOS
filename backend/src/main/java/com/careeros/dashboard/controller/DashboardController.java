package com.careeros.dashboard.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.analytics.service.AnalyticsService;
import com.careeros.dashboard.dto.ActivityItem;
import com.careeros.dashboard.dto.DashboardResponse;
import com.careeros.dashboard.dto.DashboardStat;
import com.careeros.dashboard.service.DashboardService;
import com.careeros.user.entity.UserAccount;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

  private final DashboardService dashboardService;
  private final AnalyticsService analyticsService;

  public DashboardController(DashboardService dashboardService, AnalyticsService analyticsService) {
    this.dashboardService = dashboardService;
    this.analyticsService = analyticsService;
  }

  @GetMapping("/dashboard")
  public ApiResponse<DashboardResponse> getDashboard(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Dashboard loaded", dashboardService.getDashboard(userAccount));
  }

  @GetMapping("/dashboard/activity")
  public ApiResponse<List<ActivityItem>> getDashboardActivity(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Dashboard activity loaded", analyticsService.getDashboardActivity(userAccount));
  }

  @GetMapping("/dashboard/statistics")
  public ApiResponse<List<DashboardStat>> getDashboardStatistics(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Dashboard statistics loaded", analyticsService.getDashboardStatistics(userAccount));
  }

  @GetMapping("/health")
  public ApiResponse<String> health() {
    return ApiResponse.success("Service is healthy", "OK");
  }
}
