package com.careeros.dashboard.repository;

import com.careeros.dashboard.entity.DashboardItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardItemRepository extends JpaRepository<DashboardItem, Long> {

  List<DashboardItem> findTop5ByOrderByCreatedAtDesc();
}
