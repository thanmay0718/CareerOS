package com.careeros.checkin.repository;

import com.careeros.checkin.entity.DailyCheckIn;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyCheckInRepository extends JpaRepository<DailyCheckIn, Long> {

  Optional<DailyCheckIn> findByUserIdAndCheckInDate(Long userId, LocalDate checkInDate);

  Optional<DailyCheckIn> findByIdAndUserId(Long id, Long userId);

  List<DailyCheckIn> findByUserIdOrderByCheckInDateDesc(Long userId);
}
