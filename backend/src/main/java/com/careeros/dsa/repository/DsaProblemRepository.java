package com.careeros.dsa.repository;

import com.careeros.dsa.entity.DsaProblem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DsaProblemRepository extends JpaRepository<DsaProblem, Long> {

  List<DsaProblem> findByUserIdOrderByCreatedAtDesc(Long userId);
}

