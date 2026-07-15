package com.careeros.auth.controller;

import com.careeros.auth.dto.AuthResponse;
import com.careeros.auth.dto.LoginRequest;
import com.careeros.auth.dto.RegisterRequest;
import com.careeros.auth.service.AuthService;
import com.careeros.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthResponse>> register(
      @Valid @RequestBody RegisterRequest request,
      HttpServletRequest servletRequest) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(
            "User registered successfully",
            authService.register(request),
            servletRequest.getRequestURI()));
  }

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletRequest servletRequest) {
    return ApiResponse.success(
        "Login successful",
        authService.login(request),
        servletRequest.getRequestURI());
  }
}
