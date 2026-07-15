package com.careeros.interview.repository;

import com.careeros.interview.entity.InterviewExperience;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Long> {

  List<InterviewExperience> findByUserIdOrderByCreatedAtDesc(Long userId);
}

