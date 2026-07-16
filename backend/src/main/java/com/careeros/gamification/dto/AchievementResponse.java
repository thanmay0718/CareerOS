package com.careeros.gamification.dto;

public record AchievementResponse(
    String code,
    String title,
    String description,
    boolean unlocked,
    long currentValue,
    long targetValue) {
}
