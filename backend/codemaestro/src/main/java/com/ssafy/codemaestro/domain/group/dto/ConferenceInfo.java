package com.ssafy.codemaestro.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ConferenceInfo {
    private Long conferenceId;
    private String title;
    private LocalDateTime startTime;
}
