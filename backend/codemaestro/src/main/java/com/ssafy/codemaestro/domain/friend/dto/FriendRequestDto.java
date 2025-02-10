package com.ssafy.codemaestro.domain.friend.dto;

import com.ssafy.codemaestro.global.entity.FriendRequest;
import com.ssafy.codemaestro.global.entity.FriendRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
public class FriendRequestDto {
    private Long requestId; // PK
    private Long senderId;
    private Long receiverId;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;

    public static FriendRequestDto from(FriendRequest request) {
        return FriendRequestDto.builder()
                .requestId(request.getId())
                .senderId(request.getSenderId())
                .receiverId(request.getReceiverId())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
