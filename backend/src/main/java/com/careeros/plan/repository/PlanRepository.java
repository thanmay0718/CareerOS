package com.careeros.plan.repository;

import com.careeros.plan.entity.Plan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface PlanRepository extends JpaRepository<Plan, Long> {

  @EntityGraph(attributePaths = "user")
  List<Plan> findByUserIdOrderByCreatedAtDesc(Long userId);

  @EntityGraph(attributePaths = "user")
  List<Plan> findByUserIdAndPlanStatusNotOrderByCreatedAtDesc(Long userId, com.careeros.plan.enums.PlanStatus planStatus);

  @EntityGraph(attributePaths = "user")
  java.util.Optional<Plan> findByIdAndUserId(Long id, Long userId);
}
