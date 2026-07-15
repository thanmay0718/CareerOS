package com.careeros.notification.dto;

import com.careeros.notification.enums.NotificationStatus;
import com.careeros.notification.enums.NotificationType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    NotificationType type,
    NotificationStatus status,
    String title,
    String message,
    String actionLabel,
    String actionPath,
    String sourceType,
    Long sourceId,
    LocalDate referenceDate,
    LocalDate resolvedAt,
    LocalDateTime createdAt,
    boolean unread) {
}
