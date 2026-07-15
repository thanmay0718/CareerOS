package com.careeros.notification.service.impl;

import com.careeros.checkin.entity.DailyCheckIn;
import com.careeros.checkin.repository.DailyCheckInRepository;
import com.careeros.notification.dto.NotificationResponse;
import com.careeros.notification.entity.CareerNotification;
import com.careeros.notification.enums.NotificationStatus;
import com.careeros.notification.enums.NotificationType;
import com.careeros.notification.repository.CareerNotificationRepository;
import com.careeros.notification.service.NotificationService;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.user.entity.UserAccount;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

  private static final LocalTime CHECKIN_REMINDER_CUTOFF = LocalTime.of(18, 0);
  private static final int PLAN_DEADLINE_WINDOW_DAYS = 7;

  private final CareerNotificationRepository notificationRepository;
  private final CareerTaskRepository careerTaskRepository;
  private final PlanRepository planRepository;
  private final DailyCheckInRepository dailyCheckInRepository;

  public NotificationServiceImpl(
      CareerNotificationRepository notificationRepository,
      CareerTaskRepository careerTaskRepository,
      PlanRepository planRepository,
      DailyCheckInRepository dailyCheckInRepository) {
    this.notificationRepository = notificationRepository;
    this.careerTaskRepository = careerTaskRepository;
    this.planRepository = planRepository;
    this.dailyCheckInRepository = dailyCheckInRepository;
  }

  @Override
  @Transactional
  public List<NotificationResponse> getNotifications(UserAccount userAccount) {
    LocalDate today = LocalDate.now();
    LocalDate tomorrow = today.plusDays(1);
    Map<String, NotificationSeed> seeds = buildActiveSeeds(userAccount, today, tomorrow);
    List<CareerNotification> existingActive = notificationRepository
        .findByUserIdAndNotificationStatusOrderByCreatedAtDesc(userAccount.getId(), NotificationStatus.ACTIVE);

    Set<String> activeKeys = seeds.keySet();
    List<CareerNotification> persisted = new ArrayList<>();

    for (NotificationSeed seed : seeds.values()) {
      CareerNotification notification = notificationRepository
          .findByUserIdAndNotificationKey(userAccount.getId(), seed.key())
          .orElseGet(() -> new CareerNotification(
              userAccount,
              seed.key(),
              seed.type(),
              seed.title(),
              seed.message(),
              seed.actionLabel(),
              seed.actionPath(),
              seed.sourceType(),
              seed.sourceId(),
              seed.referenceDate()));
      notification.update(
          seed.type(),
          seed.title(),
          seed.message(),
          seed.actionLabel(),
          seed.actionPath(),
          seed.sourceType(),
          seed.sourceId(),
          seed.referenceDate());
      persisted.add(notificationRepository.save(notification));
    }

    for (CareerNotification notification : existingActive) {
      if (!activeKeys.contains(notification.getNotificationKey())) {
        notification.resolve(today);
        persisted.add(notificationRepository.save(notification));
      }
    }

    return notificationRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()).stream()
        .sorted(Comparator
            .comparing((CareerNotification notification) -> notification.getNotificationStatus() == NotificationStatus.ACTIVE ? 0 : 1)
            .thenComparing(CareerNotification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .map(this::toResponse)
        .toList();
  }

  private Map<String, NotificationSeed> buildActiveSeeds(UserAccount userAccount, LocalDate today, LocalDate tomorrow) {
    Map<String, NotificationSeed> seeds = new LinkedHashMap<>();
    List<CareerTask> tasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<Plan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<DailyCheckIn> checkIns = dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId());
    boolean hasTodayCheckIn = checkIns.stream().anyMatch(checkIn -> today.equals(checkIn.getCheckInDate()));
    LocalTime now = LocalTime.now();

    tasks.stream()
        .filter(task -> task.getDueDate() != null
            && task.getTaskStatus() != TaskStatus.COMPLETED
            && tomorrow.equals(task.getDueDate()))
        .forEach(task -> seeds.put(
            "TASK_DUE_TOMORROW:" + task.getId() + ":" + task.getDueDate(),
            new NotificationSeed(
                "TASK_DUE_TOMORROW:" + task.getId() + ":" + task.getDueDate(),
                NotificationType.TASK_DUE_TOMORROW,
                "Task due tomorrow",
                "Task \"" + task.getTitle() + "\" is due tomorrow.",
                "Review task",
                "/tasks",
                "Task",
                task.getId(),
                task.getDueDate())));

    tasks.stream()
        .filter(task -> task.getDueDate() != null
            && task.getTaskStatus() != TaskStatus.COMPLETED
            && task.getDueDate().isBefore(today))
        .forEach(task -> seeds.put(
            "TASK_OVERDUE:" + task.getId(),
            new NotificationSeed(
                "TASK_OVERDUE:" + task.getId(),
                NotificationType.TASK_OVERDUE,
                "Task overdue",
                "Task \"" + task.getTitle() + "\" is overdue.",
                "Open task",
                "/tasks",
                "Task",
                task.getId(),
                task.getDueDate())));

    plans.stream()
        .filter(plan -> plan.getPlanStatus() == PlanStatus.ACTIVE
            && plan.getExpectedEndDate() != null
            && !plan.getExpectedEndDate().isBefore(today)
            && !plan.getExpectedEndDate().isAfter(today.plusDays(PLAN_DEADLINE_WINDOW_DAYS)))
        .forEach(plan -> seeds.put(
            "PLAN_DEADLINE_NEAR:" + plan.getId(),
            new NotificationSeed(
                "PLAN_DEADLINE_NEAR:" + plan.getId(),
                NotificationType.PLAN_DEADLINE_NEAR,
                "Plan deadline near",
                "Plan \"" + plan.getTitle() + "\" ends on " + plan.getExpectedEndDate() + ".",
                "Open plan",
                "/plans",
                "Plan",
                plan.getId(),
                plan.getExpectedEndDate())));

    if (!hasTodayCheckIn) {
      NotificationType type = now.isBefore(CHECKIN_REMINDER_CUTOFF)
          ? NotificationType.DAILY_REMINDER
          : NotificationType.CHECKIN_MISSING;
      String key = type.name() + ":" + today;
      String title = type == NotificationType.DAILY_REMINDER ? "Daily reminder" : "Check-in missing";
      String message = type == NotificationType.DAILY_REMINDER
          ? "Log your study check-in for today."
          : "You have not completed today’s check-in yet.";
      seeds.put(
          key,
          new NotificationSeed(
              key,
              type,
              title,
              message,
              "Open check-ins",
              "/check-ins",
              "CheckIn",
              null,
              today));
    }

    return seeds;
  }

  private NotificationResponse toResponse(CareerNotification notification) {
    return new NotificationResponse(
        notification.getId(),
        notification.getNotificationType(),
        notification.getNotificationStatus(),
        notification.getTitle(),
        notification.getMessage(),
        notification.getActionLabel(),
        notification.getActionPath(),
        notification.getSourceType(),
        notification.getSourceId(),
        notification.getReferenceDate(),
        notification.getResolvedAt(),
        notification.getCreatedAt(),
        notification.getNotificationStatus() == NotificationStatus.ACTIVE);
  }

  private record NotificationSeed(
      String key,
      NotificationType type,
      String title,
      String message,
      String actionLabel,
      String actionPath,
      String sourceType,
      Long sourceId,
      LocalDate referenceDate) {
  }
}
