package com.ssafy.codemaestro.domain.openvidu.repository;

import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, Long> {
    boolean existsByIdAndModerator(Long id, User moderator);

    Conference findByModerator(User moderator);
}
