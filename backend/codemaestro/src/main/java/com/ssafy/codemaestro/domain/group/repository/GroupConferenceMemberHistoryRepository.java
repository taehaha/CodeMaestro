package com.ssafy.codemaestro.domain.group.repository;

import com.ssafy.codemaestro.global.entity.GroupConferenceHistory;
import com.ssafy.codemaestro.global.entity.GroupConferenceMemberHistory;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupConferenceMemberHistoryRepository extends JpaRepository<GroupConferenceMemberHistory, Long> {

    Optional<GroupConferenceMemberHistory> findByGroupConferenceHistoryAndParticipantAndLeaveTimeIsNull(GroupConferenceHistory history, User participant);
}
