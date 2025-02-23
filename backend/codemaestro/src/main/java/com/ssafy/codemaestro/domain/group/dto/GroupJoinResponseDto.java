package com.ssafy.codemaestro.domain.group.dto;

import com.ssafy.codemaestro.global.entity.GroupJoinRequest;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
public class GroupJoinResponseDto {
    private Long requestId;
    private Long userId;
    private String userNickname;
    private Long groupId;
    private String groupName;
    private String message;
    private LocalDateTime createdAt;

    public static GroupJoinResponseDto from(GroupJoinRequest request) {
        return GroupJoinResponseDto.builder()
                .requestId(request.getId())
                .userId(request.getUser().getId())
                .userNickname(request.getUser().getNickname())
                .groupId(request.getGroup().getId())
                .groupName(request.getGroup().getName())
                .message(request.getMessage())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
