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
import java.util.Comparator;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmaps")
public class LearningRoadmapController {

  private final LearningRoadmapRepository roadmapRepository;

  public LearningRoadmapController(LearningRoadmapRepository roadmapRepository) {
    this.roadmapRepository = roadmapRepository;
  }

  @GetMapping
  @Transactional
  public ApiResponse<List<RoadmapResponse>> list(@AuthenticationPrincipal UserAccount userAccount) {
    seedDefaults(userAccount);
    List<RoadmapResponse> responses = roadmapRepository.findByUserIdOrderByTitleAsc(userAccount.getId())
        .stream()
        .map(this::toResponse)
        .toList();
    return ApiResponse.success("Roadmaps loaded", responses);
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

  private void seedDefaults(UserAccount userAccount) {
    if (roadmapRepository.existsByUserId(userAccount.getId())) {
      return;
    }
    defaultRoadmaps().forEach(seed -> {
      LearningRoadmap roadmap = new LearningRoadmap(
          userAccount,
          seed.title(),
          seed.description(),
          seed.hours(),
          seed.difficulty(),
          seed.resources(),
          seed.projects());
      int sequence = 1;
      for (String moduleTitle : seed.modules()) {
        roadmap.getModules().add(new RoadmapModule(
            roadmap,
            moduleTitle,
            "Master " + moduleTitle.toLowerCase() + " with lessons, practice, and interview-ready revision.",
            sequence++,
            Math.max(2, seed.hours() / Math.max(1, seed.modules().size())),
            ""));
      }
      roadmapRepository.save(roadmap);
    });
  }

  private List<RoadmapSeed> defaultRoadmaps() {
    return List.of(
        seed("Java", 45, DifficultyLevel.MEDIUM, "Core syntax, OOP, collections, streams, concurrency, and JVM fundamentals"),
        seed("Spring Boot", 50, DifficultyLevel.HARD, "REST APIs, validation, security, JPA, testing, deployment"),
        seed("React", 45, DifficultyLevel.MEDIUM, "Components, hooks, routing, forms, state, API integration"),
        seed("PostGreSQL", 35, DifficultyLevel.MEDIUM, "SQL, schema design, indexing, joins, transactions, query plans"),
        seed("DSA", 90, DifficultyLevel.HARD, "Arrays, strings, recursion, trees, graphs, DP, greedy practice"),
        seed("System Design", 70, DifficultyLevel.HARD, "Scalability, caching, queues, databases, API design, tradeoffs"),
        seed("Docker", 24, DifficultyLevel.MEDIUM, "Images, containers, volumes, networks, compose, deployment workflows"),
        seed("AWS", 55, DifficultyLevel.HARD, "IAM, EC2, S3, RDS, Lambda, VPC, deployment basics"),
        seed("Microservices", 60, DifficultyLevel.HARD, "Service boundaries, discovery, gateway, resilience, observability"),
        seed("Operating Systems", 40, DifficultyLevel.MEDIUM, "Processes, threads, memory, scheduling, deadlocks, filesystems"),
        seed("DBMS", 40, DifficultyLevel.MEDIUM, "ER modeling, normalization, transactions, indexes, recovery"),
        seed("Computer Networks", 42, DifficultyLevel.MEDIUM, "OSI, TCP/IP, HTTP, DNS, routing, security"),
        seed("HR Preparation", 20, DifficultyLevel.EASY, "Introductions, projects, strengths, behavioral answers, salary discussion"),
        seed("Aptitude", 35, DifficultyLevel.MEDIUM, "Quantitative aptitude, logical reasoning, verbal ability, mock tests"));
  }

  private RoadmapSeed seed(String title, int hours, DifficultyLevel difficulty, String description) {
    return new RoadmapSeed(
        title,
        description,
        hours,
        difficulty,
        "Official docs, curated articles, video lessons, practice sets",
        "Build portfolio-ready exercises and one capstone mini project",
        List.of("Foundation lessons", "Guided practice", "Interview topics", "Project work", "Revision plan"));
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
        roadmap.getCompletionPercentage());
  }

  private record RoadmapSeed(
      String title,
      String description,
      int hours,
      DifficultyLevel difficulty,
      String resources,
      String projects,
      List<String> modules) {
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
      int completionPercentage) {
  }
}
