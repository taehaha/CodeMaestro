package com.ssafy.codemaestro.domain.studyRecord.controller;

import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordRequestDto;
import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordResponseDto;
import com.ssafy.codemaestro.domain.studyRecord.service.StudyRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/study-records/{historyId}")
@RequiredArgsConstructor
public class StudyRecordController {

    private final StudyRecordService studyRecordService;

    @PostMapping
    public ResponseEntity<StudyRecordResponseDto> createStudyRecord(
            @PathVariable Long historyId,
            @RequestBody StudyRecordRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        StudyRecordResponseDto responseDto = studyRecordService.createStudyRecord(historyId, requestDto, Long.parseLong(userDetails.getUsername()));
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<StudyRecordResponseDto> getStudyRecord(@PathVariable Long historyId) {
        StudyRecordResponseDto record = studyRecordService.getStudyRecord(historyId);
        return ResponseEntity.ok(record);
    }
}
