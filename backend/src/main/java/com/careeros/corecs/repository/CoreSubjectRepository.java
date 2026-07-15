package com.careeros.corecs.repository;

import com.careeros.corecs.entity.CoreSubject;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoreSubjectRepository extends JpaRepository<CoreSubject, Long> {

  List<CoreSubject> findByUserIdOrderByCreatedAtDesc(Long userId);
}

