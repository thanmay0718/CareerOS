package com.careeros.notes.dto;

import com.careeros.notes.enums.NoteCategory;
import java.time.LocalDateTime;

public record NoteCategorySummaryResponse(
    NoteCategory category,
    long notes,
    LocalDateTime lastEdited,
    boolean needsRevision) {
}
