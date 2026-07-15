package com.careeros.interview.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.DifficultyLevel;
import com.careeros.interview.enums.ExperienceLevel;
import com.careeros.interview.enums.InterviewOutcome;
import com.careeros.interview.enums.InterviewRound;
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
import java.time.LocalDate;

@Entity
@Table(name = "interview_experiences")
public class InterviewExperience extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 160)
  private String company;

  @Column(nullable = false, length = 120)
  private String role;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private InterviewRound interviewRound;

  private LocalDate interviewDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ExperienceLevel experienceLevel = ExperienceLevel.FRESHER;

  @Column(columnDefinition = "TEXT")
  private String technicalQuestions;

  @Column(columnDefinition = "TEXT")
  private String codingQuestions;

  @Column(columnDefinition = "TEXT")
  private String sqlQuestions;

  @Column(columnDefinition = "TEXT")
  private String systemDesignQuestions;

  @Column(columnDefinition = "TEXT")
  private String hrQuestions;

  @Column(columnDefinition = "TEXT")
  private String behavioralQuestions;

  @Column(columnDefinition = "TEXT")
  private String mistakes;

  @Column(columnDefinition = "TEXT")
  private String lessonsLearned;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

  private Integer overallRating;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private InterviewOutcome outcome = InterviewOutcome.PENDING;

  protected InterviewExperience() {
  }
}

