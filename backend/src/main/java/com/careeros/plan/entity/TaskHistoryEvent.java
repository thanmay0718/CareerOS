package com.careeros.plan.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.plan.enums.MissedTaskReason;
import com.careeros.plan.enums.TaskEventType;
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
@Table(name = "task_history_events")
public class TaskHistoryEvent extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false)
  private CareerTask task;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private TaskEventType eventType;

  @Enumerated(EnumType.STRING)
  @Column(length = 40)
  private MissedTaskReason missedReason;

  @Column(columnDefinition = "TEXT")
  private String detail;

  private LocalDate previousDueDate;
  private LocalDate newDueDate;

  protected TaskHistoryEvent() {
  }

  public TaskHistoryEvent(
      UserAccount user,
      CareerTask task,
      TaskEventType eventType,
      MissedTaskReason missedReason,
      String detail,
      LocalDate previousDueDate,
      LocalDate newDueDate) {
    this.user = user;
    this.task = task;
    this.eventType = eventType;
    this.missedReason = missedReason;
    this.detail = detail;
    this.previousDueDate = previousDueDate;
    this.newDueDate = newDueDate;
  }

  public Long getId() { return id; }
  public CareerTask getTask() { return task; }
  public TaskEventType getEventType() { return eventType; }
  public MissedTaskReason getMissedReason() { return missedReason; }
  public String getDetail() { return detail; }
  public LocalDate getPreviousDueDate() { return previousDueDate; }
  public LocalDate getNewDueDate() { return newDueDate; }
}
