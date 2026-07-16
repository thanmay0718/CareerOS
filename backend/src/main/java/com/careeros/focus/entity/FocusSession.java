package com.careeros.focus.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.user.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "focus_sessions")
public class FocusSession extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false)
  private Integer durationMinutes;

  @Column(nullable = false, length = 40)
  private String sessionType;

  @Column(nullable = false)
  private LocalDateTime completedAt;

  protected FocusSession() {
  }

  public FocusSession(UserAccount user, Integer durationMinutes, String sessionType, LocalDateTime completedAt) {
    this.user = user;
    this.durationMinutes = durationMinutes;
    this.sessionType = sessionType;
    this.completedAt = completedAt;
  }

  public Long getId() { return id; }
  public Integer getDurationMinutes() { return durationMinutes; }
  public String getSessionType() { return sessionType; }
  public LocalDateTime getCompletedAt() { return completedAt; }
}
