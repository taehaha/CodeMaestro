package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.global.entity.GroupConferenceMemberHistory;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@ToString
public class ConferenceParticipationDto {
    private Long id;
    private Long groupConferenceHistoryId;
    private String conferenceTitle;
    private Long userId;
    private LocalDateTime joinTime;
    private LocalDateTime leaveTime;
    private int duration;
    private LocalDateTime createdAt;

    public static ConferenceParticipationDto from(GroupConferenceMemberHistory history) {
        return ConferenceParticipationDto.builder()
                .id(history.getId())
                .groupConferenceHistoryId(history.getGroupConferenceHistory().getId())
                .conferenceTitle(history.getGroupConferenceHistory().getTitle())
                .userId(history.getParticipant().getId())
                .joinTime(history.getJoinTime())
                .leaveTime(history.getLeaveTime())
                .duration(history.getDuration())
                .build();
    }
}
