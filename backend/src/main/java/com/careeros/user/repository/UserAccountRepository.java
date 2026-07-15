package com.careeros.user.repository;

import com.careeros.user.entity.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

  boolean existsByEmail(String email);

  Optional<UserAccount> findByEmail(String email);
}
