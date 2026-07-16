package com.careeros.plan.repository;

import com.careeros.plan.entity.TaskHistoryEvent;
import com.careeros.plan.enums.MissedTaskReason;
import com.careeros.plan.enums.TaskEventType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskHistoryEventRepository extends JpaRepository<TaskHistoryEvent, Long> {

  @EntityGraph(attributePaths = "task")
  List<TaskHistoryEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

  long countByUserIdAndEventTypeAndMissedReasonAndCreatedAtAfter(
      Long userId,
      TaskEventType eventType,
      MissedTaskReason missedReason,
      LocalDateTime createdAtAfter);
}
