package com.careeros.checkin.controller;

import com.careeros.checkin.dto.DailyCheckInRequest;
import com.careeros.checkin.dto.DailyCheckInResponse;
import com.careeros.checkin.entity.DailyCheckIn;
import com.careeros.checkin.repository.DailyCheckInRepository;
import com.careeros.common.dto.ApiResponse;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.user.entity.UserAccount;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/check-ins", "/api/checkins"})
public class DailyCheckInController {

  private final DailyCheckInRepository dailyCheckInRepository;

  public DailyCheckInController(DailyCheckInRepository dailyCheckInRepository) {
    this.dailyCheckInRepository = dailyCheckInRepository;
  }

  @GetMapping
  public ApiResponse<List<DailyCheckInResponse>> list(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success(
        "Check-ins loaded",
        dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId()).stream()
            .map(this::toResponse)
            .toList());
  }

  @GetMapping("/today")
  public ApiResponse<DailyCheckInResponse> getToday(@AuthenticationPrincipal UserAccount userAccount) {
    DailyCheckIn checkIn = dailyCheckInRepository.findByUserIdAndCheckInDate(userAccount.getId(), LocalDate.now())
        .orElse(null);
    return ApiResponse.success("Today's check-in loaded", checkIn == null ? null : toResponse(checkIn));
  }

  @PostMapping
  public ApiResponse<DailyCheckInResponse> createToday(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody DailyCheckInRequest request) {
    return saveToday(userAccount, request);
  }

  @PutMapping("/today")
  public ApiResponse<DailyCheckInResponse> upsertToday(
      @AuthenticationPrincipal UserAccount userAccount,
      @Valid @RequestBody DailyCheckInRequest request) {
    return saveToday(userAccount, request);
  }

  private ApiResponse<DailyCheckInResponse> saveToday(
      UserAccount userAccount,
      DailyCheckInRequest request) {
    LocalDate today = LocalDate.now();
    DailyCheckIn checkIn = dailyCheckInRepository.findByUserIdAndCheckInDate(userAccount.getId(), today)
        .orElseGet(() -> new DailyCheckIn(userAccount, today));

    checkIn.setStudyHours(request.studyHours());
    checkIn.setProblemsSolved(request.problemsSolved());
    checkIn.setMood(request.mood());
    checkIn.setEnergy(request.energy());
    checkIn.setConfidence(request.confidence());
    checkIn.setTodaysAchievement(request.todaysAchievement());
    checkIn.setTodaysBlocker(request.todaysBlocker());
    checkIn.setTomorrowGoal(request.tomorrowGoal());
    checkIn.setNotes(request.notes());

    return ApiResponse.success("Check-in saved", toResponse(dailyCheckInRepository.save(checkIn)));
  }

  @GetMapping("/recent")
  public ApiResponse<List<DailyCheckInResponse>> recent(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success(
        "Check-ins loaded",
        dailyCheckInRepository.findByUserIdOrderByCheckInDateDesc(userAccount.getId()).stream()
            .map(this::toResponse)
            .toList());
  }

  @PutMapping("/{checkInId}")
  public ApiResponse<DailyCheckInResponse> updateCheckIn(
      @AuthenticationPrincipal UserAccount userAccount,
      @PathVariable Long checkInId,
      @Valid @RequestBody DailyCheckInRequest request) {
    DailyCheckIn checkIn = dailyCheckInRepository.findByIdAndUserId(checkInId, userAccount.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Check-in not found"));

    checkIn.setStudyHours(request.studyHours());
    checkIn.setProblemsSolved(request.problemsSolved());
    checkIn.setMood(request.mood());
    checkIn.setEnergy(request.energy());
    checkIn.setConfidence(request.confidence());
    checkIn.setTodaysAchievement(request.todaysAchievement());
    checkIn.setTodaysBlocker(request.todaysBlocker());
    checkIn.setTomorrowGoal(request.tomorrowGoal());
    checkIn.setNotes(request.notes());

    return ApiResponse.success("Check-in updated", toResponse(dailyCheckInRepository.save(checkIn)));
  }

  private DailyCheckInResponse toResponse(DailyCheckIn checkIn) {
    return new DailyCheckInResponse(
        checkIn.getId(),
        checkIn.getCheckInDate(),
        checkIn.getStudyHours(),
        checkIn.getProblemsSolved(),
        checkIn.getMood(),
        checkIn.getEnergy(),
        checkIn.getConfidence(),
        checkIn.getTodaysAchievement(),
        checkIn.getTodaysBlocker(),
        checkIn.getTomorrowGoal(),
        checkIn.getNotes());
  }
}
