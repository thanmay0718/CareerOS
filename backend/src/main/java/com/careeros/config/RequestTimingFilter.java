package com.careeros.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestTimingFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(RequestTimingFilter.class);

  private final long thresholdMs;

  public RequestTimingFilter(@Value("${app.performance.request-threshold-ms:100}") long thresholdMs) {
    this.thresholdMs = thresholdMs;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    long startNanos = System.nanoTime();
    try {
      filterChain.doFilter(request, response);
    } finally {
      long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
      if (durationMs >= thresholdMs) {
        log.info(
            "perf stage=request method={} path={} status={} durationMs={}",
            request.getMethod(),
            request.getRequestURI(),
            response.getStatus(),
            durationMs);
      } else if (log.isDebugEnabled()) {
        log.debug(
            "perf stage=request method={} path={} status={} durationMs={}",
            request.getMethod(),
            request.getRequestURI(),
            response.getStatus(),
            durationMs);
      }
    }
  }
}
