package com.ssafy.codemaestro.domain.groupConference.service;

import com.ssafy.codemaestro.domain.groupConference.dto.GroupRankingResponseDto;
import com.ssafy.codemaestro.domain.groupConference.repository.GroupConferenceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupConferenceService {

    private final GroupConferenceHistoryRepository groupConferenceHistoryRepository;

    // 그룹 랭킹 조회
    public List<GroupRankingResponseDto> getGroupByTotalScore(int year, int month) {
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1);

        return groupConferenceHistoryRepository.findTopGroupsByTotalScore(
                startDate,
                endDate,
                PageRequest.of(0, 10)
        );
    }
}
