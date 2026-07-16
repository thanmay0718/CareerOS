package com.careeros.notes.dto;

import com.careeros.notes.enums.NoteCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record NoteRequest(
    NoteCategory category,
    @NotBlank @Size(max = 180) String title,
    @Size(max = 100000) String contentMarkdown,
    @Size(max = 1000) String tags,
    @Size(max = 160) String folderName,
    Boolean pinned,
    Boolean favorite,
    LocalDate revisionDate,
    @Size(max = 4000) String imageUrls,
    @Size(max = 4000) String attachmentUrls) {
}
