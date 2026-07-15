package com.careeros.notification.repository;

import com.careeros.notification.entity.CareerNotification;
import com.careeros.notification.enums.NotificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerNotificationRepository extends JpaRepository<CareerNotification, Long> {

  List<CareerNotification> findByUserIdOrderByCreatedAtDesc(Long userId);

  List<CareerNotification> findByUserIdAndNotificationStatusOrderByCreatedAtDesc(Long userId, NotificationStatus status);

  Optional<CareerNotification> findByUserIdAndNotificationKey(Long userId, String notificationKey);
}
