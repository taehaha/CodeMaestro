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
@RequestMapping("/study-records")
@RequiredArgsConstructor
public class StudyRecordController {

    private final StudyRecordService studyRecordService;

    // 조회
    @GetMapping("/{historyId}")
    public ResponseEntity<StudyRecordResponseDto> getStudyRecord(@PathVariable Long historyId) {
        StudyRecordResponseDto record = studyRecordService.getStudyRecord(historyId);
        return ResponseEntity.ok(record);
    }

    // 생성
    @PostMapping("/{historyId}")
    public ResponseEntity<StudyRecordResponseDto> createStudyRecord(
            @PathVariable Long historyId,
            @RequestBody StudyRecordRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        StudyRecordResponseDto responseDto = studyRecordService.createStudyRecord(historyId, requestDto, Long.parseLong(userDetails.getUsername()));
        return ResponseEntity.ok(responseDto);
    }

    // 수정
    @PutMapping("/{recordId}")
    public ResponseEntity<StudyRecordResponseDto> updateStudyRecord(@PathVariable Long recordId, @RequestBody StudyRecordRequestDto requestDto) {
        return ResponseEntity.ok(studyRecordService.updateStudyRecord(recordId, requestDto));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteStudyRecord(@PathVariable Long recordId) {
        studyRecordService.deleteStudyRecord(recordId);
        return ResponseEntity.noContent().build();
    }
}
