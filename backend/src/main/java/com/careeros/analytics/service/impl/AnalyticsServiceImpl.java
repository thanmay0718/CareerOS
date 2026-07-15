package com.careeros.analytics.service.impl;

import com.careeros.analytics.dto.AnalyticsDataPointResponse;
import com.careeros.analytics.dto.AnalyticsOverviewResponse;
import com.careeros.analytics.dto.ActivityPointResponse;
import com.careeros.analytics.dto.CategoryDistributionResponse;
import com.careeros.analytics.dto.CheckInAnalyticsResponse;
import com.careeros.analytics.dto.HeatmapDayResponse;
import com.careeros.analytics.dto.AnalyticsSummaryResponse;
import com.careeros.analytics.dto.PlanAnalyticsResponse;
import com.careeros.analytics.dto.PlanProgressItemResponse;
import com.careeros.analytics.dto.ProductivityAnalyticsResponse;
import com.careeros.analytics.dto.PlanStatisticsResponse;
import com.careeros.analytics.dto.StudyHoursResponse;
import com.careeros.analytics.dto.StudyAnalyticsResponse;
import com.careeros.analytics.dto.TaskAnalyticsResponse;
import com.careeros.analytics.dto.TaskStatisticsResponse;
import com.careeros.analytics.service.AnalyticsService;
import com.careeros.checkin.entity.DailyCheckIn;
import com.careeros.checkin.repository.DailyCheckInRepository;
import com.careeros.dashboard.dto.ActivityItem;
import com.careeros.dashboard.dto.DashboardStat;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.user.entity.UserAccount;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

  private final CareerTaskRepository careerTaskRepository;
  private final PlanRepository planRepository;
  private final DailyCheckInRepository dailyCheckInRepository;

  public AnalyticsServiceImpl(
      CareerTaskRepository careerTaskRepository,
      PlanRepository planRepository,
      DailyCheckInRepository dailyCheckInRepository) {
    this.careerTaskRepository = careerTaskRepository;
    this.planRepository = planRepository;
    this.dailyCheckInRepository = dailyCheckInRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<DashboardStat> getDashboardStatistics(UserAccount userAccount) {
    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(userAccount);
    PlanStatisticsSnapshot planSnapshot = planSnapshot(userAccount);
    return List.of(
        new DashboardStat("Total Tasks", String.valueOf(taskSnapshot.totalTasks()), false),
        new DashboardStat("Completed Tasks", String.valueOf(taskSnapshot.completedTasks()), true),
        new DashboardStat("Overdue Tasks", String.valueOf(taskSnapshot.overdueTasks()), false),
        new DashboardStat("Active Plans", String.valueOf(planSnapshot.activePlans()), true),
        new DashboardStat("Completion Rate", formatPercent(taskSnapshot.completionRate()), true),
        new DashboardStat("Current Streak", taskSnapshot.currentStreak() + " days", true));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ActivityItem> getDashboardActivity(UserAccount userAccount) {
    return activityFeed(userAccount);
  }

  @Override
  @Transactional(readOnly = true)
  public AnalyticsSummaryResponse getSummary(UserAccount userAccount) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());

    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(tasks, checkIns, today);
    PlanStatisticsSnapshot planSnapshot = planSnapshot(plans);
    List<ActivityPointResponse> weeklyActivity = buildActivitySeries(tasks, plans, checkIns, today.minusDays(6), today);
    List<ActivityPointResponse> monthlyActivity = buildActivitySeries(tasks, plans, checkIns, today.minusDays(29), today);
    StudyHoursResponse studyHours = new StudyHoursResponse(
        studyHoursFor(checkIns, today),
        studyHoursBetween(checkIns, today.minusDays(6), today),
        studyHoursBetween(checkIns, today.minusDays(29), today));

    return new AnalyticsSummaryResponse(
        new TaskStatisticsResponse(
            taskSnapshot.totalTasks(),
            taskSnapshot.completedTasks(),
            taskSnapshot.pendingTasks(),
            taskSnapshot.overdueTasks(),
            taskSnapshot.completedToday(),
            taskSnapshot.dueTomorrow()),
        new PlanStatisticsResponse(
            planSnapshot.totalPlans(),
            planSnapshot.activePlans(),
            planSnapshot.completedPlans(),
            planSnapshot.archivedPlans(),
            planSnapshot.planAPlans(),
            planSnapshot.planBPlans(),
            planSnapshot.bothPlans()),
        weeklyActivity,
        monthlyActivity,
        studyHours,
        taskSnapshot.completionRate(),
        taskSnapshot.currentStreak());
  }

  @Override
  @Transactional(readOnly = true)
  public AnalyticsOverviewResponse getOverview(UserAccount userAccount) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());

    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(tasks, checkIns, today);
    PlanStatisticsSnapshot planSnapshot = planSnapshot(plans);
    int planCompletion = percent(planSnapshot.completedPlans(), planSnapshot.totalPlans());
    int taskCompletion = percent(taskSnapshot.completedTasks(), taskSnapshot.totalTasks());
    int studyConsistency = consistencyScore(checkIns, today);
    int weeklyProductivity = productivityScore(tasks, plans, checkIns, today.minusDays(6), today);
    int monthlyProductivity = productivityScore(tasks, plans, checkIns, today.minusDays(29), today);
    int placementReadiness = blendScores(taskCompletion, planCompletion, studyConsistency);
    int resumeReadiness = blendScores(taskCompletion, studyConsistency, weeklyProductivity);
    int interviewReadiness = blendScores(taskCompletion, weeklyProductivity, monthlyProductivity);
    int learningProgress = blendScores(planCompletion, studyConsistency, monthlyProductivity);
    int overallCareerScore = blendScores(placementReadiness, resumeReadiness, interviewReadiness, learningProgress);

    return new AnalyticsOverviewResponse(
        overallCareerScore,
        planCompletion,
        taskCompletion,
        studyConsistency,
        weeklyProductivity,
        monthlyProductivity,
        placementReadiness,
        resumeReadiness,
        interviewReadiness,
        learningProgress);
  }

  @Override
  @Transactional(readOnly = true)
  public StudyAnalyticsResponse getStudyAnalytics(UserAccount userAccount) {
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    List<AnalyticsDataPointResponse> weeklyStudyHours = buildStudySeries(checkIns, today.minusDays(6), today);
    List<AnalyticsDataPointResponse> monthlyStudyHours = buildStudySeries(checkIns, today.minusDays(29), today);
    List<HeatmapDayResponse> heatmap = buildHeatmap(checkIns, today.minusDays(29), today);
    return new StudyAnalyticsResponse(weeklyStudyHours, monthlyStudyHours, heatmap);
  }

  @Override
  @Transactional(readOnly = true)
  public TaskAnalyticsResponse getTaskAnalytics(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    List<AnalyticsDataPointResponse> dailyCompleted = buildCompletedTaskSeries(tasks, today, today);
    List<AnalyticsDataPointResponse> weeklyCompleted = buildCompletedTaskSeries(tasks, today.minusDays(6), today);
    List<AnalyticsDataPointResponse> monthlyCompleted = buildCompletedTaskSeries(tasks, today.minusDays(29), today);
    List<CategoryDistributionResponse> distribution = buildCategoryDistribution(tasks);
    return new TaskAnalyticsResponse(dailyCompleted, weeklyCompleted, monthlyCompleted, distribution);
  }

  @Override
  @Transactional(readOnly = true)
  public PlanAnalyticsResponse getPlanAnalytics(UserAccount userAccount) {
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    List<PlanProgressItemResponse> planProgress = plans.stream()
        .map(plan -> toPlanProgress(plan, tasks, today))
        .toList();
    return new PlanAnalyticsResponse(planProgress);
  }

  @Override
  @Transactional(readOnly = true)
  public CheckInAnalyticsResponse getCheckInAnalytics(UserAccount userAccount) {
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    double averageStudyHours = checkIns.stream()
        .mapToDouble(checkIn -> checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours())
        .average()
        .orElse(0d);
    return new CheckInAnalyticsResponse(
        checkIns.size(),
        roundHours(averageStudyHours),
        buildHeatmap(checkIns, today.minusDays(29), today));
  }

  @Override
  @Transactional(readOnly = true)
  public ProductivityAnalyticsResponse getProductivityAnalytics(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    int dailyProductivity = productivityScore(tasks, plans, checkIns, today, today);
    int weeklyProductivity = productivityScore(tasks, plans, checkIns, today.minusDays(6), today);
    int monthlyProductivity = productivityScore(tasks, plans, checkIns, today.minusDays(29), today);
    long currentStreak = calculateStreak(today, checkIns);
    int consistencyScore = consistencyScore(checkIns, today);
    return new ProductivityAnalyticsResponse(dailyProductivity, weeklyProductivity, monthlyProductivity, currentStreak, consistencyScore);
  }

  private TaskStatisticsSnapshot taskSnapshot(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    return taskSnapshot(tasks, checkIns, LocalDate.now(ZoneId.systemDefault()));
  }

  private TaskStatisticsSnapshot taskSnapshot(List<CareerTask> tasks, List<DailyCheckIn> checkIns, LocalDate today) {
    long totalTasks = tasks.size();
    long completedTasks = tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    long pendingTasks = totalTasks - completedTasks;
    long overdueTasks = tasks.stream()
        .filter(task -> task.getDueDate() != null
            && task.getTaskStatus() != TaskStatus.COMPLETED
            && task.getDueDate().isBefore(today))
        .count();
    long completedToday = tasks.stream()
        .filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED && today.equals(task.getCompletedAt()))
        .count();
    long dueTomorrow = tasks.stream()
        .filter(task -> task.getDueDate() != null
            && task.getTaskStatus() != TaskStatus.COMPLETED
            && task.getDueDate().equals(today.plusDays(1)))
        .count();
    long currentStreak = calculateStreak(today, checkIns);
    double completionRate = totalTasks == 0 ? 0d : (completedTasks * 100.0) / totalTasks;
    return new TaskStatisticsSnapshot(totalTasks, completedTasks, pendingTasks, overdueTasks, completedToday, dueTomorrow, completionRate, currentStreak);
  }

  private PlanStatisticsSnapshot planSnapshot(UserAccount userAccount) {
    return planSnapshot(planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()));
  }

  private PlanStatisticsSnapshot planSnapshot(List<Plan> plans) {
    long totalPlans = plans.size();
    long activePlans = plans.stream().filter(plan -> plan.getPlanStatus() == PlanStatus.ACTIVE).count();
    long completedPlans = plans.stream().filter(plan -> plan.getPlanStatus() == PlanStatus.COMPLETED).count();
    long archivedPlans = plans.stream().filter(plan -> plan.getPlanStatus() == PlanStatus.ARCHIVED).count();
    long planAPlans = plans.stream().filter(plan -> plan.getPlanType() == PlanType.PLAN_A).count();
    long planBPlans = plans.stream().filter(plan -> plan.getPlanType() == PlanType.PLAN_B).count();
    long bothPlans = plans.stream().filter(plan -> plan.getPlanType() == PlanType.BOTH).count();
    return new PlanStatisticsSnapshot(totalPlans, activePlans, completedPlans, archivedPlans, planAPlans, planBPlans, bothPlans);
  }

  private List<ActivityItem> activityFeed(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());

    Stream<ActivityItem> planActivities = plans.stream()
        .sorted(Comparator.comparing(Plan::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .limit(5)
        .map(plan -> new ActivityItem("Plan", "Created plan: " + plan.getTitle(), plan.getCreatedAt()));

    Stream<ActivityItem> taskActivities = tasks.stream()
        .sorted(Comparator.comparing(CareerTask::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .limit(5)
        .map(task -> new ActivityItem(
            task.getTaskStatus() == TaskStatus.COMPLETED ? "Task Completed" : "Task Created",
            task.getTaskStatus() == TaskStatus.COMPLETED
                ? "Completed task: " + task.getTitle()
                : "Created task: " + task.getTitle(),
            task.getTaskStatus() == TaskStatus.COMPLETED && task.getCompletedAt() != null
                ? task.getUpdatedAt()
                : task.getCreatedAt()));

    Stream<ActivityItem> checkInActivities = checkIns.stream()
        .sorted(Comparator.comparing(DailyCheckIn::getCheckInDate).reversed())
        .limit(5)
        .map(checkIn -> new ActivityItem(
            "Check-in",
            "Completed check-in for " + checkIn.getCheckInDate(),
            LocalDateTime.of(checkIn.getCheckInDate(), LocalTime.NOON)));

    return Stream.of(planActivities, taskActivities, checkInActivities)
        .flatMap(stream -> stream)
        .sorted(Comparator.comparing(ActivityItem::timestamp, Comparator.nullsLast(Comparator.reverseOrder())))
        .limit(10)
        .toList();
  }

  private List<ActivityPointResponse> buildActivitySeries(
      List<CareerTask> tasks,
      List<Plan> plans,
      List<DailyCheckIn> checkIns,
      LocalDate startDate,
      LocalDate endDate) {
    Map<LocalDate, ActivityAccumulator> buckets = new HashMap<>();
    LocalDate cursor = startDate;
    while (!cursor.isAfter(endDate)) {
      buckets.put(cursor, new ActivityAccumulator());
      cursor = cursor.plusDays(1);
    }

    tasks.stream()
        .filter(task -> task.getCompletedAt() != null && !task.getCompletedAt().isBefore(startDate) && !task.getCompletedAt().isAfter(endDate))
        .forEach(task -> buckets.computeIfAbsent(task.getCompletedAt(), unused -> new ActivityAccumulator()).tasksCompleted++);

    plans.stream()
        .filter(plan -> plan.getCreatedAt() != null)
        .forEach(plan -> {
          LocalDate createdDate = plan.getCreatedAt().toLocalDate();
          if (!createdDate.isBefore(startDate) && !createdDate.isAfter(endDate)) {
            buckets.computeIfAbsent(createdDate, unused -> new ActivityAccumulator()).plansCreated++;
          }
        });

    checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(startDate) && !checkIn.getCheckInDate().isAfter(endDate))
        .forEach(checkIn -> {
          ActivityAccumulator bucket = buckets.computeIfAbsent(checkIn.getCheckInDate(), unused -> new ActivityAccumulator());
          bucket.checkIns++;
          bucket.studyHours += checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours();
        });

    return buckets.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new ActivityPointResponse(
            entry.getKey(),
            entry.getValue().tasksCompleted,
            entry.getValue().plansCreated,
            entry.getValue().checkIns,
            roundHours(entry.getValue().studyHours)))
        .toList();
  }

  private double studyHoursFor(List<DailyCheckIn> checkIns, LocalDate date) {
    return checkIns.stream()
        .filter(checkIn -> date.equals(checkIn.getCheckInDate()))
        .map(DailyCheckIn::getStudyHours)
        .findFirst()
        .orElse(0d);
  }

  private double studyHoursBetween(List<DailyCheckIn> checkIns, LocalDate startDate, LocalDate endDate) {
    return roundHours(checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(startDate) && !checkIn.getCheckInDate().isAfter(endDate))
        .mapToDouble(checkIn -> checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours())
        .sum());
  }

  private long calculateStreak(LocalDate today, List<DailyCheckIn> checkIns) {
    List<LocalDate> activeDates = checkIns.stream()
        .map(DailyCheckIn::getCheckInDate)
        .toList();
    if (activeDates.isEmpty()) {
      return 0;
    }
    long streak = 0;
    LocalDate cursor = today;
    while (activeDates.contains(cursor)) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }

  private String formatPercent(double value) {
    return BigDecimal.valueOf(value).setScale(0, RoundingMode.HALF_UP).toPlainString() + "%";
  }

  private double roundHours(double hours) {
    return BigDecimal.valueOf(hours).setScale(1, RoundingMode.HALF_UP).doubleValue();
  }

  private List<AnalyticsDataPointResponse> buildStudySeries(List<DailyCheckIn> checkIns, LocalDate startDate, LocalDate endDate) {
    Map<LocalDate, Double> hoursByDate = new HashMap<>();
    LocalDate cursor = startDate;
    while (!cursor.isAfter(endDate)) {
      hoursByDate.put(cursor, 0d);
      cursor = cursor.plusDays(1);
    }

    checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(startDate) && !checkIn.getCheckInDate().isAfter(endDate))
        .forEach(checkIn -> hoursByDate.merge(
            checkIn.getCheckInDate(),
            checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours(),
            Double::sum));

    return hoursByDate.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new AnalyticsDataPointResponse(entry.getKey(), roundHours(entry.getValue())))
        .toList();
  }

  private List<AnalyticsDataPointResponse> buildCompletedTaskSeries(List<CareerTask> tasks, LocalDate startDate, LocalDate endDate) {
    Map<LocalDate, Long> countsByDate = new HashMap<>();
    LocalDate cursor = startDate;
    while (!cursor.isAfter(endDate)) {
      countsByDate.put(cursor, 0L);
      cursor = cursor.plusDays(1);
    }

    tasks.stream()
        .filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED
            && task.getCompletedAt() != null
            && !task.getCompletedAt().isBefore(startDate)
            && !task.getCompletedAt().isAfter(endDate))
        .forEach(task -> countsByDate.merge(task.getCompletedAt(), 1L, Long::sum));

    return countsByDate.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new AnalyticsDataPointResponse(entry.getKey(), entry.getValue()))
        .toList();
  }

  private List<CategoryDistributionResponse> buildCategoryDistribution(List<CareerTask> tasks) {
    Map<String, Long> counts = tasks.stream()
        .collect(java.util.stream.Collectors.groupingBy(
            task -> task.getCategory().name(),
            java.util.stream.Collectors.counting()));
    long total = tasks.size();
    return counts.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new CategoryDistributionResponse(
            formatCategory(entry.getKey()),
            entry.getValue(),
            total == 0 ? 0d : roundPercent((entry.getValue() * 100.0) / total)))
        .toList();
  }

  private List<HeatmapDayResponse> buildHeatmap(List<DailyCheckIn> checkIns, LocalDate startDate, LocalDate endDate) {
    Map<LocalDate, HeatmapAccumulator> buckets = new HashMap<>();
    LocalDate cursor = startDate;
    while (!cursor.isAfter(endDate)) {
      buckets.put(cursor, new HeatmapAccumulator());
      cursor = cursor.plusDays(1);
    }

    checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(startDate) && !checkIn.getCheckInDate().isAfter(endDate))
        .forEach(checkIn -> {
          HeatmapAccumulator bucket = buckets.computeIfAbsent(checkIn.getCheckInDate(), unused -> new HeatmapAccumulator());
          bucket.checkIns++;
          bucket.studyHours += checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours();
        });

    return buckets.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> new HeatmapDayResponse(
            entry.getKey(),
            intensityFor(entry.getValue().studyHours, entry.getValue().checkIns),
            roundHours(entry.getValue().studyHours),
            entry.getValue().checkIns))
        .toList();
  }

  private PlanProgressItemResponse toPlanProgress(Plan plan, List<CareerTask> tasks, LocalDate today) {
    List<CareerTask> relatedTasks = tasks.stream()
        .filter(task -> belongsToPlan(task, plan))
        .toList();
    long totalTasks = relatedTasks.size();
    long completedTasks = relatedTasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    int progress = percent(completedTasks, totalTasks);
    long remainingDays = plan.getExpectedEndDate() == null ? 0 : Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(today, plan.getExpectedEndDate()));
    return new PlanProgressItemResponse(
        plan.getId(),
        plan.getTitle(),
        plan.getPlanType().name(),
        plan.getPlanStatus().name(),
        progress,
        remainingDays,
        completedTasks,
        totalTasks,
        plan.getExpectedEndDate());
  }

  private boolean belongsToPlan(CareerTask task, Plan plan) {
    if (task.getPlan() != null) {
      return task.getPlan().getId().equals(plan.getId());
    }
    if (plan.getPlanType() == PlanType.BOTH) {
      return true;
    }
    return task.getPlanType() == PlanType.BOTH || task.getPlanType() == plan.getPlanType();
  }

  private int percent(long completed, long total) {
    return total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
  }

  private int blendScores(int... scores) {
    if (scores.length == 0) {
      return 0;
    }
    int total = 0;
    for (int score : scores) {
      total += score;
    }
    return Math.min(100, Math.max(0, Math.round(total / (float) scores.length)));
  }

  private int consistencyScore(List<DailyCheckIn> checkIns, LocalDate today) {
    long streak = calculateStreak(today, checkIns);
    long recentCheckIns = checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(today.minusDays(6)) && !checkIn.getCheckInDate().isAfter(today))
        .count();
    return blendScores(percent(recentCheckIns, 7), (int) Math.min(100, streak * 15));
  }

  private int productivityScore(List<CareerTask> tasks, List<Plan> plans, List<DailyCheckIn> checkIns, LocalDate startDate, LocalDate endDate) {
    long completedTasks = tasks.stream()
        .filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED
            && task.getCompletedAt() != null
            && !task.getCompletedAt().isBefore(startDate)
            && !task.getCompletedAt().isAfter(endDate))
        .count();
    long totalTasks = tasks.stream()
        .filter(task -> task.getCreatedAt() != null
            && !task.getCreatedAt().toLocalDate().isBefore(startDate)
            && !task.getCreatedAt().toLocalDate().isAfter(endDate))
        .count();
    long checkInCount = checkIns.stream()
        .filter(checkIn -> !checkIn.getCheckInDate().isBefore(startDate) && !checkIn.getCheckInDate().isAfter(endDate))
        .count();
    long planCount = plans.stream()
        .filter(plan -> plan.getCreatedAt() != null
            && !plan.getCreatedAt().toLocalDate().isBefore(startDate)
            && !plan.getCreatedAt().toLocalDate().isAfter(endDate))
        .count();
    return blendScores(percent(completedTasks, Math.max(1, totalTasks)), percent(checkInCount, 7), percent(planCount, 3));
  }

  private int intensityFor(double studyHours, long checkIns) {
    if (checkIns == 0 && studyHours == 0d) {
      return 0;
    }
    if (studyHours >= 6d) {
      return 4;
    }
    if (studyHours >= 4d) {
      return 3;
    }
    if (studyHours >= 2d) {
      return 2;
    }
    return 1;
  }

  private double roundPercent(double value) {
    return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
  }

  private String formatCategory(String value) {
    return switch (value) {
      case "SPRING_BOOT" -> "Spring Boot";
      case "SYSTEM_DESIGN" -> "System Design";
      case "DAILY" -> value;
      default -> value.charAt(0) + value.substring(1).toLowerCase().replace('_', ' ');
    };
  }

  private static final class HeatmapAccumulator {
    private long checkIns;
    private double studyHours;
  }

  private record TaskStatisticsSnapshot(
      long totalTasks,
      long completedTasks,
      long pendingTasks,
      long overdueTasks,
      long completedToday,
      long dueTomorrow,
      double completionRate,
      long currentStreak) {
  }

  private record PlanStatisticsSnapshot(
      long totalPlans,
      long activePlans,
      long completedPlans,
      long archivedPlans,
      long planAPlans,
      long planBPlans,
      long bothPlans) {
  }

  private static final class ActivityAccumulator {
    private long tasksCompleted;
    private long plansCreated;
    private long checkIns;
    private double studyHours;
  }
}
