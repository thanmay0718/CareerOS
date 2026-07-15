package com.careeros.auth.service;

import com.careeros.auth.dto.AuthResponse;
import com.careeros.auth.dto.LoginRequest;
import com.careeros.auth.dto.RegisterRequest;

public interface AuthService {

  AuthResponse register(RegisterRequest request);

  AuthResponse login(LoginRequest request);
}
