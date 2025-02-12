package com.ssafy.codemaestro.domain.group.repository;

import com.ssafy.codemaestro.domain.group.dto.GroupRankingResponseDto;
import com.ssafy.codemaestro.global.entity.Group;
import com.ssafy.codemaestro.global.entity.GroupConferenceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupConferenceHistoryRepository extends JpaRepository<GroupConferenceHistory, Long> {

    // : 파라미터바인딩
    @Query("""
        SELECT new com.ssafy.codemaestro.domain.group.dto.GroupRankingResponseDto(
            g.id,
            g.name,
            CAST(SUM(SIZE(gch.memberHistories) * 100.0 / g.currentMembers) as double),
            g.currentMembers,
            CAST(AVG(SIZE(gch.memberHistories)) as int)
        )
        FROM GroupConferenceHistory gch
        JOIN gch.group g
        WHERE gch.startTime >= :startDate 
        AND gch.startTime < :endDate
        GROUP BY g.id
        HAVING g.currentMembers > 0
        ORDER BY SUM(SIZE(gch.memberHistories) * 100.0 / g.currentMembers) DESC
        """)
    List<GroupRankingResponseDto> findTopGroupsByTotalScore(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable // JPA에서는 Limit 쿼리를 못써서 10개 추출을 위해 필요함
    );


    Optional<GroupConferenceHistory> findByGroupAndEndTimeIsNull(Group group);
}