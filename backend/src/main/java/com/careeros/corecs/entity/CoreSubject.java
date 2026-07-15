package com.careeros.corecs.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.PriorityLevel;
import com.careeros.corecs.enums.CoreSubjectName;
import com.careeros.roadmap.enums.LearningStatus;
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
@Table(name = "core_subjects")
public class CoreSubject extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private CoreSubjectName subject;

  @Column(columnDefinition = "TEXT")
  private String topics;

  @Column(nullable = false)
  private int progressPercentage;

  @Column(nullable = false)
  private int revisionCount;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(columnDefinition = "TEXT")
  private String interviewQuestions;

  @Column(nullable = false)
  private int confidencePercentage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PriorityLevel priority = PriorityLevel.MEDIUM;

  @Column(nullable = false)
  private int hoursSpent;

  @Column(columnDefinition = "TEXT")
  private String resources;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private LearningStatus status = LearningStatus.NOT_STARTED;

  protected CoreSubject() {
  }
}

