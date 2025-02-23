package com.ssafy.codemaestro.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class GroupConferenceAttendanceResponse {
    private List<ConferenceInfo> recentConferences;
    private List<ConferenceAttendanceDto> memberAttendance;
}
