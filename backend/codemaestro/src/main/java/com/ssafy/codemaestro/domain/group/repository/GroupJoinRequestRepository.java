package com.ssafy.codemaestro.domain.group.repository;

import com.ssafy.codemaestro.global.entity.Group;
import com.ssafy.codemaestro.global.entity.GroupJoinRequest;
import com.ssafy.codemaestro.global.entity.GroupRequestStatus;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {
    boolean existsByUserAndGroupAndStatus(User user, Group group, GroupRequestStatus status);

    List<GroupJoinRequest> findByGroupAndStatus(Group group, GroupRequestStatus status);

    @Query("SELECT gjr FROM GroupJoinRequest gjr " +
            "WHERE gjr.group.id = :groupId AND gjr.status = :status")
    List<GroupJoinRequest> findByGroupIdAndStatus(
            @Param("groupId") Long groupId,
            @Param("status") GroupRequestStatus status);

    boolean existsByUserIdAndGroupIdAndStatus(Long userId, Long groupId, GroupRequestStatus status);
}
