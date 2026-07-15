package com.careeros.user.repository;

import com.careeros.user.entity.Role;
import com.careeros.user.enums.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

  Optional<Role> findByName(RoleName name);
}
