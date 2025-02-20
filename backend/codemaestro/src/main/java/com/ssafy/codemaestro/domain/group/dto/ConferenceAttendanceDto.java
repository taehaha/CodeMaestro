package com.ssafy.codemaestro.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ConferenceAttendanceDto {
    private Long userId;
    private String userNickname;
    private List<Boolean> attendanceStatus; // [true, false, false, true, true]
    private double attendanceRate; // 60
}
