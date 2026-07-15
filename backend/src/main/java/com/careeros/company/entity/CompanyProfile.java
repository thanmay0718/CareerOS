package com.careeros.company.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.company.enums.HiringStatus;
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

@Entity
@Table(name = "company_profiles")
public class CompanyProfile extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(nullable = false, length = 180)
  private String companyName;

  @Column(length = 500)
  private String logo;

  @Column(length = 120)
  private String industry;

  @Column(length = 160)
  private String location;

  private BigDecimal averagePackage;

  @Column(columnDefinition = "TEXT")
  private String hiringProcess;

  @Column(columnDefinition = "TEXT")
  private String rounds;

  @Column(columnDefinition = "TEXT")
  private String skillsRequired;

  @Column(columnDefinition = "TEXT")
  private String importantTopics;

  @Column(length = 500)
  private String website;

  @Column(length = 500)
  private String careerPage;

  @Column(columnDefinition = "TEXT")
  private String preparationNotes;

  @Column(columnDefinition = "TEXT")
  private String personalNotes;

  @Column(nullable = false)
  private boolean bookmarked;

  @Column(nullable = false)
  private boolean preparationTracked;

  @Column(nullable = false)
  private boolean dreamCompany;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private HiringStatus hiringStatus = HiringStatus.UNKNOWN;

  protected CompanyProfile() {
  }

  public CompanyProfile(UserAccount user) {
    this.user = user;
  }

  public Long getId() { return id; }
  public String getCompanyName() { return companyName; }
  public String getLogo() { return logo; }
  public String getIndustry() { return industry; }
  public String getLocation() { return location; }
  public BigDecimal getAveragePackage() { return averagePackage; }
  public String getHiringProcess() { return hiringProcess; }
  public String getRounds() { return rounds; }
  public String getSkillsRequired() { return skillsRequired; }
  public String getImportantTopics() { return importantTopics; }
  public String getWebsite() { return website; }
  public String getCareerPage() { return careerPage; }
  public String getPreparationNotes() { return preparationNotes; }
  public String getPersonalNotes() { return personalNotes; }
  public boolean isBookmarked() { return bookmarked; }
  public boolean isPreparationTracked() { return preparationTracked; }
  public boolean isDreamCompany() { return dreamCompany; }
  public HiringStatus getHiringStatus() { return hiringStatus; }

  public void update(
      String companyName,
      String logo,
      String industry,
      String location,
      BigDecimal averagePackage,
      String hiringProcess,
      String rounds,
      String skillsRequired,
      String importantTopics,
      String website,
      String careerPage,
      String preparationNotes,
      String personalNotes,
      boolean bookmarked,
      boolean preparationTracked,
      boolean dreamCompany,
      HiringStatus hiringStatus) {
    this.companyName = companyName;
    this.logo = logo;
    this.industry = industry;
    this.location = location;
    this.averagePackage = averagePackage;
    this.hiringProcess = hiringProcess;
    this.rounds = rounds;
    this.skillsRequired = skillsRequired;
    this.importantTopics = importantTopics;
    this.website = website;
    this.careerPage = careerPage;
    this.preparationNotes = preparationNotes;
    this.personalNotes = personalNotes;
    this.bookmarked = bookmarked;
    this.preparationTracked = preparationTracked;
    this.dreamCompany = dreamCompany;
    this.hiringStatus = hiringStatus == null ? HiringStatus.UNKNOWN : hiringStatus;
  }
}
