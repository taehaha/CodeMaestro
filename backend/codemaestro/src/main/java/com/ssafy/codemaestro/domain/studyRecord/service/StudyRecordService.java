package com.ssafy.codemaestro.domain.studyRecord.service;

import com.ssafy.codemaestro.domain.group.repository.GroupConferenceMemberHistoryRepository;
import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordRequestDto;
import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordResponseDto;
import com.ssafy.codemaestro.domain.studyRecord.repository.StudyRecordRepository;
import com.ssafy.codemaestro.global.entity.GroupConferenceMemberHistory;
import com.ssafy.codemaestro.global.entity.StudyRecord;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.UnauthorizedException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRecordService {
    private final StudyRecordRepository studyRecordRepository;
    private final GroupConferenceMemberHistoryRepository memberHistoryRepository;

    @Transactional
    public StudyRecordResponseDto createStudyRecord(Long historyId, StudyRecordRequestDto requestDto, Long userId) {
        GroupConferenceMemberHistory memberHistory = memberHistoryRepository.findById(historyId)
                .orElseThrow(() -> new BadRequestException("Conference member history not found"));

        if(!memberHistory.getParticipant().getId().equals(userId)) { // 히스토리에 본인 외 다른 사용자 접근 시
            throw new UnauthorizedException("접근되지 않은 사용자입니다.");
        }

        StudyRecord record = StudyRecord.builder()
                .conferenceMemberHistory(memberHistory)
                .studyContent(requestDto.getStudyContent())
                .build();

        StudyRecord savedRecord = studyRecordRepository.save(record);
        return StudyRecordResponseDto.from(savedRecord);
    }

    public StudyRecordResponseDto getStudyRecord(Long historyId) {
        StudyRecord studyRecord = studyRecordRepository.findByConferenceMemberHistory_Id(historyId)
                .orElseThrow(() -> new BadRequestException("Study record not found"));

        return StudyRecordResponseDto.from(studyRecord);
    }
}
