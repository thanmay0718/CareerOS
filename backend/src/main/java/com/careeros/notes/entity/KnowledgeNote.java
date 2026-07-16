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
import java.time.LocalDate;

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

  private LocalDate revisionDate;

  @Column(columnDefinition = "TEXT")
  private String imageUrls;

  @Column(columnDefinition = "TEXT")
  private String attachmentUrls;

  protected KnowledgeNote() {
  }

  public KnowledgeNote(
      UserAccount user,
      NoteCategory category,
      String title,
      String contentMarkdown,
      String tags,
      String folderName,
      LocalDate revisionDate) {
    this.user = user;
    this.category = category;
    this.title = title;
    this.contentMarkdown = contentMarkdown;
    this.tags = tags;
    this.folderName = folderName;
    this.revisionDate = revisionDate;
  }

  public Long getId() { return id; }
  public NoteCategory getCategory() { return category; }
  public String getTitle() { return title; }
  public String getContentMarkdown() { return contentMarkdown; }
  public String getTags() { return tags; }
  public String getFolderName() { return folderName; }
  public boolean isPinned() { return pinned; }
  public boolean isFavorite() { return favorite; }
  public int getVersionNumber() { return versionNumber; }
  public boolean isAutosaveEnabled() { return autosaveEnabled; }
  public boolean isSyntaxHighlightingEnabled() { return syntaxHighlightingEnabled; }
  public LocalDate getRevisionDate() { return revisionDate; }
  public String getImageUrls() { return imageUrls; }
  public String getAttachmentUrls() { return attachmentUrls; }

  public void update(
      NoteCategory category,
      String title,
      String contentMarkdown,
      String tags,
      String folderName,
      boolean pinned,
      boolean favorite,
      LocalDate revisionDate,
      String imageUrls,
      String attachmentUrls) {
    this.category = category == null ? NoteCategory.GENERAL_NOTES : category;
    this.title = title;
    this.contentMarkdown = contentMarkdown;
    this.tags = tags;
    this.folderName = folderName;
    this.pinned = pinned;
    this.favorite = favorite;
    this.revisionDate = revisionDate;
    this.imageUrls = imageUrls;
    this.attachmentUrls = attachmentUrls;
    this.versionNumber++;
  }

  public void scheduleRevision(LocalDate revisionDate) {
    this.revisionDate = revisionDate;
    this.versionNumber++;
  }

  public void setPinned(boolean pinned) {
    this.pinned = pinned;
  }

  public void setFavorite(boolean favorite) {
    this.favorite = favorite;
  }

  public void setImageUrls(String imageUrls) {
    this.imageUrls = imageUrls;
  }

  public void setAttachmentUrls(String attachmentUrls) {
    this.attachmentUrls = attachmentUrls;
  }
}
