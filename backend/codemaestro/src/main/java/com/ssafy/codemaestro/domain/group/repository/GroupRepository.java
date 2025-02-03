package com.ssafy.codemaestro.domain.group.repository;

import com.ssafy.codemaestro.global.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findAllByOrderByCreatedAtDesc();

    @Query("SELECT g FROM Group g WHERE g.id IN " +
            "(SELECT gm.group.id FROM GroupMember gm WHERE gm.user.id = :userId)")
    List<Group> findGroupsByUserId(@Param("userId") Long userId);

    // 그룹 검색
    List<Group> findByNameContaining(String groupName);
}
