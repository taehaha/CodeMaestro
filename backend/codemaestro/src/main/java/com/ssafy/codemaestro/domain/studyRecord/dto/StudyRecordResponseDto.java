package com.ssafy.codemaestro.domain.studyRecord.dto;

import com.ssafy.codemaestro.global.entity.StudyRecord;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class StudyRecordResponseDto {
    private Long id;
    private String studyContent;
    private LocalDateTime createdAt;

    public static StudyRecordResponseDto from(StudyRecord studyRecord) {
        return StudyRecordResponseDto.builder()
                .id(studyRecord.getId())
                .studyContent(studyRecord.getStudyContent())
                .createdAt(studyRecord.getCreatedAt())
                .build();
    }
}
