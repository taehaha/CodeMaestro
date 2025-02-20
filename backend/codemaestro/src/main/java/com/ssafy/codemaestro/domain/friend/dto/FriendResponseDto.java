package com.ssafy.codemaestro.domain.friend.dto;

import com.ssafy.codemaestro.global.entity.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FriendResponseDto {
    private Long requestId;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;

    public static FriendResponseDto from(FriendRequest request, User sender, User receiver) {
        return FriendResponseDto.builder()
                .requestId(request.getId())
                .senderId(request.getSender().getId())
                .senderName(sender.getNickname())
                .receiverId(request.getReceiver().getId())
                .receiverName(receiver.getNickname())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}