package com.careeros.placement.repository;

import com.careeros.placement.entity.PlacementApplication;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
  List<PlacementApplication> findByUserIdOrderByCreatedAtDesc(Long userId);
  Optional<PlacementApplication> findByIdAndUserId(Long id, Long userId);
}
