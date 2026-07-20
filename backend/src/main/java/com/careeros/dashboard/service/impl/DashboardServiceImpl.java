package com.careeros.dashboard.service.impl;

import com.careeros.checkin.entity.DailyCheckIn;
import com.careeros.checkin.repository.DailyCheckInRepository;
import com.careeros.company.repository.CompanyProfileRepository;
import com.careeros.dashboard.dto.ActivityItem;
import com.careeros.dashboard.dto.DashboardRecommendation;
import com.careeros.dashboard.dto.DashboardResponse;
import com.careeros.dashboard.dto.EmptyState;
import com.careeros.dashboard.dto.ProgressCard;
import com.careeros.dashboard.dto.SummaryCard;
import com.careeros.dashboard.dto.TaskPreview;
import com.careeros.dashboard.dto.UpcomingTasksSection;
import com.careeros.dashboard.dto.WelcomeSection;
import com.careeros.dashboard.service.DashboardService;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.placement.entity.PlacementApplication;
import com.careeros.placement.enums.ApplicationStatus;
import com.careeros.placement.repository.PlacementApplicationRepository;
import com.careeros.resume.enums.ResumeStatus;
import com.careeros.resume.repository.ResumeDocumentRepository;
import com.careeros.roadmap.entity.LearningRoadmap;
import com.careeros.roadmap.repository.LearningRoadmapRepository;
import com.careeros.user.entity.UserAccount;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.MonthDay;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServiceImpl implements DashboardService {

  private final PlanRepository planRepository;
  private final CareerTaskRepository careerTaskRepository;
  private final DailyCheckInRepository dailyCheckInRepository;
  private final LearningRoadmapRepository learningRoadmapRepository;
  private final PlacementApplicationRepository placementApplicationRepository;
  private final CompanyProfileRepository companyProfileRepository;
  private final ResumeDocumentRepository resumeDocumentRepository;

  public DashboardServiceImpl(
      PlanRepository planRepository,
      CareerTaskRepository careerTaskRepository,
      DailyCheckInRepository dailyCheckInRepository,
      LearningRoadmapRepository learningRoadmapRepository,
      PlacementApplicationRepository placementApplicationRepository,
      CompanyProfileRepository companyProfileRepository,
      ResumeDocumentRepository resumeDocumentRepository) {
    this.planRepository = planRepository;
    this.careerTaskRepository = careerTaskRepository;
    this.dailyCheckInRepository = dailyCheckInRepository;
    this.learningRoadmapRepository = learningRoadmapRepository;
    this.placementApplicationRepository = placementApplicationRepository;
    this.companyProfileRepository = companyProfileRepository;
    this.resumeDocumentRepository = resumeDocumentRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public DashboardResponse getDashboard(UserAccount userAccount) {
    LocalDate today = LocalDate.now(ZoneId.systemDefault());
    LocalDate tomorrow = today.plusDays(1);

    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    List<LearningRoadmap> roadmaps = learningRoadmapRepository.findByUserIdOrderByTitleAsc(userAccount.getId());
    List<PlacementApplication> applications = placementApplicationRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());

    boolean hasData = !plans.isEmpty() || !tasks.isEmpty() || !checkIns.isEmpty() || !roadmaps.isEmpty() || !applications.isEmpty();
    Plan activePlan = plans.stream()
        .filter(plan -> plan.getPlanStatus() == PlanStatus.ACTIVE)
        .findFirst()
        .orElse(plans.stream().findFirst().orElse(null));

    DailyCheckIn todaysCheckIn = checkIns.stream()
        .filter(checkIn -> today.equals(checkIn.getCheckInDate()))
        .findFirst()
        .orElse(null);

    List<SummaryCard> summaryCards = buildSummaryCards(tasks, plans, checkIns, todaysCheckIn, today, roadmaps, applications, userAccount.getId());
    List<ProgressCard> progressCards = buildProgressCards(tasks, roadmaps);
    UpcomingTasksSection upcomingTasks = buildUpcomingTasks(tasks, today, tomorrow);
    List<ActivityItem> activityItems = buildActivityFeed(plans, tasks, checkIns);
    DashboardRecommendation recommendation = buildRecommendation(plans, tasks, checkIns, roadmaps, applications, today);
    WelcomeSection welcomeSection = new WelcomeSection(
        greetingForHour(LocalDateTime.now().getHour()),
        userAccount.getFullName(),
        activePlan == null ? "No active plan yet" : activePlan.getTitle(),
        activePlan == null
            ? "Create your first career plan."
            : (activePlan.getTargetRole() != null ? activePlan.getTargetRole() : activePlan.getTitle()));

    EmptyState emptyState = new EmptyState(
        "No plans found.",
        "Create your first career plan.",
        "Create Plan");

    return new DashboardResponse(
        hasData,
        welcomeSection,
        recommendation,
        summaryCards,
        progressCards,
        upcomingTasks,
        activityItems,
        emptyState);
  }

  private DashboardRecommendation buildRecommendation(
      List<Plan> plans,
      List<CareerTask> tasks,
      List<DailyCheckIn> checkIns,
      List<LearningRoadmap> roadmaps,
      List<PlacementApplication> applications,
      LocalDate today) {
    List<CareerTask> overdueTasks = tasks.stream()
        .filter(this::isOverdue)
        .sorted(Comparator.comparing(CareerTask::getDueDate))
        .toList();
    if (!overdueTasks.isEmpty()) {
      CareerTask task = overdueTasks.get(0);
      return new DashboardRecommendation(
          "Recover overdue task",
          task.getTitle() + " was due on " + task.getDueDate() + ", so it should be handled before new work.",
          "Open practice",
          "/practice",
          "HIGH",
          "TASK");
    }

    List<CareerTask> todayTasks = tasks.stream()
        .filter(task -> today.equals(task.getDueDate()) && task.getTaskStatus() != TaskStatus.COMPLETED)
        .sorted(Comparator.comparing(CareerTask::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .toList();
    if (!todayTasks.isEmpty()) {
      CareerTask task = todayTasks.get(0);
      return new DashboardRecommendation(
          "Start today's focus",
          task.getTitle() + " is due today and is still marked " + task.getTaskStatus().name() + ".",
          "Open practice",
          "/practice",
          task.getPriority().name(),
          "TASK");
    }

    List<PlacementApplication> upcomingInterviews = applications.stream()
        .filter(application -> application.getInterviewDate() != null && !application.getInterviewDate().isBefore(today))
        .sorted(Comparator.comparing(PlacementApplication::getInterviewDate))
        .toList();
    if (!upcomingInterviews.isEmpty()) {
      PlacementApplication application = upcomingInterviews.get(0);
      return new DashboardRecommendation(
          "Prepare for upcoming interview",
          application.getCompany() + " has an interview date on " + application.getInterviewDate() + ".",
          "Open practice",
          "/practice",
          "HIGH",
          "PLACEMENT");
    }

    List<LearningRoadmap> inProgressRoadmaps = roadmaps.stream()
        .filter(roadmap -> roadmap.getCompletionPercentage() > 0 && roadmap.getCompletionPercentage() < 100)
        .sorted(Comparator.comparingInt(LearningRoadmap::getCompletionPercentage).reversed())
        .toList();
    if (!inProgressRoadmaps.isEmpty()) {
      LearningRoadmap roadmap = inProgressRoadmaps.get(0);
      return new DashboardRecommendation(
          "Continue learning path",
          roadmap.getTitle() + " is " + roadmap.getCompletionPercentage() + "% complete, so continuing it protects your momentum.",
          "Open learning",
          "/learning",
          "MEDIUM",
          "LEARNING");
    }

    List<LearningRoadmap> notStartedRoadmaps = roadmaps.stream()
        .filter(roadmap -> roadmap.getCompletionPercentage() == 0)
        .sorted(Comparator.comparing(LearningRoadmap::getTitle))
        .toList();
    if (!notStartedRoadmaps.isEmpty()) {
      LearningRoadmap roadmap = notStartedRoadmaps.get(0);
      return new DashboardRecommendation(
          "Start selected learning path",
          roadmap.getTitle() + " exists in your learning paths but has not been started yet.",
          "Open learning",
          "/learning",
          "MEDIUM",
          "LEARNING");
    }

    LocalDate lastCheckInDate = checkIns.stream()
        .map(DailyCheckIn::getCheckInDate)
        .max(Comparator.naturalOrder())
        .orElse(null);
    if (lastCheckInDate == null || lastCheckInDate.isBefore(today)) {
      return new DashboardRecommendation(
          "Log today's check-in",
          lastCheckInDate == null
              ? "No check-ins exist yet, so analytics cannot personalize your journey."
              : "Your last check-in was on " + lastCheckInDate + ", so today's progress is not captured yet.",
          "Open practice",
          "/practice",
          "MEDIUM",
          "CHECKIN");
    }

    if (plans.isEmpty()) {
      return new DashboardRecommendation(
          "Create your first career plan",
          "No plans exist yet, so the system cannot sequence your preparation work.",
          "Open projects",
          "/projects",
          "HIGH",
          "PLAN");
    }

    return new DashboardRecommendation(
        "Review analytics",
        "Your immediate tasks are clear, so analytics can show what changed across recent activity.",
        "Open analytics",
        "/analytics",
        "LOW",
        "ANALYTICS");
  }

  private List<SummaryCard> buildSummaryCards(
      List<CareerTask> tasks,
      List<Plan> plans,
      List<DailyCheckIn> checkIns,
      DailyCheckIn todaysCheckIn,
      LocalDate today,
      List<LearningRoadmap> roadmaps,
      List<PlacementApplication> applications,
      Long userId) {
    long totalTasks = tasks.size();
    long completedTasks = tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    long pendingTasks = tasks.stream().filter(task -> task.getTaskStatus() != TaskStatus.COMPLETED).count();
    long overdueTasks = tasks.stream().filter(this::isOverdue).count();
    long activePlans = plans.stream().filter(plan -> plan.getPlanStatus() == PlanStatus.ACTIVE).count();
    long currentStreak = calculateStreak(today, checkIns);
    String studyHoursToday = todaysCheckIn == null ? "0h" : formatHours(todaysCheckIn.getStudyHours());
    long tasksCompletedToday = tasks.stream()
        .filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED && today.equals(task.getCompletedAt()))
        .count();
    long upcomingInterviews = applications.stream()
        .filter(application -> application.getInterviewDate() != null && !application.getInterviewDate().isBefore(today))
        .count();
    long offers = applications.stream()
        .filter(application -> application.getApplicationStatus() == ApplicationStatus.OFFER_RECEIVED
            || application.getApplicationStatus() == ApplicationStatus.ACCEPTED
            || application.getApplicationStatus() == ApplicationStatus.JOINED)
        .count();
    long activeResumes = resumeDocumentRepository.findByUserIdAndResumeStatus(userId, ResumeStatus.ACTIVE).size();
    long bookmarkedCompanies = companyProfileRepository.findByUserIdOrderByCompanyNameAsc(userId).stream()
        .filter(company -> company.isBookmarked() || company.isDreamCompany())
        .count();

    return List.of(
        new SummaryCard("Total Tasks", String.valueOf(totalTasks), true),
        new SummaryCard("Completed Tasks", String.valueOf(completedTasks), false),
        new SummaryCard("Pending Tasks", String.valueOf(pendingTasks), false),
        new SummaryCard("Overdue Tasks", String.valueOf(overdueTasks), false),
        new SummaryCard("Plans Created", String.valueOf(plans.size()), false),
        new SummaryCard("Active Plans", String.valueOf(activePlans), true),
        new SummaryCard("Roadmaps", String.valueOf(roadmaps.size()), false),
        new SummaryCard("Applications", String.valueOf(applications.size()), true),
        new SummaryCard("Upcoming Interviews", String.valueOf(upcomingInterviews), true),
        new SummaryCard("Offers", String.valueOf(offers), true),
        new SummaryCard("Saved Companies", String.valueOf(bookmarkedCompanies), false),
        new SummaryCard("Active Resumes", String.valueOf(activeResumes), false),
        new SummaryCard("Current Streak", currentStreak + " days", true),
        new SummaryCard("Study Hours Today", studyHoursToday, false),
        new SummaryCard("Tasks Completed Today", String.valueOf(tasksCompletedToday), false));
  }

  private List<ProgressCard> buildProgressCards(List<CareerTask> tasks, List<LearningRoadmap> roadmaps) {
    List<ProgressCard> cards = new ArrayList<>(List.of(
        progressFor(tasks, PlanType.PLAN_A, "Plan A"),
        progressFor(tasks, PlanType.PLAN_B, "Plan B"),
        progressFor(tasks, PlanType.BOTH, "Overall Career Progress")));
    int roadmapAverage = roadmaps.isEmpty()
        ? 0
        : (int) Math.round(roadmaps.stream().mapToInt(LearningRoadmap::getCompletionPercentage).average().orElse(0));
    cards.add(new ProgressCard(
        "Learning Roadmaps",
        roadmapAverage,
        roadmaps.isEmpty() ? "No roadmaps started" : roadmaps.size() + " roadmap tracks available"));
    return cards;
  }

  private ProgressCard progressFor(List<CareerTask> tasks, PlanType planType, String label) {
    List<CareerTask> relevantTasks = tasks.stream()
        .filter(task -> effectivePlanType(task) == planType || planType == PlanType.BOTH)
        .toList();
    if (planType == PlanType.BOTH) {
      relevantTasks = tasks;
    }
    long total = relevantTasks.size();
    long completed = relevantTasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.COMPLETED).count();
    int percentage = total == 0 ? 0 : (int) Math.round((completed * 100.0) / total);
    String description = total == 0 ? "No tasks yet" : completed + " of " + total + " tasks completed";
    return new ProgressCard(label, percentage, description);
  }

  private UpcomingTasksSection buildUpcomingTasks(List<CareerTask> tasks, LocalDate today, LocalDate tomorrow) {
    List<TaskPreview> previews = tasks.stream()
        .filter(task -> task.getDueDate() != null)
        .sorted(Comparator.comparing(CareerTask::getDueDate).thenComparing(CareerTask::getCreatedAt, Comparator.reverseOrder()))
        .map(this::toPreview)
        .toList();

    List<TaskPreview> todayTasks = previews.stream()
        .filter(task -> today.equals(task.dueDate()) && !TaskStatus.COMPLETED.name().equals(task.status()))
        .toList();

    List<TaskPreview> tomorrowTasks = previews.stream()
        .filter(task -> tomorrow.equals(task.dueDate()) && !TaskStatus.COMPLETED.name().equals(task.status()))
        .toList();

    List<TaskPreview> upcomingDeadlines = previews.stream()
        .filter(task -> task.dueDate() != null && task.dueDate().isAfter(tomorrow) && !TaskStatus.COMPLETED.name().equals(task.status()))
        .limit(5)
        .toList();

    return new UpcomingTasksSection(todayTasks, tomorrowTasks, upcomingDeadlines);
  }

  private List<ActivityItem> buildActivityFeed(List<Plan> plans, List<CareerTask> tasks, List<DailyCheckIn> checkIns) {
    Stream<ActivityItem> planActivities = plans.stream()
        .sorted(Comparator.comparing(Plan::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .limit(5)
        .map(plan -> new ActivityItem(
            "Plan",
            "Created plan: " + plan.getTitle(),
            plan.getCreatedAt()));

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

  private TaskPreview toPreview(CareerTask task) {
    String planName = task.getPlan() == null ? null : task.getPlan().getTitle();
    boolean overdue = isOverdue(task);
    return new TaskPreview(
        task.getId(),
        task.getTitle(),
        task.getCategory().name(),
        task.getPriority().name(),
        task.getTaskStatus().name(),
        task.getDueDate(),
        task.getEstimatedDurationMinutes(),
        planName,
        overdue);
  }

  private boolean isOverdue(CareerTask task) {
    return task.getDueDate() != null
        && task.getTaskStatus() != TaskStatus.COMPLETED
        && task.getDueDate().isBefore(LocalDate.now());
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

  private PlanType effectivePlanType(CareerTask task) {
    if (task.getPlan() != null) {
      return task.getPlan().getPlanType();
    }
    return task.getPlanType();
  }

  private String greetingForHour(int hour) {
    if (hour < 12) {
      return "Good Morning";
    }
    if (hour < 17) {
      return "Good Afternoon";
    }
    return "Good Evening";
  }

  private String formatHours(Double hours) {
    if (hours == null) {
      return "0h";
    }
    BigDecimal value = BigDecimal.valueOf(hours).setScale(1, RoundingMode.HALF_UP);
    return value.stripTrailingZeros().toPlainString() + "h";
  }
}
