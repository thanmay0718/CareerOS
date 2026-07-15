package com.careeros;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class CareerOsApplication {

  public static void main(String[] args) {
    SpringApplication.run(CareerOsApplication.class, args);
  }
}
