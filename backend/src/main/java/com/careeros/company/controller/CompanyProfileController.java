package com.careeros.company.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.company.entity.CompanyProfile;
import com.careeros.company.enums.HiringStatus;
import com.careeros.company.repository.CompanyProfileRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
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
@RequestMapping("/api/companies")
public class CompanyProfileController {

  private final CompanyProfileRepository repository;

  public CompanyProfileController(CompanyProfileRepository repository) {
    this.repository = repository;
  }

  @GetMapping
  public ApiResponse<List<CompanyResponse>> list(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Companies loaded", repository.findByUserIdOrderByCompanyNameAsc(userAccount.getId())
        .stream()
        .map(this::toResponse)
        .toList());
  }

  @PostMapping
  public ApiResponse<CompanyResponse> create(@AuthenticationPrincipal UserAccount userAccount, @Valid @RequestBody CompanyRequest request) {
    CompanyProfile company = new CompanyProfile(userAccount);
    apply(company, request);
    return ApiResponse.success("Company created", toResponse(repository.save(company)));
  }

  @PutMapping("/{companyId}")
  public ApiResponse<CompanyResponse> update(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long companyId,
      @Valid @RequestBody CompanyRequest request) {
    CompanyProfile company = find(companyId, userAccount.getId());
    apply(company, request);
    return ApiResponse.success("Company updated", toResponse(repository.save(company)));
  }

  @DeleteMapping("/{companyId}")
  public ApiResponse<Void> delete(@AuthenticationPrincipal UserAccount userAccount, @PathVariable Long companyId) {
    repository.delete(find(companyId, userAccount.getId()));
    return ApiResponse.success("Company deleted", null);
  }

  private CompanyProfile find(Long id, Long userId) {
    return repository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
  }

  private void apply(CompanyProfile company, CompanyRequest request) {
    company.update(
        request.companyName(),
        request.logo(),
        request.industry(),
        request.location(),
        request.averagePackage(),
        request.hiringProcess(),
        request.rounds(),
        request.skillsRequired(),
        request.importantTopics(),
        request.website(),
        request.careerPage(),
        request.preparationNotes(),
        request.personalNotes(),
        request.bookmarked(),
        request.preparationTracked(),
        request.dreamCompany(),
        request.hiringStatus());
  }

  private CompanyResponse toResponse(CompanyProfile company) {
    return new CompanyResponse(
        company.getId(),
        company.getCompanyName(),
        company.getLogo(),
        company.getIndustry(),
        company.getLocation(),
        company.getAveragePackage(),
        company.getHiringProcess(),
        company.getRounds(),
        company.getSkillsRequired(),
        company.getImportantTopics(),
        company.getWebsite(),
        company.getCareerPage(),
        company.getPreparationNotes(),
        company.getPersonalNotes(),
        company.isBookmarked(),
        company.isPreparationTracked(),
        company.isDreamCompany(),
        company.getHiringStatus());
  }

  public record CompanyRequest(
      @NotBlank String companyName,
      String logo,
      String industry,
      String location,
      BigDecimal averagePackage,
      String hiringProcess,
      String rounds,
      String skillsRequired,
      String importantTopics,
      String website,
      String careerPage,
      String preparationNotes,
      String personalNotes,
      boolean bookmarked,
      boolean preparationTracked,
      boolean dreamCompany,
      HiringStatus hiringStatus) {
  }

  public record CompanyResponse(
      Long id,
      String companyName,
      String logo,
      String industry,
      String location,
      BigDecimal averagePackage,
      String hiringProcess,
      String rounds,
      String skillsRequired,
      String importantTopics,
      String website,
      String careerPage,
      String preparationNotes,
      String personalNotes,
      boolean bookmarked,
      boolean preparationTracked,
      boolean dreamCompany,
      HiringStatus hiringStatus) {
  }
}
