package com.careeros.analytics.dto;

import java.util.List;

public record PlanAnalyticsResponse(
    List<PlanProgressItemResponse> planProgress) {
}
