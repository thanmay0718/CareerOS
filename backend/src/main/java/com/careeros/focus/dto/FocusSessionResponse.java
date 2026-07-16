package com.careeros.focus.dto;

import java.time.LocalDateTime;

public record FocusSessionResponse(
    Long id,
    Integer durationMinutes,
    String sessionType,
    LocalDateTime completedAt) {
}
