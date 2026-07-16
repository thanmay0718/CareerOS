package com.careeros.gamification.dto;

import java.util.List;

public record RewardProfileResponse(
    long coins,
    long xp,
    int level,
    long xpForCurrentLevel,
    long xpForNextLevel,
    long xpRemainingToNextLevel,
    int productivityScore,
    String productivityLabel,
    int completionRate,
    int consistencyScore,
    double focusHoursToday,
    int weeklyImprovement,
    List<AchievementResponse> achievements,
    List<String> unlockedBenefits) {
}
