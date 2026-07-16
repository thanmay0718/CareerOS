package com.careeros.focus.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.focus.dto.FocusSessionRequest;
import com.careeros.focus.dto.FocusSessionResponse;
import com.careeros.focus.entity.FocusSession;
import com.careeros.focus.repository.FocusSessionRepository;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/focus-sessions")
public class FocusSessionController {

  private final FocusSessionRepository focusSessionRepository;

  public FocusSessionController(FocusSessionRepository focusSessionRepository) {
    this.focusSessionRepository = focusSessionRepository;
  }

  @GetMapping
  public ApiResponse<List<FocusSessionResponse>> list(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success(
        "Focus sessions loaded",
        focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userAccount.getId()).stream()
            .map(this::toResponse)
            .toList());
  }

  @PostMapping
  public ApiResponse<FocusSessionResponse> create(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody FocusSessionRequest request) {
    FocusSession saved = focusSessionRepository.save(new FocusSession(
        userAccount,
        request.durationMinutes(),
        request.sessionType() == null ? "POMODORO" : request.sessionType(),
        LocalDateTime.now()));
    return ApiResponse.success("Focus session logged", toResponse(saved));
  }

  private FocusSessionResponse toResponse(FocusSession session) {
    return new FocusSessionResponse(session.getId(), session.getDurationMinutes(), session.getSessionType(), session.getCompletedAt());
  }
}
