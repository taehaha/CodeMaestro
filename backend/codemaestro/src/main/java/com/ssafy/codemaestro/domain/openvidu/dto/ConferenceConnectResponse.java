package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ConferenceConnectResponse {
    String connectionToken;
    String screenShareConnectionToken;
    boolean isModerator;
}
