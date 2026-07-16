package com.careeros.notes.repository;

import com.careeros.notes.entity.KnowledgeNote;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeNoteRepository extends JpaRepository<KnowledgeNote, Long> {

  List<KnowledgeNote> findByUserIdOrderByCreatedAtDesc(Long userId);

  long countByUserId(Long userId);

  java.util.Optional<KnowledgeNote> findByIdAndUserId(Long id, Long userId);

  List<KnowledgeNote> findByUserIdAndRevisionDateLessThanEqualOrderByRevisionDateAsc(Long userId, LocalDate revisionDate);
}
