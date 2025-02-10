package com.ssafy.codemaestro.domain.openvidu.dto;

import com.ssafy.codemaestro.global.entity.ProgrammingLanguage;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ConferenceInfoResponse {
    String conferenceId;
    String title;
    String description;
    String thumbnailUrl;
    ProgrammingLanguage programmingLanguage;
    int participantNum;
    String hostNickName;
    LocalDateTime createdAt;
}
