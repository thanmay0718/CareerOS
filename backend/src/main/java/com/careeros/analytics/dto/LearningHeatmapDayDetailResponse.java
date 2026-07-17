package com.careeros.analytics.dto;

import java.time.LocalDate;
import java.util.List;

public record LearningHeatmapDayDetailResponse(
    LocalDate date,
    int totalStudyMinutes,
    long learningSessions,
    List<String> technologiesStudied,
    long conceptsCompleted,
    long notesCreated,
    long tasksCompleted,
    long roadmapsUpdated,
    long quizScores,
    long bookmarksAdded,
    long resourcesRead,
    long videosWatched,
    long practiceProblemsSolved,
    List<String> achievementsEarned,
    String dailyReflection,
    List<String> attachments,
    List<String> calendarEvents,
    boolean goalCompleted,
    int productivityScore) {
}
