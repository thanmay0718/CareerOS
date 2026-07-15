package com.careeros.roadmap.repository;

import com.careeros.roadmap.entity.LearningRoadmap;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {

  @EntityGraph(attributePaths = "modules")
  List<LearningRoadmap> findByUserIdOrderByTitleAsc(Long userId);

  @EntityGraph(attributePaths = "modules")
  Optional<LearningRoadmap> findByIdAndUserId(Long id, Long userId);

  boolean existsByUserId(Long userId);
}
