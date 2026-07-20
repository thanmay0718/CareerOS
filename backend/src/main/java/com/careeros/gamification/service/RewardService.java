package com.careeros.gamification.service;

import com.careeros.checkin.entity.DailyCheckIn;
import com.careeros.checkin.repository.DailyCheckInRepository;
import com.careeros.gamification.dto.AchievementResponse;
import com.careeros.gamification.dto.RewardProfileResponse;
import com.careeros.gamification.entity.UserRewardProfile;
import com.careeros.gamification.repository.UserRewardProfileRepository;
import com.careeros.notes.repository.KnowledgeNoteRepository;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.user.entity.UserAccount;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

  private final UserRewardProfileRepository rewardProfileRepository;
  private final CareerTaskRepository careerTaskRepository;
  private final DailyCheckInRepository dailyCheckInRepository;
  private final KnowledgeNoteRepository knowledgeNoteRepository;

  public RewardService(
      UserRewardProfileRepository rewardProfileRepository,
      CareerTaskRepository careerTaskRepository,
      DailyCheckInRepository dailyCheckInRepository,
      KnowledgeNoteRepository knowledgeNoteRepository) {
    this.rewardProfileRepository = rewardProfileRepository;
    this.careerTaskRepository = careerTaskRepository;
    this.dailyCheckInRepository = dailyCheckInRepository;
    this.knowledgeNoteRepository = knowledgeNoteRepository;
  }

  @Transactional
  public RewardProfileResponse refresh(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    long notes = knowledgeNoteRepository.countByUserId(userAccount.getId());
    long completedTasks = tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    long currentStreak = calculateStreak(today, checkIns);
    UserRewardProfile profile = rewardProfileRepository.findByUserId(userAccount.getId())
        .orElseGet(() -> new UserRewardProfile(userAccount));

    long coins = profile.getLoginCoins()
        + checkIns.size() * 2L
        + completedTasks * 5L
        + (completedTasks / 5L) * 20L
        + notes * 3L
        + (currentStreak >= 7 ? 30L : 0L);
    long xp = checkIns.size() * 10L
        + completedTasks * 25L
        + notes * 15L
        + (currentStreak >= 7 ? 120L : 0L);
    int productivityScore = productivityScore(tasks, checkIns);
    int completionRate = percent(completedTasks, tasks.size());
    int consistencyScore = consistencyScore(today, checkIns);
    double focusHoursToday = checkIns.stream()
        .filter(checkIn -> today.equals(checkIn.getCheckInDate()))
        .findFirst()
        .map(checkIn -> checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours())
        .orElse(0d);
    int weeklyImprovement = weeklyImprovement(today, checkIns);

    profile.update(coins, xp, productivityScore);
    UserRewardProfile saved = rewardProfileRepository.save(profile);
    return toResponse(saved, completionRate, consistencyScore, focusHoursToday, weeklyImprovement, achievements(completedTasks, currentStreak, checkIns, notes));
  }

  private RewardProfileResponse toResponse(
      UserRewardProfile profile,
      int completionRate,
      int consistencyScore,
      double focusHoursToday,
      int weeklyImprovement,
      List<AchievementResponse> achievements) {
    return new RewardProfileResponse(
        profile.getCoins(),
        profile.getXp(),
        profile.getLevel(),
        profile.getXpForCurrentLevel(),
        profile.getXpForNextLevel(),
        profile.getXpRemainingToNextLevel(),
        profile.getProductivityScore(),
        productivityLabel(profile.getProductivityScore()),
        completionRate,
        consistencyScore,
        focusHoursToday,
        weeklyImprovement,
        achievements,
        unlockedBenefits(profile.getLevel()));
  }

  private int productivityScore(List<CareerTask> tasks, List<DailyCheckIn> checkIns) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    long dueToday = tasks.stream().filter(task -> today.equals(task.getDueDate())).count();
    long completedToday = tasks.stream()
        .filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED && today.equals(task.getCompletedAt()))
        .count();
    int completionScore = dueToday == 0 ? 0 : (int) Math.round((completedToday * 100.0) / dueToday);
    int checkInScore = checkIns.stream()
        .filter(checkIn -> today.equals(checkIn.getCheckInDate()))
        .findFirst()
        .map(checkIn -> Math.min(100, (int) Math.round((checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours()) * 20)))
        .orElse(0);
    if (dueToday == 0 && checkInScore == 0) {
      return 0;
    }
    return (int) Math.round((completionScore * 0.7) + (checkInScore * 0.3));
  }

  private long calculateStreak(LocalDate today, List<DailyCheckIn> checkIns) {
    List<LocalDate> activeDates = checkIns.stream().map(DailyCheckIn::getCheckInDate).toList();
    LocalDate latestActiveDate = activeDates.stream()
        .filter(date -> !date.isAfter(today))
        .max(LocalDate::compareTo)
        .orElse(null);
    if (latestActiveDate == null) {
      return 0;
    }
    long streak = 0;
    LocalDate cursor = latestActiveDate;
    while (activeDates.contains(cursor)) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }

  private int percent(long value, long total) {
    return total == 0 ? 0 : (int) Math.round((value * 100.0) / total);
  }

  private int consistencyScore(LocalDate today, List<DailyCheckIn> checkIns) {
    long activeDays = checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(today.minusDays(6)) && !checkIn.getCheckInDate().isAfter(today))
        .count();
    return percent(activeDays, 7);
  }

  private int weeklyImprovement(LocalDate today, List<DailyCheckIn> checkIns) {
    double thisWeek = studyHoursBetween(checkIns, today.minusDays(6), today);
    double lastWeek = studyHoursBetween(checkIns, today.minusDays(13), today.minusDays(7));
    if (lastWeek == 0d) {
      return thisWeek == 0d ? 0 : 100;
    }
    return (int) Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }

  private double studyHoursBetween(List<DailyCheckIn> checkIns, LocalDate start, LocalDate end) {
    return checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(start) && !checkIn.getCheckInDate().isAfter(end))
        .mapToDouble(checkIn -> checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours())
        .sum();
  }

  private String productivityLabel(int score) {
    if (score >= 85) {
      return "Excellent";
    }
    if (score >= 65) {
      return "Strong";
    }
    if (score >= 40) {
      return "Building";
    }
    return "Needs attention";
  }

  private List<AchievementResponse> achievements(long completedTasks, long currentStreak, List<DailyCheckIn> checkIns, long notes) {
    long problemsSolved = checkIns.stream().mapToLong(checkIn -> checkIn.getProblemsSolved() == null ? 0 : checkIn.getProblemsSolved()).sum();
    return List.of(
        new AchievementResponse("FIRST_TASK", "First Task", "Complete your first task.", completedTasks >= 1, completedTasks, 1),
        new AchievementResponse("SEVEN_DAY_STREAK", "Seven Day Streak", "Check in for seven days in a row.", currentStreak >= 7, currentStreak, 7),
        new AchievementResponse("HUNDRED_PROBLEMS", "100 Problems Solved", "Solve 100 practice problems.", problemsSolved >= 100, problemsSolved, 100),
        new AchievementResponse("NOTE_BUILDER", "Revision Note Builder", "Create 10 revision notes.", notes >= 10, notes, 10),
        new AchievementResponse("CONSISTENCY_CHAMPION", "Consistency Champion", "Complete 25 tasks.", completedTasks >= 25, completedTasks, 25));
  }

  private List<String> unlockedBenefits(int level) {
    if (level >= 10) {
      return List.of("Achievements", "Profile Frames", "Themes", "Future AI Features");
    }
    if (level >= 5) {
      return List.of("Achievements", "Profile Frames", "Themes");
    }
    if (level >= 2) {
      return List.of("Achievements", "Profile Frames");
    }
    return List.of("Achievements");
  }
}
