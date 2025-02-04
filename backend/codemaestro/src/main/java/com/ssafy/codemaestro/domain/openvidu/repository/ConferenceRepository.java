package com.ssafy.codemaestro.domain.openvidu.repository;

import com.ssafy.codemaestro.global.entity.Conference;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, Long> {
}
