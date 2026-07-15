package com.careeros.plan.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.plan.dto.CareerTaskResponse;
import com.careeros.plan.dto.CreateTaskRequest;
import com.careeros.plan.dto.TaskPageResponse;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

  public CareerTaskController(CareerTaskRepository careerTaskRepository, PlanRepository planRepository) {
    this.careerTaskRepository = careerTaskRepository;
    this.planRepository = planRepository;
  }

  @GetMapping
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
    List<CareerTaskResponse> filtered = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId())
        .stream()
        .filter(task -> search == null || matchesSearch(task, search))
        .filter(task -> status == null || task.getTaskStatus() == status)
        .filter(task -> priority == null || task.getPriority() == priority)
        .filter(task -> category == null || task.getCategory() == category)
        .filter(task -> planId == null || taskMatchesPlan(task, planId))
        .sorted(sortTasks(sortBy, sortDirection))
        .map(this::toResponse)
        .toList();

    int fromIndex = Math.min(page * size, filtered.size());
    int toIndex = Math.min(fromIndex + size, filtered.size());
    List<CareerTaskResponse> pageItems = filtered.subList(fromIndex, toIndex);
    TaskPageResponse response = new TaskPageResponse(
        pageItems,
        page,
        size,
        filtered.size(),
        size == 0 ? 0 : (int) Math.ceil(filtered.size() / (double) size),
        toIndex < filtered.size());
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
    CareerTask savedTask = careerTaskRepository.save(careerTask);
    return ApiResponse.success("Task created", toResponse(savedTask));
  }

  @PutMapping("/{taskId}")
  public ApiResponse<CareerTaskResponse> updateTask(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long taskId,
      @Valid @RequestBody CreateTaskRequest request) {
    CareerTask careerTask = careerTaskRepository.findByIdAndUserId(taskId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
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
    return ApiResponse.success("Task updated", toResponse(careerTaskRepository.save(careerTask)));
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
    return ApiResponse.success("Task completed", toResponse(careerTask));
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
        overdue,
        overdue ? "Overdue" : careerTask.getTaskStatus().name());
  }

  private boolean matchesSearch(CareerTask task, String search) {
    String needle = search.toLowerCase(Locale.ROOT);
    return Stream.of(task.getTitle(), task.getDescription(), task.getNotes())
        .filter(value -> value != null)
        .map(value -> value.toLowerCase(Locale.ROOT))
        .anyMatch(value -> value.contains(needle));
  }

  private boolean taskMatchesPlan(CareerTask task, Long planId) {
    if (task.getPlan() != null) {
      return task.getPlan().getId().equals(planId);
    }
    return false;
  }

  private Comparator<CareerTask> sortTasks(String sortBy, String sortDirection) {
    Comparator<CareerTask> comparator;
    switch (sortBy == null ? "createdAt" : sortBy) {
      case "dueDate" -> comparator = Comparator.comparing(CareerTask::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
      case "priority" -> comparator = Comparator.comparing(task -> task.getPriority().ordinal());
      case "status" -> comparator = Comparator.comparing(task -> task.getTaskStatus().ordinal());
      default -> comparator = Comparator.comparing(CareerTask::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
    }
    return "asc".equalsIgnoreCase(sortDirection) ? comparator : comparator.reversed();
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
