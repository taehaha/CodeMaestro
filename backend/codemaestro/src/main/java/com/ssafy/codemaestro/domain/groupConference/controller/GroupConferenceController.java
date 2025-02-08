package com.ssafy.codemaestro.domain.groupConference.controller;

import com.ssafy.codemaestro.domain.groupConference.dto.GroupRankingResponseDto;
import com.ssafy.codemaestro.domain.groupConference.service.GroupConferenceService;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/groups/conference")
@RequiredArgsConstructor
public class GroupConferenceController {

    private final GroupConferenceService groupConferenceService;

    // 그룹 랭킹 조회
    @GetMapping("/rankings")
    public ResponseEntity<List<GroupRankingResponseDto>> getGroupRankings(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        // 만약 param 안넘어오면 자동으로 오늘시간 설정해서 주기
        if(year == null || month == null) {
            LocalDateTime now = LocalDateTime.now();
            year = now.getYear();
            month = now.getMonthValue();
        }

        List<GroupRankingResponseDto> rankings = groupConferenceService.getGroupByTotalScore(year, month);

        if (rankings == null || rankings.isEmpty()) {
            throw new BadRequestException("No group rankings found for the specified year and month.");
        }

        return ResponseEntity.ok(rankings);
    }
}