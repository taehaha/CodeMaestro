package com.ssafy.codemaestro.domain.boj.repository;

import com.ssafy.codemaestro.domain.boj.entity.BojUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BojUserRepository extends JpaRepository<BojUser, Long> {
    Optional<BojUser> findByHandle(String handle);
}