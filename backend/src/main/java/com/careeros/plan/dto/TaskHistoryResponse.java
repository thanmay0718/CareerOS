package com.careeros.plan.dto;

import com.careeros.plan.enums.MissedTaskReason;
import com.careeros.plan.enums.TaskEventType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskHistoryResponse(
    Long id,
    Long taskId,
    String taskTitle,
    TaskEventType eventType,
    MissedTaskReason missedReason,
    String detail,
    LocalDate previousDueDate,
    LocalDate newDueDate,
    LocalDateTime occurredAt) {
}
