package com.careeros.dsa.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.DifficultyLevel;
import com.careeros.user.entity.UserAccount;
import com.careeros.dsa.enums.DsaPlatform;
import com.careeros.dsa.enums.DsaStatus;
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
@Table(name = "dsa_problems")
public class DsaProblem extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 180)
  private String problemName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DsaPlatform platform = DsaPlatform.LEETCODE;

  @Column(length = 400)
  private String problemLink;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

  @Column(length = 120)
  private String topic;

  @Column(length = 120)
  private String pattern;

  @Column(length = 200)
  private String companyTags;

  private Integer timeTakenMinutes;

  private LocalDate solvedDate;

  private Integer revisionCount;

  private Integer confidencePercentage;

  @Column(columnDefinition = "TEXT")
  private String mistakes;

  @Column(columnDefinition = "TEXT")
  private String approach;

  @Column(columnDefinition = "TEXT")
  private String optimizedSolution;

  @Column(columnDefinition = "TEXT")
  private String personalNotes;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DsaStatus status = DsaStatus.UNSOLVED;

  protected DsaProblem() {
  }
}

