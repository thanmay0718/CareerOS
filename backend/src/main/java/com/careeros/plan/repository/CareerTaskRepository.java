package com.careeros.plan.repository;

import com.careeros.plan.entity.CareerTask;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;

public interface CareerTaskRepository extends JpaRepository<CareerTask, Long>, JpaSpecificationExecutor<CareerTask> {

  @EntityGraph(attributePaths = "plan")
  List<CareerTask> findByUserIdOrderByCreatedAtDesc(Long userId);

  @EntityGraph(attributePaths = "plan")
  List<CareerTask> findByUserIdAndTaskStatusNotOrderByCreatedAtDesc(Long userId, com.careeros.plan.enums.TaskStatus taskStatus);

  @EntityGraph(attributePaths = "plan")
  java.util.Optional<CareerTask> findByIdAndUserId(Long id, Long userId);
}
