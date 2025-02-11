package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConferenceInitRequest {
    String title;
    String description;
    String accessCode;
    //TODO: 그룹회의 구분을 위한 GroupID 작성
}
