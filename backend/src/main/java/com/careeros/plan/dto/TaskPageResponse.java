package com.careeros.plan.dto;

import java.util.List;

public record TaskPageResponse(
    List<CareerTaskResponse> items,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext) {
}

