package com.careeros.notification.service;

import com.careeros.notification.dto.NotificationResponse;
import com.careeros.user.entity.UserAccount;
import java.util.List;

public interface NotificationService {
  List<NotificationResponse> getNotifications(UserAccount userAccount);
}
