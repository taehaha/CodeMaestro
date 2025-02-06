package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConferenceChangeModeratorRequest {
    Long newModeratorUserId;
}
