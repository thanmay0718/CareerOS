package com.careeros.resume.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.resume.entity.ResumeDocument;
import com.careeros.resume.enums.ResumeStatus;
import com.careeros.resume.enums.ResumeType;
import com.careeros.resume.repository.ResumeDocumentRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
public class ResumeDocumentController {

  private final ResumeDocumentRepository repository;

  public ResumeDocumentController(ResumeDocumentRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public ApiResponse<ResumePageResponse> list(@AuthenticationPrincipal UserAccount userAccount) {
    List<ResumeDocument> resumes = repository.findByUserIdOrderByCreatedDateDescCreatedAtDesc(userAccount.getId());
    ResumeDocument active = resumes.stream()
        .filter(item -> item.getResumeStatus() == ResumeStatus.ACTIVE)
        .findFirst()
        .orElse(null);
    ResumeSummary summary = new ResumeSummary(
        active == null ? null : active.getFileName(),
        active == null ? null : active.getCreatedDate(),
        resumes.size());
    return ApiResponse.success("Resumes loaded", new ResumePageResponse(summary, resumes.stream().map(this::toResponse).toList()));
  }

  @PostMapping
  public ApiResponse<ResumeResponse> create(@AuthenticationPrincipal UserAccount userAccount, @Valid @RequestBody ResumeRequest request) {
    ResumeDocument resume = new ResumeDocument(userAccount);
    apply(resume, request);
    if (resume.getResumeStatus() == ResumeStatus.ACTIVE) {
      archiveOtherActive(userAccount.getId(), null);
    }
    return ApiResponse.success("Resume uploaded", toResponse(repository.save(resume)));
  }

  @PutMapping("/{resumeId}")
  public ApiResponse<ResumeResponse> update(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long resumeId,
      @Valid @RequestBody ResumeRequest request) {
    ResumeDocument resume = find(resumeId, userAccount.getId());
    apply(resume, request);
    if (resume.getResumeStatus() == ResumeStatus.ACTIVE) {
      archiveOtherActive(userAccount.getId(), resumeId);
    }
    return ApiResponse.success("Resume updated", toResponse(repository.save(resume)));
  }

  @PatchMapping("/{resumeId}/active")
  public ApiResponse<ResumeResponse> activate(@AuthenticationPrincipal UserAccount userAccount, @PathVariable Long resumeId) {
    ResumeDocument resume = find(resumeId, userAccount.getId());
    archiveOtherActive(userAccount.getId(), resumeId);
    resume.setResumeStatus(ResumeStatus.ACTIVE);
    return ApiResponse.success("Active resume updated", toResponse(repository.save(resume)));
  }

  @PatchMapping("/{resumeId}/archive")
  public ApiResponse<ResumeResponse> archive(@AuthenticationPrincipal UserAccount userAccount, @PathVariable Long resumeId) {
    ResumeDocument resume = find(resumeId, userAccount.getId());
    resume.setResumeStatus(ResumeStatus.ARCHIVED);
    return ApiResponse.success("Resume archived", toResponse(repository.save(resume)));
  }

  @DeleteMapping("/{resumeId}")
  public ApiResponse<Void> delete(@AuthenticationPrincipal UserAccount userAccount, @PathVariable Long resumeId) {
    repository.delete(find(resumeId, userAccount.getId()));
    return ApiResponse.success("Resume deleted", null);
  }

  private ResumeDocument find(Long id, Long userId) {
    return repository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
  }

  private void archiveOtherActive(Long userId, Long currentId) {
    repository.findByUserIdAndResumeStatus(userId, ResumeStatus.ACTIVE).forEach(item -> {
      if (currentId == null || !item.getId().equals(currentId)) {
        item.setResumeStatus(ResumeStatus.ARCHIVED);
        repository.save(item);
      }
    });
  }

  private void apply(ResumeDocument resume, ResumeRequest request) {
    resume.update(
        request.version(),
        request.createdDate(),
        request.fileName(),
        request.resumeType(),
        request.targetCompany(),
        request.targetRole(),
        request.notes(),
        request.resumeStatus());
  }

  private ResumeResponse toResponse(ResumeDocument resume) {
    return new ResumeResponse(
        resume.getId(),
        resume.getVersion(),
        resume.getCreatedDate(),
        resume.getFileName(),
        resume.getResumeType(),
        resume.getTargetCompany(),
        resume.getTargetRole(),
        resume.getNotes(),
        resume.getResumeStatus());
  }

  public record ResumeRequest(
      @NotBlank String version,
      LocalDate createdDate,
      @NotBlank String fileName,
      ResumeType resumeType,
      String targetCompany,
      String targetRole,
      String notes,
      ResumeStatus resumeStatus) {
  }

  public record ResumeResponse(
      Long id,
      String version,
      LocalDate createdDate,
      String fileName,
      ResumeType resumeType,
      String targetCompany,
      String targetRole,
      String notes,
      ResumeStatus resumeStatus) {
  }

  public record ResumeSummary(String currentResume, LocalDate lastUpdated, long resumeVersions) {
  }

  public record ResumePageResponse(ResumeSummary summary, List<ResumeResponse> resumes) {
  }
}
