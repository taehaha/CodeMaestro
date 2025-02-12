package com.ssafy.codemaestro.domain.studyRecord.service;

import com.ssafy.codemaestro.domain.group.repository.GroupConferenceMemberHistoryRepository;
import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordRequestDto;
import com.ssafy.codemaestro.domain.studyRecord.dto.StudyRecordResponseDto;
import com.ssafy.codemaestro.domain.studyRecord.repository.StudyRecordRepository;
import com.ssafy.codemaestro.global.entity.GroupConferenceMemberHistory;
import com.ssafy.codemaestro.global.entity.StudyRecord;
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
    public StudyRecordResponseDto createStudyRecord(Long historyId, StudyRecordRequestDto requestDto) {
        GroupConferenceMemberHistory memberHistory = memberHistoryRepository.findById(historyId)
                .orElseThrow(() -> new EntityNotFoundException("Conference member history not found"));

        StudyRecord record = StudyRecord.builder()
                .conferenceMemberHistory(memberHistory)
                .studyContent(requestDto.getStudyContent())
                .build();

        StudyRecord savedRecord = studyRecordRepository.save(record);
        return StudyRecordResponseDto.from(savedRecord);
    }

    public StudyRecordResponseDto getStudyRecord(Long historyId) {
        StudyRecord studyRecord = studyRecordRepository.findByConferenceMemberHistory_Id(historyId)
                .orElseThrow(() -> new EntityNotFoundException("Study record not found"));

        return StudyRecordResponseDto.from(studyRecord);
    }
}
