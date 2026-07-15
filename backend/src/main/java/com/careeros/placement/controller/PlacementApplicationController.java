package com.careeros.placement.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.placement.entity.PlacementApplication;
import com.careeros.placement.enums.ApplicationStatus;
import com.careeros.placement.repository.PlacementApplicationRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/placements")
public class PlacementApplicationController {

  private final PlacementApplicationRepository repository;

  public PlacementApplicationController(PlacementApplicationRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public ApiResponse<PlacementPageResponse> list(@AuthenticationPrincipal UserAccount userAccount) {
    List<PlacementApplication> applications = repository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    List<ApplicationResponse> responses = applications.stream().map(this::toResponse).toList();
    PlacementSummary summary = new PlacementSummary(
        applications.size(),
        applications.stream().filter(item -> item.getInterviewDate() != null && !item.getInterviewDate().isBefore(LocalDate.now())).count(),
        applications.stream().filter(item -> item.getApplicationStatus() == ApplicationStatus.OFFER_RECEIVED
            || item.getApplicationStatus() == ApplicationStatus.ACCEPTED
            || item.getApplicationStatus() == ApplicationStatus.JOINED).count(),
        applications.stream().filter(item -> item.getApplicationStatus() == ApplicationStatus.REJECTED).count(),
        applications.stream().filter(item -> item.getApplicationStatus() == ApplicationStatus.WISHLIST).count());
    return ApiResponse.success("Applications loaded", new PlacementPageResponse(summary, responses));
  }

  @PostMapping
  public ApiResponse<ApplicationResponse> create(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody ApplicationRequest request) {
    PlacementApplication application = new PlacementApplication(userAccount);
    apply(application, request);
    return ApiResponse.success("Application created", toResponse(repository.save(application)));
  }

  @PutMapping("/{applicationId}")
  public ApiResponse<ApplicationResponse> update(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long applicationId,
      @Valid @RequestBody ApplicationRequest request) {
    PlacementApplication application = find(applicationId, userAccount.getId());
    apply(application, request);
    return ApiResponse.success("Application updated", toResponse(repository.save(application)));
  }

  @DeleteMapping("/{applicationId}")
  public ApiResponse<Void> delete(@AuthenticationPrincipal UserAccount userAccount, @PathVariable Long applicationId) {
    repository.delete(find(applicationId, userAccount.getId()));
    return ApiResponse.success("Application deleted", null);
  }

  private PlacementApplication find(Long id, Long userId) {
    return repository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
  }

  private void apply(PlacementApplication application, ApplicationRequest request) {
    application.update(
        request.company(),
        request.role(),
        request.packageAmount(),
        request.location(),
        request.applicationDate(),
        request.onlineAssessmentDate(),
        request.interviewDate(),
        request.offerDate(),
        request.applicationStatus(),
        request.referral(),
        request.notes(),
        request.jobDescription(),
        request.applicationSource());
  }

  private ApplicationResponse toResponse(PlacementApplication application) {
    return new ApplicationResponse(
        application.getId(),
        application.getCompany(),
        application.getRole(),
        application.getPackageAmount(),
        application.getLocation(),
        application.getApplicationDate(),
        application.getOnlineAssessmentDate(),
        application.getInterviewDate(),
        application.getOfferDate(),
        application.getApplicationStatus(),
        application.getReferral(),
        application.getNotes(),
        application.getJobDescription(),
        application.getApplicationSource());
  }

  public record ApplicationRequest(
      @NotBlank String company,
      @NotBlank String role,
      BigDecimal packageAmount,
      String location,
      LocalDate applicationDate,
      LocalDate onlineAssessmentDate,
      LocalDate interviewDate,
      LocalDate offerDate,
      ApplicationStatus applicationStatus,
      String referral,
      String notes,
      String jobDescription,
      String applicationSource) {
  }

  public record ApplicationResponse(
      Long id,
      String company,
      String role,
      BigDecimal packageAmount,
      String location,
      LocalDate applicationDate,
      LocalDate onlineAssessmentDate,
      LocalDate interviewDate,
      LocalDate offerDate,
      ApplicationStatus applicationStatus,
      String referral,
      String notes,
      String jobDescription,
      String applicationSource) {
  }

  public record PlacementSummary(long totalApplications, long upcomingInterviews, long offers, long rejections, long wishlistCount) {
  }

  public record PlacementPageResponse(PlacementSummary summary, List<ApplicationResponse> applications) {
  }
}
