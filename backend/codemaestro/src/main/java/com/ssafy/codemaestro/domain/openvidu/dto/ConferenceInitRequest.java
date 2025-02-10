package com.ssafy.codemaestro.domain.openvidu.dto;

import com.ssafy.codemaestro.global.entity.ProgrammingLanguage;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConferenceInitRequest {
    String title;
    String description;
    String accessCode;
}
