package com.careeros.notes.dto;

import com.careeros.notes.enums.NoteCategory;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NoteResponse(
    Long id,
    NoteCategory category,
    String title,
    String contentMarkdown,
    String tags,
    String folderName,
    boolean pinned,
    boolean favorite,
    int versionNumber,
    LocalDate revisionDate,
    boolean needsRevision,
    String imageUrls,
    String attachmentUrls,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {
}
