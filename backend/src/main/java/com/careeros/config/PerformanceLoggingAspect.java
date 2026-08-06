package com.careeros.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceLoggingAspect {

  private static final Logger log = LoggerFactory.getLogger(PerformanceLoggingAspect.class);

  private final long controllerThresholdMs;
  private final long serviceThresholdMs;
  private final long repositoryThresholdMs;

  public PerformanceLoggingAspect(
      @Value("${app.performance.controller-threshold-ms:100}") long controllerThresholdMs,
      @Value("${app.performance.service-threshold-ms:100}") long serviceThresholdMs,
      @Value("${app.performance.repository-threshold-ms:50}") long repositoryThresholdMs) {
    this.controllerThresholdMs = controllerThresholdMs;
    this.serviceThresholdMs = serviceThresholdMs;
    this.repositoryThresholdMs = repositoryThresholdMs;
  }

  @Around("within(com.careeros..controller..*)")
  public Object timeController(ProceedingJoinPoint joinPoint) throws Throwable {
    return time(joinPoint, "controller", controllerThresholdMs);
  }

  @Around("within(com.careeros..service..*)")
  public Object timeService(ProceedingJoinPoint joinPoint) throws Throwable {
    return time(joinPoint, "service", serviceThresholdMs);
  }

  @Around("within(com.careeros..repository..*)")
  public Object timeRepository(ProceedingJoinPoint joinPoint) throws Throwable {
    return time(joinPoint, "repository", repositoryThresholdMs);
  }

  private Object time(ProceedingJoinPoint joinPoint, String stage, long thresholdMs) throws Throwable {
    long startNanos = System.nanoTime();
    try {
      return joinPoint.proceed();
    } finally {
      long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
      if (durationMs >= thresholdMs) {
        log.info("perf stage={} method={} durationMs={}", stage, joinPoint.getSignature().toShortString(), durationMs);
      } else if (log.isDebugEnabled()) {
        log.debug("perf stage={} method={} durationMs={}", stage, joinPoint.getSignature().toShortString(), durationMs);
      }
    }
  }
}
