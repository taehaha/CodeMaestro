package com.ssafy.codemaestro.domain.openvidu.repository;


import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.entity.UserConference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserConferenceRepository extends JpaRepository<UserConference, Long> {
    Optional<UserConference> findByUser(User user);

    void deleteByUserId(Long userId);
    void deleteByConferenceId(Long conferenceId);
    void deleteByConnectionId(String connectionId);

    List<UserConference> findByConference_Id(Long conferenceId);

    Optional<UserConference> findByConnectionId(String connectionId);
}
