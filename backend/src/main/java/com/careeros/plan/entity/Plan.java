package com.careeros.plan.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.PlanStatus;
import com.careeros.plan.enums.PlanType;
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
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "plans")
public class Plan extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PlanType planType;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(length = 120)
  private String targetRole;

  @Column(length = 120)
  private String targetPackage;

  @Column(length = 200)
  private String targetCompanies;

  private LocalDate expectedStartDate;

  private LocalDate expectedEndDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @ColumnDefault("'MEDIUM'")
  private PriorityLevel priority = PriorityLevel.MEDIUM;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(nullable = false)
  private int progressPercentage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @ColumnDefault("'ACTIVE'")
  private PlanStatus planStatus = PlanStatus.ACTIVE;

  protected Plan() {
  }

  public Plan(
      UserAccount user,
      PlanType planType,
      String title,
      String description,
      String targetRole,
      String targetPackage,
      String targetCompanies,
      LocalDate expectedStartDate,
      LocalDate expectedEndDate,
      PriorityLevel priority,
      String notes) {
    this.user = user;
    this.planType = planType;
    this.title = title;
    this.description = description;
    this.targetRole = targetRole;
    this.targetPackage = targetPackage;
    this.targetCompanies = targetCompanies;
    this.expectedStartDate = expectedStartDate;
    this.expectedEndDate = expectedEndDate;
    this.priority = priority == null ? PriorityLevel.MEDIUM : priority;
    this.notes = notes;
    this.progressPercentage = 0;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public PlanType getPlanType() {
    return planType;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public String getTargetRole() {
    return targetRole;
  }

  public String getTargetPackage() {
    return targetPackage;
  }

  public String getTargetCompanies() {
    return targetCompanies;
  }

  public LocalDate getExpectedStartDate() {
    return expectedStartDate;
  }

  public LocalDate getExpectedEndDate() {
    return expectedEndDate;
  }

  public PriorityLevel getPriority() {
    return priority;
  }

  public String getNotes() {
    return notes;
  }

  public int getProgressPercentage() {
    return progressPercentage;
  }

  public PlanStatus getPlanStatus() {
    return planStatus;
  }

  public void setProgressPercentage(int progressPercentage) {
    this.progressPercentage = Math.max(0, Math.min(100, progressPercentage));
    if (this.progressPercentage == 100) {
      this.planStatus = PlanStatus.COMPLETED;
    } else if (this.planStatus == PlanStatus.COMPLETED && this.progressPercentage < 100) {
      this.planStatus = PlanStatus.ACTIVE;
    }
  }

  public void setPlanStatus(PlanStatus planStatus) {
    this.planStatus = planStatus;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public void setTargetRole(String targetRole) {
    this.targetRole = targetRole;
  }

  public void setTargetPackage(String targetPackage) {
    this.targetPackage = targetPackage;
  }

  public void setTargetCompanies(String targetCompanies) {
    this.targetCompanies = targetCompanies;
  }

  public void setExpectedStartDate(LocalDate expectedStartDate) {
    this.expectedStartDate = expectedStartDate;
  }

  public void setExpectedEndDate(LocalDate expectedEndDate) {
    this.expectedEndDate = expectedEndDate;
  }

  public void setPriority(PriorityLevel priority) {
    this.priority = priority;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
