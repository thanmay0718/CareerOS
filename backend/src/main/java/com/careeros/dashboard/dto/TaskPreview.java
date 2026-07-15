package com.careeros.dashboard.dto;

import java.time.LocalDate;

public record TaskPreview(
    Long id,
    String title,
    String category,
    String priority,
    String status,
    LocalDate dueDate,
    Integer estimatedDurationMinutes,
    String planName,
    boolean overdue) {
}

