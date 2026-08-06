package com.careeros.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.Claims;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  private final JwtService jwtService;
  private final CustomUserDetailsService userDetailsService;
  private final long authThresholdMs;

  public JwtAuthenticationFilter(
      JwtService jwtService,
      CustomUserDetailsService userDetailsService,
      @Value("${app.performance.auth-threshold-ms:25}") long authThresholdMs) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
    this.authThresholdMs = authThresholdMs;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    long startNanos = System.nanoTime();
    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(7);
    Claims claims = jwtService.extractClaims(token);
    String username = claims.getSubject();

    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      UserDetails userDetails = userDetailsService.loadUserByUsername(username);
      if (jwtService.isValid(claims, userDetails)) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    }

    long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
    if (durationMs >= authThresholdMs) {
      log.info("perf stage=auth path={} durationMs={}", request.getRequestURI(), durationMs);
    } else if (log.isDebugEnabled()) {
      log.debug("perf stage=auth path={} durationMs={}", request.getRequestURI(), durationMs);
    }

    filterChain.doFilter(request, response);
  }
}
