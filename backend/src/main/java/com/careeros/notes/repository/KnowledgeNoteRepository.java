package com.careeros.notes.repository;

import com.careeros.notes.entity.KnowledgeNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeNoteRepository extends JpaRepository<KnowledgeNote, Long> {

  List<KnowledgeNote> findByUserIdOrderByCreatedAtDesc(Long userId);
}

