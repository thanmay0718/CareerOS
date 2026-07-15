package com.careeros.dashboard.entity;

import com.careeros.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "dashboard_items")
public class DashboardItem extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String title;

  @Column(nullable = false, length = 50)
  private String itemType;

  protected DashboardItem() {
  }

  public DashboardItem(String title, String itemType) {
    this.title = title;
    this.itemType = itemType;
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getItemType() {
    return itemType;
  }

}
