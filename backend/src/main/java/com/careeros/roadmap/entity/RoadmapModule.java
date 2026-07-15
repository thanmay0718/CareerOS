package com.careeros.roadmap.entity;

import com.careeros.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "roadmap_modules")
public class RoadmapModule extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "roadmap_id", nullable = false)
  private LearningRoadmap roadmap;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false)
  private int sequenceNumber;

  private Integer estimatedTimeHours;

  @Column(nullable = false)
  private boolean completed;

  @Column(columnDefinition = "TEXT")
  private String notes;

  protected RoadmapModule() {
  }

  public RoadmapModule(
      LearningRoadmap roadmap,
      String title,
      String description,
      int sequenceNumber,
      Integer estimatedTimeHours,
      String notes) {
    this.roadmap = roadmap;
    this.title = title;
    this.description = description;
    this.sequenceNumber = sequenceNumber;
    this.estimatedTimeHours = estimatedTimeHours;
    this.notes = notes;
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public int getSequenceNumber() {
    return sequenceNumber;
  }

  public Integer getEstimatedTimeHours() {
    return estimatedTimeHours;
  }

  public boolean isCompleted() {
    return completed;
  }

  public String getNotes() {
    return notes;
  }

  public void setCompleted(boolean completed) {
    this.completed = completed;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
