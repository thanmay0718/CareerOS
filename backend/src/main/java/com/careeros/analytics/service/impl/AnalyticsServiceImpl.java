package com.careeros.analytics.service.impl;

import com.careeros.analytics.dto.AnalyticsDataPointResponse;
import com.careeros.analytics.dto.AnalyticsOverviewResponse;
import com.careeros.analytics.dto.AnalyticsInsightResponse;
import com.careeros.analytics.dto.AnalyticsStoryResponse;
import com.careeros.analytics.dto.ActivityPointResponse;
import com.careeros.analytics.dto.CategoryDistributionResponse;
import com.careeros.analytics.dto.CheckInAnalyticsResponse;
import com.careeros.analytics.dto.HeatmapDayResponse;
import com.careeros.analytics.dto.LearningHeatmapDayDetailResponse;
import com.careeros.analytics.dto.LearningHeatmapResponse;
import com.careeros.analytics.dto.LearningHeatmapSummaryResponse;
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
import com.careeros.focus.entity.FocusSession;
import com.careeros.focus.repository.FocusSessionRepository;
import com.careeros.notes.entity.KnowledgeNote;
import com.careeros.notes.repository.KnowledgeNoteRepository;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.roadmap.entity.LearningTopic;
import com.careeros.roadmap.enums.LearningStatus;
import com.careeros.roadmap.repository.LearningTopicRepository;
import com.careeros.user.entity.UserAccount;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

  private final CareerTaskRepository careerTaskRepository;
  private final PlanRepository planRepository;
  private final DailyCheckInRepository dailyCheckInRepository;
  private final FocusSessionRepository focusSessionRepository;
  private final KnowledgeNoteRepository knowledgeNoteRepository;
  private final LearningTopicRepository learningTopicRepository;

  public AnalyticsServiceImpl(
      CareerTaskRepository careerTaskRepository,
      PlanRepository planRepository,
      DailyCheckInRepository dailyCheckInRepository,
      FocusSessionRepository focusSessionRepository,
      KnowledgeNoteRepository knowledgeNoteRepository,
      LearningTopicRepository learningTopicRepository) {
    this.careerTaskRepository = careerTaskRepository;
    this.planRepository = planRepository;
    this.dailyCheckInRepository = dailyCheckInRepository;
    this.focusSessionRepository = focusSessionRepository;
    this.knowledgeNoteRepository = knowledgeNoteRepository;
    this.learningTopicRepository = learningTopicRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<DashboardStat> getDashboardStatistics(UserAccount userAccount) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(userAccount);
    PlanStatisticsSnapshot planSnapshot = planSnapshot(userAccount);
    long streak = Math.max(taskSnapshot.currentStreak(), currentLearningStreakForUser(userAccount, today));
    return List.of(
        new DashboardStat("Total Tasks", String.valueOf(taskSnapshot.totalTasks()), false),
        new DashboardStat("Completed Tasks", String.valueOf(taskSnapshot.completedTasks()), true),
        new DashboardStat("Overdue Tasks", String.valueOf(taskSnapshot.overdueTasks()), false),
        new DashboardStat("Active Plans", String.valueOf(planSnapshot.activePlans()), true),
        new DashboardStat("Completion Rate", formatPercent(taskSnapshot.completionRate()), true),
        new DashboardStat("Current Streak", streak + " days", true));
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
    List<FocusSession> focusSessions = focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userAccount.getId());
    List<KnowledgeNote> notes = knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<LearningTopic> topics = learningTopicRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());

    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(tasks, checkIns, today);
    PlanStatisticsSnapshot planSnapshot = planSnapshot(plans);
    List<ActivityPointResponse> weeklyActivity = buildActivitySeries(tasks, plans, checkIns, today.minusDays(6), today);
    List<ActivityPointResponse> monthlyActivity = buildActivitySeries(tasks, plans, checkIns, today.minusDays(29), today);
    long learningStreak = currentLearningStreak(today, buildLearningHeatmapDays(
        tasks,
        plans,
        checkIns,
        focusSessions,
        notes,
        topics,
        today.minusDays(364),
        today));
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
        Math.max(taskSnapshot.currentStreak(), learningStreak));
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

  @Override
  @Transactional(readOnly = true)
  public AnalyticsStoryResponse getStory(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    TaskStatisticsSnapshot taskSnapshot = taskSnapshot(tasks, checkIns, today);
    int todaysProductivity = productivityScore(tasks, plans, checkIns, today, today);
    int consistency = consistencyScore(checkIns, today);
    double focusHours = studyHoursFor(checkIns, today);
    double thisWeekHours = studyHoursBetween(checkIns, today.minusDays(6), today);
    double lastWeekHours = studyHoursBetween(checkIns, today.minusDays(13), today.minusDays(7));
    int weeklyImprovement = lastWeekHours == 0d ? (thisWeekHours == 0d ? 0 : 100) : (int) Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100);
    String weakestCategory = weakestCategory(tasks);
    String strongestCategory = strongestCategory(tasks);
    List<AnalyticsInsightResponse> insights = List.of(
        new AnalyticsInsightResponse(
            "What improved?",
            weeklyImprovement >= 0 ? "Study time improved this week." : "Study time dropped this week.",
            "This week: " + roundHours(thisWeekHours) + "h, previous week: " + roundHours(lastWeekHours) + "h.",
            "Open check-ins",
            "/practice",
            weeklyImprovement >= 0 ? "POSITIVE" : "WARNING"),
        new AnalyticsInsightResponse(
            "Which habit is improving?",
            consistency >= 70 ? "Daily consistency is becoming reliable." : "Daily consistency needs attention.",
            "You checked in on " + Math.round((consistency / 100.0) * 7) + " of the last 7 days.",
            "Open check-ins",
            "/practice",
            consistency >= 70 ? "POSITIVE" : "WARNING"),
        new AnalyticsInsightResponse(
            "Which skill needs attention?",
            weakestCategory == null ? "No weak area can be calculated yet." : weakestCategory + " has the weakest completion pattern.",
            weakestCategory == null ? "Add categorized tasks to unlock skill insights." : "Backend compared completion by task category.",
            "Open practice",
            "/practice",
            weakestCategory == null ? "NEUTRAL" : "WARNING"),
        new AnalyticsInsightResponse(
            "What should I focus on next?",
            weakestCategory == null ? "Create categorized practice tasks." : "Practice " + weakestCategory + " next.",
            strongestCategory == null ? "No strong area calculated yet." : "Strong area: " + strongestCategory + ".",
            "Open practice",
            "/practice",
            "ACTION"));
    return new AnalyticsStoryResponse(
        todaysProductivity,
        productivityLabel(todaysProductivity),
        (int) Math.round(taskSnapshot.completionRate()),
        consistency,
        focusHours,
        weeklyImprovement,
        weakestCategory == null ? "Add categorized work so CareerOS can recommend a focused topic." : "Practice " + weakestCategory + " tomorrow.",
        insights,
        buildHeatmap(checkIns, today.minusDays(29), today));
  }

  @Override
  @Transactional(readOnly = true)
  public LearningHeatmapResponse getLearningHeatmap(UserAccount userAccount, Integer year) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    int selectedYear = year == null ? today.getYear() : year;
    LocalDate startDate = LocalDate.of(selectedYear, 1, 1);
    LocalDate endDate = LocalDate.of(selectedYear, 12, 31);

    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    List<FocusSession> focusSessions = focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userAccount.getId());
    List<KnowledgeNote> notes = knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<LearningTopic> topics = learningTopicRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());

    List<HeatmapDayResponse> days = buildLearningHeatmapDays(tasks, plans, checkIns, focusSessions, notes, topics, startDate, endDate);
    long activeDays = days.stream().filter(day -> day.studyMinutes() > 0 || day.tasksCompleted() > 0 || day.completedConcepts() > 0).count();
    long totalMinutes = days.stream().mapToLong(HeatmapDayResponse::studyMinutes).sum();
    long totalSessions = days.stream().mapToLong(HeatmapDayResponse::checkIns).sum();
    long longestStreak = longestStreak(days);
    long currentStreak = selectedYear == today.getYear() ? currentLearningStreak(today, days) : streakEndingAt(endDate, days);
    long elapsedDays = selectedYear == today.getYear()
        ? ChronoUnit.DAYS.between(startDate, today.plusDays(1))
        : ChronoUnit.DAYS.between(startDate, endDate.plusDays(1));
    int completionPercentage = percent(activeDays, Math.max(1, elapsedDays));

    LearningHeatmapSummaryResponse summary = new LearningHeatmapSummaryResponse(
        roundHours(totalMinutes / 60.0),
        totalSessions,
        activeDays,
        currentStreak,
        longestStreak,
        elapsedDays == 0 ? 0d : roundHours(totalMinutes / (double) elapsedDays),
        completionPercentage,
        selectedYear);

    return new LearningHeatmapResponse(
        summary,
        days,
        buildDayValueSeries(days, "hours"),
        buildWeeklyProgress(days),
        buildMonthlyGrowth(days),
        buildDayValueSeries(days, "streak"),
        buildDayValueSeries(days, "productivity"),
        buildTechnologyBreakdown(days),
        buildLearningAchievements(summary, topics),
        buildSmartInsights(days, summary, today),
        availableYears(checkIns, focusSessions, tasks, notes, topics, today.getYear()));
  }

  @Override
  @Transactional(readOnly = true)
  public LearningHeatmapDayDetailResponse getLearningHeatmapDay(UserAccount userAccount, LocalDate date) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    List<FocusSession> focusSessions = focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userAccount.getId());
    List<KnowledgeNote> notes = knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<LearningTopic> topics = learningTopicRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());

    HeatmapDayResponse day = buildLearningHeatmapDays(tasks, plans, checkIns, focusSessions, notes, topics, date, date).get(0);
    DailyCheckIn checkIn = checkIns.stream()
        .filter(item -> date.equals(item.getCheckInDate()))
        .findFirst()
        .orElse(null);
    List<KnowledgeNote> dayNotes = notes.stream()
        .filter(note -> note.getCreatedAt() != null && date.equals(note.getCreatedAt().toLocalDate()))
        .toList();
    List<String> attachments = dayNotes.stream()
        .flatMap(note -> splitCsv(note.getAttachmentUrls()).stream())
        .toList();
    String reflection = checkIn == null
        ? "No reflection was recorded for this day."
        : Stream.of(checkIn.getTodaysAchievement(), checkIn.getTodaysBlocker(), checkIn.getTomorrowGoal(), checkIn.getNotes())
            .filter(value -> value != null && !value.isBlank())
            .collect(Collectors.joining(" "));

    return new LearningHeatmapDayDetailResponse(
        date,
        day.studyMinutes(),
        day.checkIns(),
        day.topics(),
        day.completedConcepts(),
        day.notesCreated(),
        day.tasksCompleted(),
        plansUpdatedOn(plans, date),
        0,
        0,
        attachments.size(),
        0,
        checkIn == null ? 0 : nullToZero(checkIn.getProblemsSolved()),
        buildDayAchievements(day),
        reflection,
        attachments,
        List.of(),
        day.goalCompleted(),
        day.productivityScore());
  }

  private TaskStatisticsSnapshot taskSnapshot(UserAccount userAccount) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    return taskSnapshot(tasks, checkIns, LocalDate.now(ZoneId.systemDefault()));
  }

  private List<HeatmapDayResponse> buildLearningHeatmapDays(
      List<CareerTask> tasks,
      List<Plan> plans,
      List<DailyCheckIn> checkIns,
      List<FocusSession> focusSessions,
      List<KnowledgeNote> notes,
      List<LearningTopic> topics,
      LocalDate startDate,
      LocalDate endDate) {
    Map<LocalDate, LearningDayAccumulator> buckets = new LinkedHashMap<>();
    LocalDate cursor = startDate;
    while (!cursor.isAfter(endDate)) {
      buckets.put(cursor, new LearningDayAccumulator());
      cursor = cursor.plusDays(1);
    }

    checkIns.stream()
        .filter(checkIn -> isBetween(checkIn.getCheckInDate(), startDate, endDate))
        .forEach(checkIn -> {
          LearningDayAccumulator bucket = buckets.computeIfAbsent(checkIn.getCheckInDate(), unused -> new LearningDayAccumulator());
          bucket.studyMinutes += (int) Math.round((checkIn.getStudyHours() == null ? 0d : checkIn.getStudyHours()) * 60);
          bucket.practiceProblemsSolved += nullToZero(checkIn.getProblemsSolved());
          bucket.goalCompleted = bucket.goalCompleted || (checkIn.getStudyHours() != null && checkIn.getStudyHours() > 0d);
          bucket.productivitySignals += checkIn.getProductivityRating() == null ? 0 : checkIn.getProductivityRating();
          bucket.productivitySignalCount += checkIn.getProductivityRating() == null ? 0 : 1;
        });

    focusSessions.stream()
        .filter(session -> session.getCompletedAt() != null && isBetween(session.getCompletedAt().toLocalDate(), startDate, endDate))
        .forEach(session -> {
          LearningDayAccumulator bucket = buckets.computeIfAbsent(session.getCompletedAt().toLocalDate(), unused -> new LearningDayAccumulator());
          bucket.sessions++;
          bucket.studyMinutes += nullToZero(session.getDurationMinutes());
          bucket.topics.add(formatCategory(session.getSessionType()));
        });

    tasks.stream()
        .filter(task -> task.getCompletedAt() != null && isBetween(task.getCompletedAt(), startDate, endDate))
        .forEach(task -> {
          LearningDayAccumulator bucket = buckets.computeIfAbsent(task.getCompletedAt(), unused -> new LearningDayAccumulator());
          bucket.tasksCompleted++;
          bucket.goalCompleted = true;
          bucket.topics.add(formatCategory(task.getCategory().name()));
        });

    notes.stream()
        .filter(note -> note.getCreatedAt() != null && isBetween(note.getCreatedAt().toLocalDate(), startDate, endDate))
        .forEach(note -> {
          LearningDayAccumulator bucket = buckets.computeIfAbsent(note.getCreatedAt().toLocalDate(), unused -> new LearningDayAccumulator());
          bucket.notesCreated++;
          bucket.topics.add(formatCategory(note.getCategory().name()));
          bucket.topics.addAll(splitCsv(note.getTags()));
        });

    topics.stream()
        .filter(topic -> topic.getCompletionDate() != null && isBetween(topic.getCompletionDate(), startDate, endDate))
        .forEach(topic -> {
          LearningDayAccumulator bucket = buckets.computeIfAbsent(topic.getCompletionDate(), unused -> new LearningDayAccumulator());
          bucket.completedConcepts++;
          bucket.goalCompleted = true;
          bucket.topics.add(topic.getTitle());
          bucket.topics.add(formatCategory(topic.getCategory().name()));
        });

    long streak = 0;
    for (Map.Entry<LocalDate, LearningDayAccumulator> entry : buckets.entrySet().stream().sorted(Map.Entry.comparingByKey()).toList()) {
      LearningDayAccumulator bucket = entry.getValue();
      boolean active = bucket.studyMinutes > 0 || bucket.tasksCompleted > 0 || bucket.completedConcepts > 0 || bucket.notesCreated > 0;
      streak = active ? streak + 1 : 0;
      bucket.currentStreak = streak;
    }

    return buckets.entrySet().stream()
        .map(entry -> {
          LearningDayAccumulator bucket = entry.getValue();
          long sessions = bucket.sessions + (bucket.studyMinutes > 0 && bucket.sessions == 0 ? 1 : 0);
          double studyHours = roundHours(bucket.studyMinutes / 60.0);
          return new HeatmapDayResponse(
              entry.getKey(),
              intensityFor(studyHours, sessions),
              studyHours,
              bucket.studyMinutes,
              sessions,
              bucket.topics.stream().filter(value -> value != null && !value.isBlank()).limit(6).toList(),
              bucket.completedConcepts,
              bucket.tasksCompleted,
              bucket.notesCreated,
              bucket.goalCompleted,
              bucket.currentStreak,
              productivityScoreForDay(bucket));
        })
        .toList();
  }

  private List<AnalyticsDataPointResponse> buildDayValueSeries(List<HeatmapDayResponse> days, String valueType) {
    return days.stream()
        .map(day -> new AnalyticsDataPointResponse(
            day.date(),
            switch (valueType) {
              case "streak" -> day.currentStreak();
              case "productivity" -> day.productivityScore();
              default -> roundHours(day.studyMinutes() / 60.0);
            }))
        .toList();
  }

  private List<AnalyticsDataPointResponse> buildWeeklyProgress(List<HeatmapDayResponse> days) {
    Map<LocalDate, Double> weeks = new LinkedHashMap<>();
    for (HeatmapDayResponse day : days) {
      LocalDate weekStart = day.date().minusDays(day.date().getDayOfWeek().getValue() % 7);
      weeks.merge(weekStart, day.studyMinutes() / 60.0, Double::sum);
    }
    return weeks.entrySet().stream()
        .map(entry -> new AnalyticsDataPointResponse(entry.getKey(), roundHours(entry.getValue())))
        .toList();
  }

  private List<AnalyticsDataPointResponse> buildMonthlyGrowth(List<HeatmapDayResponse> days) {
    Map<LocalDate, Double> months = new LinkedHashMap<>();
    for (HeatmapDayResponse day : days) {
      LocalDate month = LocalDate.of(day.date().getYear(), day.date().getMonth(), 1);
      months.merge(month, day.studyMinutes() / 60.0, Double::sum);
    }
    return months.entrySet().stream()
        .map(entry -> new AnalyticsDataPointResponse(entry.getKey(), roundHours(entry.getValue())))
        .toList();
  }

  private List<CategoryDistributionResponse> buildTechnologyBreakdown(List<HeatmapDayResponse> days) {
    Map<String, Long> minutesByTopic = new HashMap<>();
    for (HeatmapDayResponse day : days) {
      if (day.topics().isEmpty() || day.studyMinutes() == 0) {
        continue;
      }
      long share = Math.max(1, Math.round(day.studyMinutes() / (double) day.topics().size()));
      day.topics().forEach(topic -> minutesByTopic.merge(topic, share, Long::sum));
    }
    long total = minutesByTopic.values().stream().mapToLong(Long::longValue).sum();
    return minutesByTopic.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(8)
        .map(entry -> new CategoryDistributionResponse(
            entry.getKey(),
            entry.getValue(),
            total == 0 ? 0d : roundPercent((entry.getValue() * 100.0) / total)))
        .toList();
  }

  private List<String> buildLearningAchievements(LearningHeatmapSummaryResponse summary, List<LearningTopic> topics) {
    long completedConcepts = topics.stream().filter(topic -> topic.getLearningStatus() == LearningStatus.MASTERED).count();
    Stream.Builder<String> builder = Stream.builder();
    if (summary.activeLearningDays() > 0) builder.add("First Study Day");
    if (summary.currentStreak() >= 7) builder.add("7-Day Streak");
    if (summary.currentStreak() >= 30) builder.add("30-Day Streak");
    if (summary.totalLearningHours() >= 100) builder.add("100 Learning Hours");
    if (completedConcepts >= 500) builder.add("500 Concepts Completed");
    if (summary.longestStreak() >= 7) builder.add("Perfect Week");
    if (summary.completionPercentage() >= 90) builder.add("Study Every Day This Month");
    return builder.build().toList();
  }

  private List<String> buildSmartInsights(List<HeatmapDayResponse> days, LearningHeatmapSummaryResponse summary, LocalDate today) {
    double thisMonthHours = days.stream()
        .filter(day -> day.date().getMonth() == today.getMonth())
        .mapToDouble(day -> day.studyMinutes() / 60.0)
        .sum();
    double previousMonthHours = days.stream()
        .filter(day -> day.date().getMonth() == today.minusMonths(1).getMonth())
        .mapToDouble(day -> day.studyMinutes() / 60.0)
        .sum();
    int change = previousMonthHours == 0d ? (thisMonthHours == 0d ? 0 : 100) : (int) Math.round(((thisMonthHours - previousMonthHours) / previousMonthHours) * 100);
    String bestDay = days.stream()
        .collect(Collectors.groupingBy(day -> day.date().getDayOfWeek().name(), Collectors.averagingInt(HeatmapDayResponse::productivityScore)))
        .entrySet().stream()
        .max(Map.Entry.comparingByValue())
        .map(entry -> formatCategory(entry.getKey()))
        .orElse("No study day");
    return List.of(
        "You study most effectively on " + bestDay + ".",
        "Your average daily study time is " + Math.round(summary.averageStudyMinutesPerDay()) + " minutes.",
        "Your consistency changed by " + change + "% compared to last month.",
        summary.currentStreak() == 0 ? "You have not studied today yet." : "Your current learning streak is " + summary.currentStreak() + " days.",
        summary.currentStreak() >= 30 ? "You have reached a 30-day streak." : "You are " + Math.max(0, 30 - summary.currentStreak()) + " days away from a 30-day streak.");
  }

  private List<Integer> availableYears(
      List<DailyCheckIn> checkIns,
      List<FocusSession> focusSessions,
      List<CareerTask> tasks,
      List<KnowledgeNote> notes,
      List<LearningTopic> topics,
      int currentYear) {
    Set<Integer> years = new TreeSet<>(Comparator.reverseOrder());
    years.add(currentYear);
    checkIns.forEach(checkIn -> years.add(checkIn.getCheckInDate().getYear()));
    focusSessions.stream().filter(session -> session.getCompletedAt() != null).forEach(session -> years.add(session.getCompletedAt().getYear()));
    tasks.stream().filter(task -> task.getCompletedAt() != null).forEach(task -> years.add(task.getCompletedAt().getYear()));
    notes.stream().filter(note -> note.getCreatedAt() != null).forEach(note -> years.add(note.getCreatedAt().getYear()));
    topics.stream().filter(topic -> topic.getCompletionDate() != null).forEach(topic -> years.add(topic.getCompletionDate().getYear()));
    return years.stream().toList();
  }

  private long longestStreak(List<HeatmapDayResponse> days) {
    long longest = 0;
    long current = 0;
    for (HeatmapDayResponse day : days) {
      boolean active = day.studyMinutes() > 0 || day.tasksCompleted() > 0 || day.completedConcepts() > 0 || day.notesCreated() > 0;
      current = active ? current + 1 : 0;
      longest = Math.max(longest, current);
    }
    return longest;
  }

  private long streakEndingAt(LocalDate date, List<HeatmapDayResponse> days) {
    Map<LocalDate, HeatmapDayResponse> byDate = days.stream().collect(Collectors.toMap(HeatmapDayResponse::date, day -> day));
    long streak = 0;
    LocalDate cursor = date;
    while (byDate.containsKey(cursor)) {
      HeatmapDayResponse day = byDate.get(cursor);
      if (day.studyMinutes() == 0 && day.tasksCompleted() == 0 && day.completedConcepts() == 0 && day.notesCreated() == 0) {
        break;
      }
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }

  private long currentLearningStreak(LocalDate today, List<HeatmapDayResponse> days) {
    LocalDate latestActiveDate = days.stream()
        .filter(this::isActiveLearningDay)
        .map(HeatmapDayResponse::date)
        .filter(date -> !date.isAfter(today))
        .max(LocalDate::compareTo)
        .orElse(null);
    if (latestActiveDate == null) {
      return 0;
    }
    return streakEndingAt(latestActiveDate, days);
  }

  private long currentLearningStreakForUser(UserAccount userAccount, LocalDate today) {
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    List<FocusSession> focusSessions = focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userAccount.getId());
    List<KnowledgeNote> notes = knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<LearningTopic> topics = learningTopicRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    return currentLearningStreak(today, buildLearningHeatmapDays(
        tasks,
        plans,
        checkIns,
        focusSessions,
        notes,
        topics,
        today.minusDays(364),
        today));
  }

  private boolean isActiveLearningDay(HeatmapDayResponse day) {
    return day.studyMinutes() > 0 || day.tasksCompleted() > 0 || day.completedConcepts() > 0 || day.notesCreated() > 0;
  }

  private List<String> buildDayAchievements(HeatmapDayResponse day) {
    Stream.Builder<String> builder = Stream.builder();
    if (day.studyMinutes() > 0) builder.add("Study Day");
    if (day.currentStreak() >= 7) builder.add("7-Day Streak");
    if (day.studyMinutes() >= 240) builder.add("Deep Work Day");
    if (day.goalCompleted()) builder.add("Daily Goal Completed");
    return builder.build().toList();
  }

  private long plansUpdatedOn(List<Plan> plans, LocalDate date) {
    return plans.stream()
        .filter(plan -> plan.getUpdatedAt() != null && date.equals(plan.getUpdatedAt().toLocalDate()))
        .count();
  }

  private int productivityScoreForDay(LearningDayAccumulator bucket) {
    int timeScore = Math.min(40, bucket.studyMinutes / 6);
    int taskScore = Math.min(25, (int) bucket.tasksCompleted * 8);
    int conceptScore = Math.min(20, (int) bucket.completedConcepts * 10);
    int noteScore = Math.min(10, (int) bucket.notesCreated * 5);
    int goalScore = bucket.goalCompleted ? 5 : 0;
    int calculated = timeScore + taskScore + conceptScore + noteScore + goalScore;
    if (bucket.productivitySignalCount > 0) {
      return blendScores(calculated, Math.min(100, Math.max(0, (int) Math.round(bucket.productivitySignals / (double) bucket.productivitySignalCount * 10))));
    }
    return Math.min(100, calculated);
  }

  private boolean isBetween(LocalDate date, LocalDate startDate, LocalDate endDate) {
    return date != null && !date.isBefore(startDate) && !date.isAfter(endDate);
  }

  private int nullToZero(Integer value) {
    return value == null ? 0 : value;
  }

  private List<String> splitCsv(String value) {
    if (value == null || value.isBlank()) {
      return List.of();
    }
    return Stream.of(value.split("[,\\n]"))
        .map(String::trim)
        .filter(item -> !item.isBlank())
        .toList();
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

  private String formatPercent(double value) {
    return BigDecimal.valueOf(value).setScale(0, RoundingMode.HALF_UP).toPlainString() + "%";
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

  private String weakestCategory(List<CareerTask> tasks) {
    return categoryByCompletion(tasks, true);
  }

  private String strongestCategory(List<CareerTask> tasks) {
    return categoryByCompletion(tasks, false);
  }

  private String categoryByCompletion(List<CareerTask> tasks, boolean weakest) {
    Map<String, List<CareerTask>> grouped = tasks.stream()
        .collect(java.util.stream.Collectors.groupingBy(task -> task.getCategory().name()));
    return grouped.entrySet().stream()
        .filter(entry -> entry.getValue().size() >= 2)
        .sorted((left, right) -> {
          int leftRate = categoryCompletionRate(left.getValue());
          int rightRate = categoryCompletionRate(right.getValue());
          return weakest ? Integer.compare(leftRate, rightRate) : Integer.compare(rightRate, leftRate);
        })
        .map(entry -> formatCategory(entry.getKey()))
        .findFirst()
        .orElse(null);
  }

  private int categoryCompletionRate(List<CareerTask> tasks) {
    long completed = tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    return percent(completed, tasks.size());
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
            (int) Math.round(entry.getValue().studyHours * 60),
            entry.getValue().checkIns,
            List.of(),
            0,
            0,
            0,
            entry.getValue().studyHours > 0d || entry.getValue().checkIns > 0,
            0,
            intensityFor(entry.getValue().studyHours, entry.getValue().checkIns) * 20))
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

  private static final class LearningDayAccumulator {
    private int studyMinutes;
    private long sessions;
    private final Set<String> topics = new TreeSet<>();
    private long completedConcepts;
    private long tasksCompleted;
    private long notesCreated;
    private long practiceProblemsSolved;
    private boolean goalCompleted;
    private long currentStreak;
    private int productivitySignals;
    private int productivitySignalCount;
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
