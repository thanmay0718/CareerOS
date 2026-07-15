package com.careeros.notification.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.notification.enums.NotificationStatus;
import com.careeros.notification.enums.NotificationType;
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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;

@Entity
@Table(
    name = "career_notifications",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "notification_key"}))
public class CareerNotification extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(name = "notification_key", nullable = false, length = 150)
  private String notificationKey;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private NotificationType notificationType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private NotificationStatus notificationStatus = NotificationStatus.ACTIVE;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Column(length = 80)
  private String actionLabel;

  @Column(length = 200)
  private String actionPath;

  @Column(length = 80)
  private String sourceType;

  private Long sourceId;

  private LocalDate referenceDate;

  private LocalDate resolvedAt;

  protected CareerNotification() {
  }

  public CareerNotification(
      UserAccount user,
      String notificationKey,
      NotificationType notificationType,
      String title,
      String message,
      String actionLabel,
      String actionPath,
      String sourceType,
      Long sourceId,
      LocalDate referenceDate) {
    this.user = user;
    this.notificationKey = notificationKey;
    this.notificationType = notificationType;
    this.title = title;
    this.message = message;
    this.actionLabel = actionLabel;
    this.actionPath = actionPath;
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.referenceDate = referenceDate;
    this.notificationStatus = NotificationStatus.ACTIVE;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public String getNotificationKey() {
    return notificationKey;
  }

  public NotificationType getNotificationType() {
    return notificationType;
  }

  public NotificationStatus getNotificationStatus() {
    return notificationStatus;
  }

  public String getTitle() {
    return title;
  }

  public String getMessage() {
    return message;
  }

  public String getActionLabel() {
    return actionLabel;
  }

  public String getActionPath() {
    return actionPath;
  }

  public String getSourceType() {
    return sourceType;
  }

  public Long getSourceId() {
    return sourceId;
  }

  public LocalDate getReferenceDate() {
    return referenceDate;
  }

  public LocalDate getResolvedAt() {
    return resolvedAt;
  }

  public void update(
      NotificationType notificationType,
      String title,
      String message,
      String actionLabel,
      String actionPath,
      String sourceType,
      Long sourceId,
      LocalDate referenceDate) {
    this.notificationType = notificationType;
    this.title = title;
    this.message = message;
    this.actionLabel = actionLabel;
    this.actionPath = actionPath;
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.referenceDate = referenceDate;
    this.notificationStatus = NotificationStatus.ACTIVE;
    this.resolvedAt = null;
  }

  public void resolve(LocalDate resolvedAt) {
    this.notificationStatus = NotificationStatus.RESOLVED;
    this.resolvedAt = resolvedAt;
  }
}
