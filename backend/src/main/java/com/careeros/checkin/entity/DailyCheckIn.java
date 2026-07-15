package com.careeros.checkin.entity;

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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;

@Entity
@Table(
    name = "daily_check_ins",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "check_in_date"}))
public class DailyCheckIn extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Column(name = "check_in_date", nullable = false)
  private LocalDate checkInDate;

  @Column(nullable = false)
  private Double studyHours = 0d;

  @Column(nullable = false)
  private Integer problemsSolved = 0;

  @Column(length = 80)
  private String mood;

  @Column(nullable = false)
  private Integer energy = 0;

  @Column(nullable = false)
  private Integer confidence = 0;

  @Column(columnDefinition = "TEXT")
  private String todaysAchievement;

  @Column(columnDefinition = "TEXT")
  private String todaysBlocker;

  @Column(columnDefinition = "TEXT")
  private String tomorrowGoal;

  @Column(columnDefinition = "TEXT")
  private String notes;

  protected DailyCheckIn() {
  }

  public DailyCheckIn(UserAccount user, LocalDate checkInDate) {
    this.user = user;
    this.checkInDate = checkInDate;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public LocalDate getCheckInDate() {
    return checkInDate;
  }

  public Double getStudyHours() {
    return studyHours;
  }

  public Integer getProblemsSolved() {
    return problemsSolved;
  }

  public String getMood() {
    return mood;
  }

  public Integer getEnergy() {
    return energy;
  }

  public Integer getConfidence() {
    return confidence;
  }

  public String getTodaysAchievement() {
    return todaysAchievement;
  }

  public String getTodaysBlocker() {
    return todaysBlocker;
  }

  public String getTomorrowGoal() {
    return tomorrowGoal;
  }

  public String getNotes() {
    return notes;
  }

  public void setStudyHours(Double studyHours) {
    this.studyHours = studyHours == null ? 0d : studyHours;
  }

  public void setProblemsSolved(Integer problemsSolved) {
    this.problemsSolved = problemsSolved == null ? 0 : problemsSolved;
  }

  public void setMood(String mood) {
    this.mood = mood;
  }

  public void setEnergy(Integer energy) {
    this.energy = energy == null ? 0 : energy;
  }

  public void setConfidence(Integer confidence) {
    this.confidence = confidence == null ? 0 : confidence;
  }

  public void setTodaysAchievement(String todaysAchievement) {
    this.todaysAchievement = todaysAchievement;
  }

  public void setTodaysBlocker(String todaysBlocker) {
    this.todaysBlocker = todaysBlocker;
  }

  public void setTomorrowGoal(String tomorrowGoal) {
    this.tomorrowGoal = tomorrowGoal;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}

