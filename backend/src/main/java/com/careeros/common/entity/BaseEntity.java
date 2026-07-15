package com.careeros.common.entity;

import com.careeros.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @Column(length = 100, updatable = false)
  private String createdBy;

  @Column(length = 100)
  private String updatedBy;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private RecordStatus status = RecordStatus.ACTIVE;

  @Column(nullable = false)
  private boolean deleted;

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public String getUpdatedBy() {
    return updatedBy;
  }

  public RecordStatus getStatus() {
    return status;
  }

  public boolean isDeleted() {
    return deleted;
  }

  public void markDeleted() {
    deleted = true;
    status = RecordStatus.ARCHIVED;
  }
}
