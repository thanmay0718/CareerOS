package com.careeros.backendtracker.repository;

import com.careeros.backendtracker.entity.BackendTopic;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackendTopicRepository extends JpaRepository<BackendTopic, Long> {

  List<BackendTopic> findByUserIdOrderByCreatedAtDesc(Long userId);
}

