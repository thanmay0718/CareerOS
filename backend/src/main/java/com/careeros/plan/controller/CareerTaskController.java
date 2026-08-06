package com.careeros.plan.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.plan.dto.CareerTaskResponse;
import com.careeros.plan.dto.CreateTaskRequest;
import com.careeros.plan.dto.MissTaskRequest;
import com.careeros.plan.dto.MissedTaskInsightResponse;
import com.careeros.plan.dto.RescheduleTaskRequest;
import com.careeros.plan.dto.TaskPageResponse;
import com.careeros.plan.dto.TaskHistoryResponse;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.entity.TaskHistoryEvent;
import com.careeros.plan.enums.MissedTaskReason;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskEventType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.plan.repository.TaskHistoryEventRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class CareerTaskController {

  private final CareerTaskRepository careerTaskRepository;
  private final PlanRepository planRepository;
  private final TaskHistoryEventRepository taskHistoryEventRepository;

  public CareerTaskController(
      CareerTaskRepository careerTaskRepository,
      PlanRepository planRepository,
      TaskHistoryEventRepository taskHistoryEventRepository) {
    this.careerTaskRepository = careerTaskRepository;
    this.planRepository = planRepository;
    this.taskHistoryEventRepository = taskHistoryEventRepository;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public ApiResponse<TaskPageResponse> listTasks(
      @AuthenticationPrincipal UserAccount userAccount,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) TaskStatus status,
      @RequestParam(required = false) com.careeros.common.enums.PriorityLevel priority,
      @RequestParam(required = false) com.careeros.plan.enums.TaskCategory category,
      @RequestParam(required = false) Long planId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDirection) {
    int pageSize = Math.min(Math.max(size, 1), 50);
    Pageable pageable = PageRequest.of(Math.max(page, 0), pageSize, taskSort(sortBy, sortDirection));
    Page<CareerTask> taskPage = careerTaskRepository.findAll(
        taskSpecification(userAccount.getId(), search, status, priority, category, planId),
        pageable);
    List<CareerTaskResponse> pageItems = taskPage.getContent().stream()
        .map(this::toResponse)
        .toList();
    TaskPageResponse response = new TaskPageResponse(
        pageItems,
        taskPage.getNumber(),
        taskPage.getSize(),
        taskPage.getTotalElements(),
        taskPage.getTotalPages(),
        taskPage.hasNext());
    return ApiResponse.success("Tasks loaded", response);
  }

  @PostMapping
  public ApiResponse<CareerTaskResponse> createTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody CreateTaskRequest request) {
    Plan plan = resolvePlan(userAccount, request.planId());
    PlanType resolvedPlanType = resolveTaskPlanType(plan, request.planType());
    CareerTask careerTask = new CareerTask(
        userAccount,
        plan,
        request.title(),
        request.description(),
        request.category(),
        resolvedPlanType,
        request.priority(),
        request.dueDate(),
        request.estimatedDurationMinutes());
    if (request.status() != null) {
      careerTask.setTaskStatus(request.status());
    }
    careerTask.setNotes(request.notes());
    careerTask.setReminderTimes(request.reminderTimes());
    careerTask.setBrowserReminderEnabled(Boolean.TRUE.equals(request.browserReminderEnabled()));
    CareerTask savedTask = careerTaskRepository.save(careerTask);
    saveHistory(userAccount, savedTask, TaskEventType.CREATED, null, "Task created", null, savedTask.getDueDate());
    return ApiResponse.success("Task created", toResponse(savedTask));
  }

  @PutMapping("/{taskId}")
  public ApiResponse<CareerTaskResponse> updateTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId,
      @Valid @RequestBody CreateTaskRequest request) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    LocalDate previousDueDate = careerTask.getDueDate();
    careerTask.setPlan(resolvePlan(userAccount, request.planId()));
    careerTask.setPlanType(resolveTaskPlanType(careerTask.getPlan(), request.planType()));
    careerTask.setTitle(request.title());
    careerTask.setDescription(request.description());
    careerTask.setCategory(request.category());
    careerTask.setPriority(request.priority());
    careerTask.setTaskStatus(request.status() == null ? careerTask.getTaskStatus() : request.status());
    careerTask.setDueDate(request.dueDate());
    careerTask.setEstimatedDurationMinutes(request.estimatedDurationMinutes());
    careerTask.setNotes(request.notes());
    careerTask.setReminderTimes(request.reminderTimes());
    careerTask.setBrowserReminderEnabled(Boolean.TRUE.equals(request.browserReminderEnabled()));
    CareerTask savedTask = careerTaskRepository.save(careerTask);
    saveHistory(userAccount, savedTask, TaskEventType.UPDATED, null, "Task updated", previousDueDate, savedTask.getDueDate());
    return ApiResponse.success("Task updated", toResponse(savedTask));
  }

  @DeleteMapping("/{taskId}")
  public ApiResponse<Void> deleteTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    careerTaskRepository.delete(careerTask);
    return ApiResponse.success("Task deleted", null);
  }

  @PatchMapping("/{taskId}/complete")
  public ApiResponse<CareerTaskResponse> completeTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    careerTask.markCompleted(LocalDate.now());
    careerTaskRepository.save(careerTask);
    saveHistory(userAccount, careerTask, TaskEventType.COMPLETED, null, "Task completed", careerTask.getDueDate(), careerTask.getDueDate());
    return ApiResponse.success("Task completed", toResponse(careerTask));
  }

  @PatchMapping("/{taskId}/missed")
  public ApiResponse<CareerTaskResponse> missTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId,
      @Valid @RequestBody MissTaskRequest request) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    careerTask.markMissed(request.reason(), request.detail());
    CareerTask savedTask = careerTaskRepository.save(careerTask);
    saveHistory(userAccount, savedTask, TaskEventType.MISSED, request.reason(), request.detail(), savedTask.getDueDate(), savedTask.getDueDate());
    return ApiResponse.success("Missed task reason saved", toResponse(savedTask));
  }

  @PatchMapping("/{taskId}/reschedule")
  public ApiResponse<CareerTaskResponse> rescheduleTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId,
      @Valid @RequestBody RescheduleTaskRequest request) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    LocalDate previousDueDate = careerTask.getDueDate();
    careerTask.reschedule(request.dueDate());
    CareerTask savedTask = careerTaskRepository.save(careerTask);
    saveHistory(userAccount, savedTask, TaskEventType.RESCHEDULED, null, request.reason(), previousDueDate, savedTask.getDueDate());
    return ApiResponse.success("Task rescheduled", toResponse(savedTask));
  }

  @GetMapping("/timeline")
  public ApiResponse<List<TaskHistoryResponse>> timeline(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success(
        "Task timeline loaded",
        taskHistoryEventRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()).stream()
            .map(this::toHistoryResponse)
            .toList());
  }

  @GetMapping("/missed-insights")
  public ApiResponse<List<MissedTaskInsightResponse>> missedInsights(@AuthenticationPrincipal UserAccount userAccount) {
    LocalDateTime since = LocalDateTime.now().minusDays(30);
    return ApiResponse.success(
        "Missed task insights loaded",
        Stream.of(MissedTaskReason.values())
            .map(reason -> new MissedTaskInsightResponse(
                reason,
                taskHistoryEventRepository.countByUserIdAndEventTypeAndMissedReasonAndCreatedAtAfter(
                    userAccount.getId(),
                    TaskEventType.MISSED,
                    reason,
                    since)))
            .filter(item -> item.count() > 0)
            .toList());
  }

  private CareerTaskResponse toResponse(CareerTask careerTask) {
    boolean overdue = careerTask.getDueDate() != null
        && careerTask.getTaskStatus() != TaskStatus.COMPLETED
        && careerTask.getDueDate().isBefore(LocalDate.now());
    return new CareerTaskResponse(
        careerTask.getId(),
        careerTask.getTitle(),
        careerTask.getDescription(),
        careerTask.getCategory(),
        careerTask.getPlan() == null ? null : careerTask.getPlan().getId(),
        careerTask.getPlan() == null ? null : careerTask.getPlan().getTitle(),
        careerTask.getPlanType(),
        careerTask.getPriority(),
        careerTask.getTaskStatus(),
        careerTask.getDueDate(),
        careerTask.getCompletedAt(),
        careerTask.getEstimatedDurationMinutes(),
        careerTask.getNotes(),
        careerTask.getMissedReason(),
        careerTask.getMissedReasonDetail(),
        careerTask.getMissedAt(),
        careerTask.getRescheduledAt(),
        careerTask.getReminderTimes(),
        careerTask.isBrowserReminderEnabled(),
        overdue,
        overdue ? "Overdue" : careerTask.getTaskStatus().name());
  }

  private void saveHistory(
      UserAccount userAccount,
      CareerTask careerTask,
      TaskEventType eventType,
      MissedTaskReason missedReason,
      String detail,
      LocalDate previousDueDate,
      LocalDate newDueDate) {
    taskHistoryEventRepository.save(new TaskHistoryEvent(
        userAccount,
        careerTask,
        eventType,
        missedReason,
        detail,
        previousDueDate,
        newDueDate));
  }

  private TaskHistoryResponse toHistoryResponse(TaskHistoryEvent event) {
    return new TaskHistoryResponse(
        event.getId(),
        event.getTask().getId(),
        event.getTask().getTitle(),
        event.getEventType(),
        event.getMissedReason(),
        event.getDetail(),
        event.getPreviousDueDate(),
        event.getNewDueDate(),
        event.getCreatedAt());
  }

  private Specification<CareerTask> taskSpecification(
      Long userId,
      String search,
      TaskStatus status,
      com.careeros.common.enums.PriorityLevel priority,
      com.careeros.plan.enums.TaskCategory category,
      Long planId) {
    return (root, query, criteriaBuilder) -> {
      List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
      predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));
      if (search != null && !search.isBlank()) {
        String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
        predicates.add(criteriaBuilder.or(
            criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
            criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern),
            criteriaBuilder.like(criteriaBuilder.lower(root.get("notes")), pattern)));
      }
      if (status != null) {
        predicates.add(criteriaBuilder.equal(root.get("taskStatus"), status));
      }
      if (priority != null) {
        predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
      }
      if (category != null) {
        predicates.add(criteriaBuilder.equal(root.get("category"), category));
      }
      if (planId != null) {
        predicates.add(criteriaBuilder.equal(root.get("plan").get("id"), planId));
      }
      return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
    };
  }

  private Sort taskSort(String sortBy, String sortDirection) {
    Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
    String property = switch (sortBy == null ? "createdAt" : sortBy) {
      case "dueDate" -> "dueDate";
      case "priority" -> "priority";
      case "status" -> "taskStatus";
      default -> "createdAt";
    };
    return Sort.by(direction, property);
  }

  private Plan resolvePlan(UserAccount userAccount, Long planId) {
    if (planId == null) {
      return null;
    }
    return planRepository.findByIdAndUserId(planId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
  }

  private PlanType resolveTaskPlanType(Plan plan, PlanType requestedPlanType) {
    if (plan != null) {
      return plan.getPlanType();
    }
    return requestedPlanType == null ? PlanType.BOTH : requestedPlanType;
  }
}
