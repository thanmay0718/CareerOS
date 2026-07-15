package com.careeros.dashboard.dto;

import java.time.LocalDateTime;

public record ActivityItem(
    String type,
    String message,
    LocalDateTime timestamp) {
}

