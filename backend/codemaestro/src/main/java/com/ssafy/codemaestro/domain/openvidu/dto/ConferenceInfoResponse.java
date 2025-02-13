package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ConferenceInfoResponse {
    String conferenceId;
    String title;
    String description;
    String thumbnailUrl;
    int participantNum;
    String hostNickName;
    List<String> tagNameList;
    LocalDateTime createdAt;
}
