package com.careeros.resume.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.resume.enums.ResumeStatus;
import com.careeros.resume.enums.ResumeType;
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
@Table(name = "resume_documents")
public class ResumeDocument extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 80)
  private String version;

  private LocalDate createdDate;

  @Column(nullable = false, length = 240)
  private String fileName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private ResumeType resumeType = ResumeType.GENERAL;

  @Column(length = 160)
  private String targetCompany;

  @Column(length = 160)
  private String targetRole;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ResumeStatus resumeStatus = ResumeStatus.DRAFT;

  protected ResumeDocument() {
  }

  public ResumeDocument(UserAccount user) {
    this.user = user;
  }

  public Long getId() { return id; }
  public String getVersion() { return version; }
  public LocalDate getCreatedDate() { return createdDate; }
  public String getFileName() { return fileName; }
  public ResumeType getResumeType() { return resumeType; }
  public String getTargetCompany() { return targetCompany; }
  public String getTargetRole() { return targetRole; }
  public String getNotes() { return notes; }
  public ResumeStatus getResumeStatus() { return resumeStatus; }

  public void update(
      String version,
      LocalDate createdDate,
      String fileName,
      ResumeType resumeType,
      String targetCompany,
      String targetRole,
      String notes,
      ResumeStatus resumeStatus) {
    this.version = version;
    this.createdDate = createdDate == null ? LocalDate.now() : createdDate;
    this.fileName = fileName;
    this.resumeType = resumeType == null ? ResumeType.GENERAL : resumeType;
    this.targetCompany = targetCompany;
    this.targetRole = targetRole;
    this.notes = notes;
    this.resumeStatus = resumeStatus == null ? ResumeStatus.DRAFT : resumeStatus;
  }

  public void setResumeStatus(ResumeStatus resumeStatus) {
    this.resumeStatus = resumeStatus;
  }
}
