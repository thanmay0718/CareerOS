package com.careeros.plan.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.plan.dto.CreatePlanRequest;
import com.careeros.plan.dto.PlanResponse;
import com.careeros.plan.entity.CareerTask;
import com.careeros.plan.entity.Plan;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.repository.PlanRepository;
import com.careeros.plan.repository.CareerTaskRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

  private final PlanRepository planRepository;
  private final CareerTaskRepository careerTaskRepository;

  public PlanController(PlanRepository planRepository, CareerTaskRepository careerTaskRepository) {
    this.planRepository = planRepository;
    this.careerTaskRepository = careerTaskRepository;
  }

  @GetMapping
  public ApiResponse<List<PlanResponse>> listPlans(@AuthenticationPrincipal UserAccount userAccount) {
    List<PlanResponse> responses = planRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId())
        .stream()
        .map(plan -> toResponse(plan, userAccount.getId()))
        .toList();
    return ApiResponse.success("Plans loaded", responses);
  }

  @PostMapping
  public ApiResponse<PlanResponse> createPlan(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody CreatePlanRequest request) {
    Plan plan = new Plan(
        userAccount,
        request.planType(),
        request.title(),
        request.description(),
        request.targetRole(),
        request.targetPackage(),
        request.targetCompanies(),
        request.expectedStartDate(),
        request.expectedEndDate(),
        request.priority(),
        request.notes());
    if (request.status() != null) {
      plan.setPlanStatus(request.status());
    }
    Plan savedPlan = planRepository.save(plan);
    return ApiResponse.success("Plan created", toResponse(savedPlan, userAccount.getId()));
  }

  @PutMapping("/{planId}")
  public ApiResponse<PlanResponse> updatePlan(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long planId,
      @Valid @RequestBody CreatePlanRequest request) {
    Plan plan = planRepository.findByIdAndUserId(planId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    plan.setTitle(request.title());
    plan.setDescription(request.description());
    plan.setTargetRole(request.targetRole());
    plan.setTargetPackage(request.targetPackage());
    plan.setTargetCompanies(request.targetCompanies());
    plan.setExpectedStartDate(request.expectedStartDate());
    plan.setExpectedEndDate(request.expectedEndDate());
    plan.setPriority(request.priority());
    plan.setNotes(request.notes());
    plan.setPlanStatus(request.status() == null ? plan.getPlanStatus() : request.status());
    return ApiResponse.success("Plan updated", toResponse(planRepository.save(plan), userAccount.getId()));
  }

  @PatchMapping("/{planId}/archive")
  public ApiResponse<PlanResponse> archivePlan(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long planId) {
    Plan plan = planRepository.findByIdAndUserId(planId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    plan.setPlanStatus(PlanStatus.ARCHIVED);
    return ApiResponse.success("Plan archived", toResponse(planRepository.save(plan), userAccount.getId()));
  }

  @DeleteMapping("/{planId}")
  public ApiResponse<Void> deletePlan(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long planId) {
    Plan plan = planRepository.findByIdAndUserId(planId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()).stream()
        .filter(task -> belongsToPlan(task, plan))
        .forEach(task -> {
          task.setPlan(null);
          task.setPlanType(com.careeros.plan.enums.PlanType.BOTH);
          careerTaskRepository.save(task);
        });
    planRepository.delete(plan);
    return ApiResponse.success("Plan deleted", null);
  }

  private PlanResponse toResponse(Plan plan, Long userId) {
    List<CareerTask> relatedTasks = careerTaskRepository.findByUserIdOrderByCreatedAtDesc(userId)
        .stream()
        .filter(task -> belongsToPlan(task, plan))
        .toList();
    long totalTasks = relatedTasks.size();
    long completedTasks = relatedTasks.stream().filter(task -> task.getTaskStatus() == com.careeros.plan.enums.TaskStatus.COMPLETED).count();
    long pendingTasks = totalTasks - completedTasks;
    long overdueTasks = relatedTasks.stream()
        .filter(task -> task.getDueDate() != null
            && task.getTaskStatus() != com.careeros.plan.enums.TaskStatus.COMPLETED
            && task.getDueDate().isBefore(java.time.LocalDate.now()))
        .count();
    int progress = calculateProgress(totalTasks, completedTasks);
    long remainingDays = plan.getExpectedEndDate() == null
        ? 0 : java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), plan.getExpectedEndDate());
    return new PlanResponse(
        plan.getId(),
        plan.getTitle(),
        plan.getPlanType(),
        plan.getDescription(),
        plan.getTargetRole(),
        plan.getTargetPackage(),
        plan.getTargetCompanies(),
        plan.getExpectedStartDate(),
        plan.getExpectedEndDate(),
        plan.getPriority(),
        plan.getPlanStatus(),
        plan.getNotes(),
        progress,
        Math.max(remainingDays, 0),
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks);
  }

  private boolean belongsToPlan(CareerTask task, Plan plan) {
    if (task.getPlan() != null) {
      return task.getPlan().getId().equals(plan.getId());
    }
    if (plan.getPlanType() == com.careeros.plan.enums.PlanType.BOTH) {
      return true;
    }
    return task.getPlanType() == com.careeros.plan.enums.PlanType.BOTH
        || task.getPlanType() == plan.getPlanType();
  }

  private int calculateProgress(long totalTasks, long completedTasks) {
    return totalTasks == 0 ? 0 : (int) Math.round((completedTasks * 100.0) / totalTasks);
  }
}
