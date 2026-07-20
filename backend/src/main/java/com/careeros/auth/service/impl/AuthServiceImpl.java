package com.careeros.auth.service.impl;

import com.careeros.auth.dto.AuthResponse;
import com.careeros.auth.dto.LoginRequest;
import com.careeros.auth.dto.RegisterRequest;
import com.careeros.auth.service.AuthService;
import com.careeros.common.exception.DuplicateResourceException;
import com.careeros.common.exception.ResourceNotFoundException;
import com.careeros.gamification.entity.UserRewardProfile;
import com.careeros.gamification.repository.UserRewardProfileRepository;
import com.careeros.security.JwtService;
import com.careeros.user.entity.Role;
import com.careeros.user.entity.UserAccount;
import com.careeros.user.enums.RoleName;
import com.careeros.user.repository.RoleRepository;
import com.careeros.user.repository.UserAccountRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

  private final UserAccountRepository userAccountRepository;
  private final RoleRepository roleRepository;
  private final UserRewardProfileRepository rewardProfileRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthServiceImpl(
      UserAccountRepository userAccountRepository,
      RoleRepository roleRepository,
      UserRewardProfileRepository rewardProfileRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.userAccountRepository = userAccountRepository;
    this.roleRepository = roleRepository;
    this.rewardProfileRepository = rewardProfileRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Override
  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userAccountRepository.existsByEmail(request.email())) {
      throw new DuplicateResourceException("Email is already registered");
    }

    Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
        .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

    UserAccount userAccount = new UserAccount(
        request.fullName(),
        request.email().toLowerCase(),
        passwordEncoder.encode(request.password()),
        Set.of(userRole));

    UserAccount savedUser = userAccountRepository.save(userAccount);
    return authResponse(savedUser);
  }

  @Override
  @Transactional
  public AuthResponse login(LoginRequest request) {
    UserAccount userAccount = userAccountRepository.findByEmail(request.email().toLowerCase())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), userAccount.getPassword())) {
      throw new BadCredentialsException("Invalid email or password");
    }

    UserRewardProfile rewardProfile = rewardProfileRepository.findByUserId(userAccount.getId())
        .orElseGet(() -> new UserRewardProfile(userAccount));
    boolean dailyLoginCoinAwarded = rewardProfile.awardDailyLoginCoin(LocalDate.now(ZoneId.systemDefault()));
    rewardProfileRepository.save(rewardProfile);

    return authResponse(userAccount, dailyLoginCoinAwarded);
  }

  private AuthResponse authResponse(UserAccount userAccount) {
    return authResponse(userAccount, false);
  }

  private AuthResponse authResponse(UserAccount userAccount, boolean dailyLoginCoinAwarded) {
    String token = jwtService.generateToken(userAccount);
    return new AuthResponse(
        userAccount.getId(),
        userAccount.getFullName(),
        userAccount.getEmail(),
        token,
        "Bearer",
        jwtService.expirationMs(),
        dailyLoginCoinAwarded,
        dailyLoginCoinAwarded ? 1 : 0);
  }
}
