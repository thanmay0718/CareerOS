package com.careeros.roadmap.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.enums.DifficultyLevel;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.roadmap.entity.LearningRoadmap;
import com.careeros.roadmap.entity.RoadmapModule;
import com.careeros.roadmap.enums.RoadmapStatus;
import com.careeros.roadmap.repository.LearningRoadmapRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmaps")
public class LearningRoadmapController {

  private static final int DEFAULT_CONCEPT_HOURS = 2;

  private final LearningRoadmapRepository roadmapRepository;

  public LearningRoadmapController(LearningRoadmapRepository roadmapRepository) {
    this.roadmapRepository = roadmapRepository;
  }

  @GetMapping
  @Transactional
  public ApiResponse<List<RoadmapResponse>> list(
      @AuthenticationPrincipal UserAccount userAccount,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) RoadmapStatus status,
      @RequestParam(required = false) DifficultyLevel difficulty,
      @RequestParam(defaultValue = "updatedAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDirection) {
    List<RoadmapResponse> responses = roadmapRepository.findByUserIdOrderByTitleAsc(userAccount.getId())
        .stream()
        .filter(roadmap -> matchesSearch(roadmap, search))
        .filter(roadmap -> status == null || roadmap.getRoadmapStatus() == status)
        .filter(roadmap -> difficulty == null || roadmap.getDifficulty() == difficulty)
        .sorted(sortRoadmaps(sortBy, sortDirection))
        .map(this::toResponse)
        .toList();
    return ApiResponse.success("Roadmaps loaded", responses);
  }

  @GetMapping("/recommendations")
  @Transactional
  public ApiResponse<List<RoadmapRecommendationResponse>> recommendations(
      @AuthenticationPrincipal UserAccount userAccount,
      @RequestParam String search) {
    String query = clean(search);
    if (query.isBlank()) {
      return ApiResponse.success("Roadmap recommendations loaded", List.of());
    }

    List<RoadmapRecommendationResponse> existingMatches = roadmapRepository.findByUserIdOrderByTitleAsc(userAccount.getId())
        .stream()
        .filter(roadmap -> matchesSearch(roadmap, query))
        .limit(5)
        .map(roadmap -> new RoadmapRecommendationResponse(
            roadmap.getTitle(),
            roadmap.getDescription(),
            roadmap.getDifficulty(),
            roadmap.getEstimatedHours(),
            roadmap.getModules().stream()
                .sorted(Comparator.comparing(RoadmapModule::getSequenceNumber))
                .map(RoadmapModule::getTitle)
                .toList(),
            true))
        .toList();

    if (!existingMatches.isEmpty()) {
      return ApiResponse.success("Roadmap recommendations loaded", existingMatches);
    }

    List<String> concepts = Stream.of(
            "Foundations",
            "Environment setup",
            "Core syntax and terminology",
            "Data modeling",
            "Control flow and workflows",
            "Reusable components",
            "Error handling",
            "Testing strategy",
            "API integration",
            "Security basics",
            "Performance tuning",
            "Deployment workflow",
            "Production project",
            "Interview revision")
        .map(topic -> query + " " + topic)
        .toList();

    RoadmapRecommendationResponse generated = new RoadmapRecommendationResponse(
        titleCase(query),
        "Backend-generated starter path for " + titleCase(query) + ". Save it to My Learning, then edit concepts, hours, notes, and progress.",
        DifficultyLevel.MEDIUM,
        concepts.size() * DEFAULT_CONCEPT_HOURS,
        concepts,
        false);
    return ApiResponse.success("Roadmap recommendations loaded", List.of(generated));
  }

  @PostMapping
  @Transactional
  public ApiResponse<RoadmapResponse> create(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody RoadmapRequest request) {
    LearningRoadmap roadmap = new LearningRoadmap(
        userAccount,
        request.title(),
        request.description(),
        request.estimatedHours(),
        request.difficulty(),
        request.resources(),
        request.projects());
    roadmap.setRoadmapStatus(request.status() == null ? RoadmapStatus.ACTIVE : request.status());
    replaceModules(roadmap, request.modules());
    roadmap.refreshProgress();
    return ApiResponse.success("Roadmap created", toResponse(roadmapRepository.save(roadmap)));
  }

  @PutMapping("/{roadmapId}")
  @Transactional
  public ApiResponse<RoadmapResponse> update(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long roadmapId,
      @Valid @RequestBody RoadmapRequest request) {
    LearningRoadmap roadmap = findRoadmap(roadmapId, userAccount.getId());
    roadmap.setTitle(request.title());
    roadmap.setDescription(request.description());
    roadmap.setEstimatedHours(request.estimatedHours());
    roadmap.setDifficulty(request.difficulty());
    roadmap.setResources(request.resources());
    roadmap.setProjects(request.projects());
    roadmap.setRoadmapStatus(request.status() == null ? roadmap.getRoadmapStatus() : request.status());
    replaceModules(roadmap, request.modules());
    roadmap.refreshProgress();
    return ApiResponse.success("Roadmap updated", toResponse(roadmapRepository.save(roadmap)));
  }

  @DeleteMapping("/{roadmapId}")
  @Transactional
  public ApiResponse<Void> delete(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long roadmapId) {
    LearningRoadmap roadmap = findRoadmap(roadmapId, userAccount.getId());
    roadmapRepository.delete(roadmap);
    return ApiResponse.success("Roadmap deleted", null);
  }

  @PatchMapping("/{roadmapId}/status/{status}")
  @Transactional
  public ApiResponse<RoadmapResponse> changeStatus(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long roadmapId,
      @PathVariable RoadmapStatus status) {
    LearningRoadmap roadmap = findRoadmap(roadmapId, userAccount.getId());
    roadmap.setRoadmapStatus(status);
    if (status == RoadmapStatus.COMPLETED) {
      roadmap.getModules().forEach(module -> module.setCompleted(true));
    }
    roadmap.refreshProgress();
    return ApiResponse.success("Roadmap status updated", toResponse(roadmapRepository.save(roadmap)));
  }

  @PutMapping("/{roadmapId}/modules/{moduleId}")
  @Transactional
  public ApiResponse<RoadmapResponse> updateModule(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long roadmapId,
      @PathVariable Long moduleId,
      @RequestBody ModuleUpdateRequest request) {
    LearningRoadmap roadmap = findRoadmap(roadmapId, userAccount.getId());
    RoadmapModule module = roadmap.getModules().stream()
        .filter(item -> item.getId().equals(moduleId))
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Roadmap module not found"));
    module.setCompleted(request.completed());
    module.setNotes(request.notes());
    roadmap.refreshProgress();
    return ApiResponse.success("Roadmap progress updated", toResponse(roadmapRepository.save(roadmap)));
  }

  private LearningRoadmap findRoadmap(Long roadmapId, Long userId) {
    return roadmapRepository.findByIdAndUserId(roadmapId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));
  }

  private void replaceModules(LearningRoadmap roadmap, List<ModuleRequest> modules) {
    roadmap.getModules().clear();
    if (modules == null || modules.isEmpty()) {
      return;
    }
    int sequence = 1;
    for (ModuleRequest moduleRequest : modules) {
      RoadmapModule module = new RoadmapModule(
          roadmap,
          moduleRequest.title(),
          moduleRequest.description(),
          sequence++,
          moduleRequest.estimatedTime(),
          moduleRequest.notes());
      module.setCompleted(Boolean.TRUE.equals(moduleRequest.completed()));
      roadmap.getModules().add(module);
    }
  }

  private boolean matchesSearch(LearningRoadmap roadmap, String search) {
    String needle = clean(search);
    if (needle.isBlank()) {
      return true;
    }
    return Stream.of(roadmap.getTitle(), roadmap.getDescription(), roadmap.getResources(), roadmap.getProjects())
        .filter(value -> value != null)
        .map(value -> value.toLowerCase(Locale.ROOT))
        .anyMatch(value -> value.contains(needle))
        || roadmap.getModules().stream().anyMatch(module -> Stream.of(module.getTitle(), module.getDescription(), module.getNotes())
            .filter(value -> value != null)
            .map(value -> value.toLowerCase(Locale.ROOT))
            .anyMatch(value -> value.contains(needle)));
  }

  private Comparator<LearningRoadmap> sortRoadmaps(String sortBy, String sortDirection) {
    Comparator<LearningRoadmap> comparator;
    switch (sortBy == null ? "updatedAt" : sortBy) {
      case "title" -> comparator = Comparator.comparing(LearningRoadmap::getTitle, String.CASE_INSENSITIVE_ORDER);
      case "estimatedHours" -> comparator = Comparator.comparing(LearningRoadmap::getEstimatedHours, Comparator.nullsLast(Comparator.naturalOrder()));
      case "progress" -> comparator = Comparator.comparing(LearningRoadmap::getCompletionPercentage);
      case "createdAt" -> comparator = Comparator.comparing(LearningRoadmap::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
      default -> comparator = Comparator.comparing(LearningRoadmap::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
    }
    return "asc".equalsIgnoreCase(sortDirection) ? comparator : comparator.reversed();
  }

  private RoadmapResponse toResponse(LearningRoadmap roadmap) {
    List<ModuleResponse> modules = roadmap.getModules().stream()
        .sorted(Comparator.comparing(RoadmapModule::getSequenceNumber))
        .map(module -> new ModuleResponse(
            module.getId(),
            module.getTitle(),
            module.getDescription(),
            module.getSequenceNumber(),
            module.getEstimatedTimeHours(),
            module.isCompleted(),
            module.getNotes()))
        .toList();
    long completed = modules.stream().filter(ModuleResponse::completed).count();
    ModuleResponse currentModule = modules.stream().filter(module -> !module.completed()).findFirst().orElse(null);
    ModuleResponse nextModule = modules.stream().filter(module -> !module.completed())
        .skip(currentModule == null ? 0 : 1)
        .findFirst()
        .orElse(null);
    return new RoadmapResponse(
        roadmap.getId(),
        roadmap.getTitle(),
        roadmap.getDescription(),
        modules,
        modules.size(),
        roadmap.getEstimatedHours(),
        roadmap.getDifficulty(),
        roadmap.getResources(),
        roadmap.getProjects(),
        roadmap.getRoadmapStatus(),
        roadmap.getCompletionPercentage(),
        (int) completed,
        Math.max(0, modules.size() - (int) completed),
        currentModule == null ? "Ready for review" : currentModule.title(),
        nextModule == null ? "No queued module" : nextModule.title(),
        formatLastOpened(roadmap.getUpdatedAt()),
        roadmap.getCreatedAt(),
        roadmap.getUpdatedAt());
  }

  private String clean(String value) {
    return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
  }

  private String titleCase(String value) {
    return Stream.of(value.trim().split("\\s+"))
        .filter(part -> !part.isBlank())
        .map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1).toLowerCase(Locale.ROOT))
        .reduce((left, right) -> left + " " + right)
        .orElse(value);
  }

  private String formatLastOpened(LocalDateTime value) {
    if (value == null) {
      return "Not opened";
    }
    long days = Duration.between(value, LocalDateTime.now()).toDays();
    if (days <= 0) {
      return "Today";
    }
    return days == 1 ? "Yesterday" : days + " days ago";
  }

  public record RoadmapRequest(
      @NotBlank String title,
      String description,
      @Positive Integer estimatedHours,
      DifficultyLevel difficulty,
      String resources,
      String projects,
      RoadmapStatus status,
      List<ModuleRequest> modules) {
  }

  public record ModuleRequest(
      @NotBlank String title,
      String description,
      Integer estimatedTime,
      Boolean completed,
      String notes) {
  }

  public record ModuleUpdateRequest(boolean completed, String notes) {
  }

  public record ModuleResponse(
      Long id,
      String title,
      String description,
      int sequence,
      Integer estimatedTime,
      boolean completed,
      String notes) {
  }

  public record RoadmapRecommendationResponse(
      String title,
      String description,
      DifficultyLevel difficulty,
      Integer estimatedHours,
      List<String> concepts,
      boolean saved) {
  }

  public record RoadmapResponse(
      Long id,
      String title,
      String description,
      List<ModuleResponse> modules,
      int lessons,
      Integer estimatedHours,
      DifficultyLevel difficulty,
      String resources,
      String projects,
      RoadmapStatus status,
      int completionPercentage,
      int completedConcepts,
      int remainingConcepts,
      String currentModule,
      String nextModule,
      String lastOpened,
      LocalDateTime createdAt,
      LocalDateTime updatedAt) {
  }
}
