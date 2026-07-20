package com.careeros.gamification.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.user.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "user_reward_profiles")
public class UserRewardProfile extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private UserAccount user;

  @Column(nullable = false)
  private long coins;

  @Column(nullable = false, columnDefinition = "bigint default 0")
  private long loginCoins;

  private LocalDate lastLoginRewardDate;

  @Column(nullable = false)
  private long xp;

  @Column(nullable = false)
  private int level = 1;

  @Column(nullable = false)
  private long xpForCurrentLevel;

  @Column(nullable = false)
  private long xpForNextLevel = 500;

  @Column(nullable = false)
  private long xpRemainingToNextLevel = 500;

  @Column(nullable = false)
  private int productivityScore;

  protected UserRewardProfile() {
  }

  public UserRewardProfile(UserAccount user) {
    this.user = user;
  }

  public long getCoins() { return coins; }
  public long getLoginCoins() { return loginCoins; }
  public LocalDate getLastLoginRewardDate() { return lastLoginRewardDate; }
  public long getXp() { return xp; }
  public int getLevel() { return level; }
  public long getXpForCurrentLevel() { return xpForCurrentLevel; }
  public long getXpForNextLevel() { return xpForNextLevel; }
  public long getXpRemainingToNextLevel() { return xpRemainingToNextLevel; }
  public int getProductivityScore() { return productivityScore; }

  public void update(long coins, long xp, int productivityScore) {
    this.coins = coins;
    this.xp = xp;
    this.level = (int) (xp / 500) + 1;
    this.xpForCurrentLevel = (this.level - 1L) * 500L;
    this.xpForNextLevel = this.level * 500L;
    this.xpRemainingToNextLevel = Math.max(0, this.xpForNextLevel - xp);
    this.productivityScore = productivityScore;
  }

  public boolean awardDailyLoginCoin(LocalDate loginDate) {
    if (loginDate == null || loginDate.equals(lastLoginRewardDate)) {
      return false;
    }
    this.lastLoginRewardDate = loginDate;
    this.loginCoins++;
    this.coins++;
    return true;
  }
}
