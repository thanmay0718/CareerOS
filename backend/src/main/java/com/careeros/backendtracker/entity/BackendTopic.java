package com.careeros.backendtracker.entity;

import com.careeros.backendtracker.enums.BackendCategory;
import com.careeros.backendtracker.enums.TrackerStatus;
import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.PriorityLevel;
import com.careeros.user.entity.UserAccount;
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
import jakarta.persistence.Table;

@Entity
@Table(name = "backend_topics")
public class BackendTopic extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private BackendCategory category;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TrackerStatus status = TrackerStatus.NOT_STARTED;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PriorityLevel priority = PriorityLevel.MEDIUM;

  @Column(nullable = false)
  private int completionPercentage;

  @Column(nullable = false)
  private int confidencePercentage;

  @Column(nullable = false)
  private int revisionCount;

  @Column(columnDefinition = "TEXT")
  private String resources;

  @Column(columnDefinition = "TEXT")
  private String miniProject;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(columnDefinition = "TEXT")
  private String interviewQuestions;

  private Integer hoursSpent;

  protected BackendTopic() {
  }
}

