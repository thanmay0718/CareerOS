package com.careeros.notes.entity;

import com.careeros.common.entity.BaseEntity;
import com.careeros.notes.enums.NoteCategory;
import com.careeros.user.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "knowledge_notes")
public class KnowledgeNote extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private NoteCategory category;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String contentMarkdown;

  @Column(columnDefinition = "TEXT")
  private String tags;

  @Column(length = 160)
  private String folderName;

  private boolean pinned;

  private boolean favorite;

  private int versionNumber = 1;

  private boolean autosaveEnabled = true;

  private boolean syntaxHighlightingEnabled = true;

  protected KnowledgeNote() {
  }
}
