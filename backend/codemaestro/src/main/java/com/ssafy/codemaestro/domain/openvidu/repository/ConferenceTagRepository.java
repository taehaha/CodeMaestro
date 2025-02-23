package com.ssafy.codemaestro.domain.openvidu.repository;

import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.ConferenceTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConferenceTagRepository extends JpaRepository<ConferenceTag, Long> {
    void deleteByConference(Conference conference);
}
