package com.ssafy.codemaestro.domain.auth.repository;

import com.ssafy.codemaestro.global.entity.VerifyEmailEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerifyEmailRepository extends JpaRepository<VerifyEmailEntity, Long> {
    boolean existsByEmailAndPin(String email, String pin);
    VerifyEmailEntity findByEmailAndPin(String email, String pin);
}
