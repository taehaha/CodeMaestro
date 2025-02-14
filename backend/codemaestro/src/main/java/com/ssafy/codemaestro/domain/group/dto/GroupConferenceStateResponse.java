package com.ssafy.codemaestro.domain.group.dto;

import lombok.*;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@ToString
public class GroupConferenceStateResponse {
    private Integer totalConfrences;
    private List<ConferenceParticipationDto> participations;
}
