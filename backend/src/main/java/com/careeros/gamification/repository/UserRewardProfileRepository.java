package com.careeros.gamification.repository;

import com.careeros.gamification.entity.UserRewardProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRewardProfileRepository extends JpaRepository<UserRewardProfile, Long> {

  Optional<UserRewardProfile> findByUserId(Long userId);
}
