package com.careeros.focus.repository;

import com.careeros.focus.entity.FocusSession;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

  List<FocusSession> findByUserIdOrderByCompletedAtDesc(Long userId);

  long countByUserIdAndCompletedAtAfter(Long userId, LocalDateTime completedAtAfter);
}
