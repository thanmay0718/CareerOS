package com.careeros.roadmap.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.DifficultyLevel;
import com.careeros.roadmap.enums.RoadmapStatus;
import com.careeros.user.entity.UserAccount;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_roadmaps")
public class LearningRoadmap extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  private Integer estimatedHours;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

  @Column(columnDefinition = "TEXT")
  private String resources;

  @Column(columnDefinition = "TEXT")
  private String projects;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private RoadmapStatus roadmapStatus = RoadmapStatus.NOT_STARTED;

  @Column(nullable = false)
  private int completionPercentage;

  @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<RoadmapModule> modules = new ArrayList<>();

  protected LearningRoadmap() {
  }

  public LearningRoadmap(
      UserAccount user,
      String title,
      String description,
      Integer estimatedHours,
      DifficultyLevel difficulty,
      String resources,
      String projects) {
    this.user = user;
    this.title = title;
    this.description = description;
    this.estimatedHours = estimatedHours;
    this.difficulty = difficulty == null ? DifficultyLevel.MEDIUM : difficulty;
    this.resources = resources;
    this.projects = projects;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public Integer getEstimatedHours() {
    return estimatedHours;
  }

  public DifficultyLevel getDifficulty() {
    return difficulty;
  }

  public String getResources() {
    return resources;
  }

  public String getProjects() {
    return projects;
  }

  public RoadmapStatus getRoadmapStatus() {
    return roadmapStatus;
  }

  public int getCompletionPercentage() {
    return completionPercentage;
  }

  public List<RoadmapModule> getModules() {
    return modules;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public void setEstimatedHours(Integer estimatedHours) {
    this.estimatedHours = estimatedHours;
  }

  public void setDifficulty(DifficultyLevel difficulty) {
    this.difficulty = difficulty == null ? DifficultyLevel.MEDIUM : difficulty;
  }

  public void setResources(String resources) {
    this.resources = resources;
  }

  public void setProjects(String projects) {
    this.projects = projects;
  }

  public void setRoadmapStatus(RoadmapStatus roadmapStatus) {
    this.roadmapStatus = roadmapStatus;
  }

  public void refreshProgress() {
    if (modules.isEmpty()) {
      completionPercentage = 0;
      return;
    }
    long completed = modules.stream().filter(RoadmapModule::isCompleted).count();
    completionPercentage = (int) Math.round((completed * 100.0) / modules.size());
    if (completionPercentage == 100) {
      roadmapStatus = RoadmapStatus.COMPLETED;
    }
  }
}
