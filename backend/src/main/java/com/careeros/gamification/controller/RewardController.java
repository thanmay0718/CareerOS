package com.careeros.gamification.controller;

import com.careeros.common.dto.ApiResponse;
import com.careeros.gamification.dto.RewardProfileResponse;
import com.careeros.gamification.service.RewardService;
import com.careeros.user.entity.UserAccount;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

  private final RewardService rewardService;

  public RewardController(RewardService rewardService) {
    this.rewardService = rewardService;
  }

  @GetMapping("/profile")
  public ApiResponse<RewardProfileResponse> profile(@AuthenticationPrincipal UserAccount userAccount) {
    return ApiResponse.success("Reward profile loaded", rewardService.refresh(userAccount));
  }
}
