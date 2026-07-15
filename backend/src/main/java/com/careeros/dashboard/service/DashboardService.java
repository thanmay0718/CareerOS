package com.careeros.dashboard.service;

import com.careeros.dashboard.dto.DashboardResponse;
import com.careeros.user.entity.UserAccount;

public interface DashboardService {

  DashboardResponse getDashboard(UserAccount userAccount);
}
