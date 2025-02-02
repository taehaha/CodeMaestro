package com.ssafy.codemaestro.domain.openvidu.repository;


import com.ssafy.codemaestro.global.entity.UserConference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserConferenceRepository extends JpaRepository<UserConference, Long> {
    void deleteByUserId(Long userId);
}
