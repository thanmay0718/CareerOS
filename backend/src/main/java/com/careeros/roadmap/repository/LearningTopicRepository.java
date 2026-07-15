package com.careeros.roadmap.repository;

import com.careeros.roadmap.entity.LearningTopic;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningTopicRepository extends JpaRepository<LearningTopic, Long> {

  List<LearningTopic> findByUserIdOrderByCreatedAtDesc(Long userId);
}

