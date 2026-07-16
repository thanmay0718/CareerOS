package com.careeros.notes.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.notes.dto.NoteCategorySummaryResponse;
import com.careeros.notes.dto.NoteRequest;
import com.careeros.notes.dto.NoteResponse;
import com.careeros.notes.dto.RevisionScheduleRequest;
import com.careeros.notes.entity.KnowledgeNote;
import com.careeros.notes.enums.NoteCategory;
import com.careeros.notes.repository.KnowledgeNoteRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
public class KnowledgeNoteController {

  private final KnowledgeNoteRepository knowledgeNoteRepository;

  public KnowledgeNoteController(KnowledgeNoteRepository knowledgeNoteRepository) {
    this.knowledgeNoteRepository = knowledgeNoteRepository;
  }

  @GetMapping
  public ApiResponse<List<NoteResponse>> list(
      @AuthenticationPrincipal UserAccount userAccount,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) NoteCategory category,
      @RequestParam(required = false) Boolean favorite,
      @RequestParam(required = false) Boolean pinned) {
    LocalDate today = LocalDate.now();
    return ApiResponse.success(
        "Notes loaded",
        knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId()).stream()
            .filter(note -> category == null || note.getCategory() == category)
            .filter(note -> favorite == null || note.isFavorite() == favorite)
            .filter(note -> pinned == null || note.isPinned() == pinned)
            .filter(note -> search == null || matchesSearch(note, search))
            .sorted(Comparator.comparing(KnowledgeNote::isPinned).reversed()
                .thenComparing(KnowledgeNote::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(note -> toResponse(note, today))
            .toList());
  }

  @GetMapping("/categories")
  public ApiResponse<List<NoteCategorySummaryResponse>> categories(@AuthenticationPrincipal UserAccount userAccount) {
    LocalDate today = LocalDate.now();
    List<KnowledgeNote> notes = knowledgeNoteRepository.findByUserIdOrderByCreatedAtDesc(userAccount.getId());
    return ApiResponse.success(
        "Note categories loaded",
        Arrays.stream(NoteCategory.values())
            .map(category -> {
              List<KnowledgeNote> categoryNotes = notes.stream().filter(note -> note.getCategory() == category).toList();
              return new NoteCategorySummaryResponse(
                  category,
                  categoryNotes.size(),
                  categoryNotes.stream()
                      .map(KnowledgeNote::getUpdatedAt)
                      .filter(value -> value != null)
                      .max(Comparator.naturalOrder())
                      .orElse(null),
                  categoryNotes.stream().anyMatch(note -> note.getRevisionDate() != null && !note.getRevisionDate().isAfter(today)));
            })
            .filter(summary -> summary.notes() > 0)
            .toList());
  }

  @GetMapping("/revisions")
  public ApiResponse<List<NoteResponse>> revisions(@AuthenticationPrincipal UserAccount userAccount) {
    LocalDate today = LocalDate.now();
    return ApiResponse.success(
        "Revision notes loaded",
        knowledgeNoteRepository.findByUserIdAndRevisionDateLessThanEqualOrderByRevisionDateAsc(userAccount.getId(), today)
            .stream()
            .map(note -> toResponse(note, today))
            .toList());
  }

  @GetMapping("/{noteId}")
  public ApiResponse<NoteResponse> detail(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long noteId) {
    KnowledgeNote note = knowledgeNoteRepository.findByIdAndUserId(noteId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    return ApiResponse.success("Note loaded", toResponse(note, LocalDate.now()));
  }

  @PostMapping
  public ApiResponse<NoteResponse> create(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody NoteRequest request) {
    KnowledgeNote note = new KnowledgeNote(
        userAccount,
        request.category() == null ? NoteCategory.GENERAL_NOTES : request.category(),
        request.title(),
        request.contentMarkdown(),
        request.tags(),
        request.folderName(),
        request.revisionDate());
    note.setPinned(Boolean.TRUE.equals(request.pinned()));
    note.setFavorite(Boolean.TRUE.equals(request.favorite()));
    note.setImageUrls(request.imageUrls());
    note.setAttachmentUrls(request.attachmentUrls());
    return ApiResponse.success("Note created", toResponse(knowledgeNoteRepository.save(note), LocalDate.now()));
  }

  @PatchMapping("/{noteId}/revision")
  public ApiResponse<NoteResponse> scheduleRevision(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long noteId,
      @Valid @RequestBody RevisionScheduleRequest request) {
    KnowledgeNote note = knowledgeNoteRepository.findByIdAndUserId(noteId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    note.scheduleRevision(LocalDate.now().plusDays(request.daysFromToday()));
    return ApiResponse.success("Revision scheduled", toResponse(knowledgeNoteRepository.save(note), LocalDate.now()));
  }

  @PutMapping("/{noteId}")
  public ApiResponse<NoteResponse> update(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long noteId,
      @Valid @RequestBody NoteRequest request) {
    KnowledgeNote note = knowledgeNoteRepository.findByIdAndUserId(noteId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    note.update(
        request.category(),
        request.title(),
        request.contentMarkdown(),
        request.tags(),
        request.folderName(),
        Boolean.TRUE.equals(request.pinned()),
        Boolean.TRUE.equals(request.favorite()),
        request.revisionDate(),
        request.imageUrls(),
        request.attachmentUrls());
    return ApiResponse.success("Note updated", toResponse(knowledgeNoteRepository.save(note), LocalDate.now()));
  }

  @DeleteMapping("/{noteId}")
  public ApiResponse<Void> delete(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long noteId) {
    KnowledgeNote note = knowledgeNoteRepository.findByIdAndUserId(noteId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    knowledgeNoteRepository.delete(note);
    return ApiResponse.success("Note deleted", null);
  }

  private boolean matchesSearch(KnowledgeNote note, String search) {
    String needle = search.toLowerCase(Locale.ROOT);
    return java.util.stream.Stream.of(note.getTitle(), note.getContentMarkdown(), note.getTags(), note.getFolderName())
        .filter(value -> value != null)
        .map(value -> value.toLowerCase(Locale.ROOT))
        .anyMatch(value -> value.contains(needle));
  }

  private NoteResponse toResponse(KnowledgeNote note, LocalDate today) {
    return new NoteResponse(
        note.getId(),
        note.getCategory(),
        note.getTitle(),
        note.getContentMarkdown(),
        note.getTags(),
        note.getFolderName(),
        note.isPinned(),
        note.isFavorite(),
        note.getVersionNumber(),
        note.getRevisionDate(),
        note.getRevisionDate() != null && !note.getRevisionDate().isAfter(today),
        note.getImageUrls(),
        note.getAttachmentUrls(),
        note.getCreatedAt(),
        note.getUpdatedAt());
  }
}
