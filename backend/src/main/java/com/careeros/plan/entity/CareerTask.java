package com.careeros.plan.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.common.enums.PriorityLevel;
import com.careeros.plan.enums.TaskCategory;
import com.careeros.plan.enums.MissedTaskReason;
import com.careeros.plan.enums.PlanType;
import com.careeros.plan.enums.TaskStatus;
import com.careeros.plan.entity.Plan;
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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "career_tasks")
public class CareerTask extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "plan_id")
  private Plan plan;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  @ColumnDefault("'OTHER'")
  private TaskCategory category = TaskCategory.OTHER;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @ColumnDefault("'BOTH'")
  private PlanType planType = PlanType.BOTH;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @ColumnDefault("'MEDIUM'")
  private PriorityLevel priority = PriorityLevel.MEDIUM;

  @Enumerated(EnumType.STRING)
  @Column(name = "task_status", nullable = false, length = 20)
  @ColumnDefault("'TODO'")
  private TaskStatus taskStatus = TaskStatus.TODO;

  private LocalDate dueDate;

  private LocalDate completedAt;

  private Integer estimatedDurationMinutes;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Enumerated(EnumType.STRING)
  @Column(length = 40)
  private MissedTaskReason missedReason;

  @Column(columnDefinition = "TEXT")
  private String missedReasonDetail;

  private LocalDateTime missedAt;

  private LocalDateTime rescheduledAt;

  @Column(columnDefinition = "TEXT")
  private String reminderTimes;

  private Boolean browserReminderEnabled = false;

  protected CareerTask() {
  }

  public CareerTask(
      UserAccount user,
      Plan plan,
      String title,
      String description,
      TaskCategory category,
      PlanType planType,
      PriorityLevel priority,
      LocalDate dueDate,
      Integer estimatedDurationMinutes) {
    this.user = user;
    this.plan = plan;
    this.title = title;
    this.description = description;
    this.category = category == null ? TaskCategory.OTHER : category;
    this.planType = planType;
    this.priority = priority;
    this.dueDate = dueDate;
    this.estimatedDurationMinutes = estimatedDurationMinutes;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public Plan getPlan() {
    return plan;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public TaskCategory getCategory() {
    return category;
  }

  public PlanType getPlanType() {
    return planType;
  }

  public PriorityLevel getPriority() {
    return priority;
  }

  public TaskStatus getTaskStatus() {
    return taskStatus;
  }

  public LocalDate getDueDate() {
    return dueDate;
  }

  public LocalDate getCompletedAt() {
    return completedAt;
  }

  public Integer getEstimatedDurationMinutes() {
    return estimatedDurationMinutes;
  }

  public String getNotes() {
    return notes;
  }

  public MissedTaskReason getMissedReason() { return missedReason; }

  public String getMissedReasonDetail() { return missedReasonDetail; }

  public LocalDateTime getMissedAt() { return missedAt; }

  public LocalDateTime getRescheduledAt() { return rescheduledAt; }

  public String getReminderTimes() { return reminderTimes; }

  public boolean isBrowserReminderEnabled() { return Boolean.TRUE.equals(browserReminderEnabled); }

  public void markCompleted(LocalDate completionDate) {
    this.taskStatus = TaskStatus.COMPLETED;
    this.completedAt = completionDate;
    this.missedReason = null;
    this.missedReasonDetail = null;
  }

  public void markMissed(MissedTaskReason reason, String detail) {
    this.taskStatus = TaskStatus.MISSED;
    this.missedReason = reason;
    this.missedReasonDetail = detail;
    this.missedAt = LocalDateTime.now();
  }

  public void reschedule(LocalDate newDueDate) {
    this.taskStatus = TaskStatus.RESCHEDULED;
    this.dueDate = newDueDate;
    this.rescheduledAt = LocalDateTime.now();
  }

  public void setTaskStatus(TaskStatus taskStatus) {
    this.taskStatus = taskStatus;
  }

  public void setPlan(Plan plan) {
    this.plan = plan;
  }

  public void setCategory(TaskCategory category) {
    this.category = category;
  }

  public void setPlanType(PlanType planType) {
    this.planType = planType;
  }

  public void setPriority(PriorityLevel priority) {
    this.priority = priority;
  }

  public void setDueDate(LocalDate dueDate) {
    this.dueDate = dueDate;
  }

  public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
    this.estimatedDurationMinutes = estimatedDurationMinutes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public void setTitle(@NotBlank @Size(max = 160) String title) {
    this.title = title;
  }

  public void setDescription(@Size(max = 4000) String description) {
    this.description = description;
  }

  public void setReminderTimes(String reminderTimes) {
    this.reminderTimes = reminderTimes;
  }

  public void setBrowserReminderEnabled(boolean browserReminderEnabled) {
    this.browserReminderEnabled = browserReminderEnabled;
  }
}
