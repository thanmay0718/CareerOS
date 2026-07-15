package com.careeros.placement.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.placement.enums.ApplicationStatus;
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
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "placement_applications")
public class PlacementApplication extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 160)
  private String company;

  @Column(nullable = false, length = 160)
  private String role;

  private BigDecimal packageAmount;

  @Column(length = 160)
  private String location;

  private LocalDate applicationDate;
  private LocalDate onlineAssessmentDate;
  private LocalDate interviewDate;
  private LocalDate offerDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private ApplicationStatus applicationStatus = ApplicationStatus.WISHLIST;

  @Column(length = 160)
  private String referral;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(columnDefinition = "TEXT")
  private String jobDescription;

  @Column(length = 160)
  private String applicationSource;

  protected PlacementApplication() {
  }

  public PlacementApplication(UserAccount user) {
    this.user = user;
  }

  public Long getId() { return id; }
  public String getCompany() { return company; }
  public String getRole() { return role; }
  public BigDecimal getPackageAmount() { return packageAmount; }
  public String getLocation() { return location; }
  public LocalDate getApplicationDate() { return applicationDate; }
  public LocalDate getOnlineAssessmentDate() { return onlineAssessmentDate; }
  public LocalDate getInterviewDate() { return interviewDate; }
  public LocalDate getOfferDate() { return offerDate; }
  public ApplicationStatus getApplicationStatus() { return applicationStatus; }
  public String getReferral() { return referral; }
  public String getNotes() { return notes; }
  public String getJobDescription() { return jobDescription; }
  public String getApplicationSource() { return applicationSource; }

  public void update(
      String company,
      String role,
      BigDecimal packageAmount,
      String location,
      LocalDate applicationDate,
      LocalDate onlineAssessmentDate,
      LocalDate interviewDate,
      LocalDate offerDate,
      ApplicationStatus applicationStatus,
      String referral,
      String notes,
      String jobDescription,
      String applicationSource) {
    this.company = company;
    this.role = role;
    this.packageAmount = packageAmount;
    this.location = location;
    this.applicationDate = applicationDate;
    this.onlineAssessmentDate = onlineAssessmentDate;
    this.interviewDate = interviewDate;
    this.offerDate = offerDate;
    this.applicationStatus = applicationStatus == null ? ApplicationStatus.WISHLIST : applicationStatus;
    this.referral = referral;
    this.notes = notes;
    this.jobDescription = jobDescription;
    this.applicationSource = applicationSource;
  }
}
