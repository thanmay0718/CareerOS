package com.careeros.company.repository;

import com.careeros.company.entity.CompanyProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
  List<CompanyProfile> findByUserIdOrderByCompanyNameAsc(Long userId);
  Optional<CompanyProfile> findByIdAndUserId(Long id, Long userId);
}
