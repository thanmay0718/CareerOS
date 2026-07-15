package com.careeros.resume.repository;

import com.careeros.resume.entity.ResumeDocument;
import com.careeros.resume.enums.ResumeStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeDocumentRepository extends JpaRepository<ResumeDocument, Long> {
  List<ResumeDocument> findByUserIdOrderByCreatedDateDescCreatedAtDesc(Long userId);
  Optional<ResumeDocument> findByIdAndUserId(Long id, Long userId);
  List<ResumeDocument> findByUserIdAndResumeStatus(Long userId, ResumeStatus resumeStatus);
}
