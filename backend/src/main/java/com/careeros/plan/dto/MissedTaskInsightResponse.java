package com.careeros.plan.dto;

import com.careeros.plan.enums.MissedTaskReason;

public record MissedTaskInsightResponse(
    MissedTaskReason reason,
    long count) {
}
