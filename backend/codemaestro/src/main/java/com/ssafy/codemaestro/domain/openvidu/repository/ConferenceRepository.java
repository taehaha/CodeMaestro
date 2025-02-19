package com.ssafy.codemaestro.domain.openvidu.repository;

import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.Group;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, Long> {
    boolean existsByIdAndModerator(Long id, User moderator);

    Optional<Conference> findByModerator(User moderator);

    Optional<Conference> findByGroup(Group group);

    long countConferenceById(Long id);
}
