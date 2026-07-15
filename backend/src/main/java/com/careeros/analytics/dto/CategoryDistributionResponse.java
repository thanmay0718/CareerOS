package com.careeros.analytics.dto;

public record CategoryDistributionResponse(
    String category,
    long count,
    double percentage) {
}
