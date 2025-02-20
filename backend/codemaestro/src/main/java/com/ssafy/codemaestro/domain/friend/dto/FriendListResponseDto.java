package com.ssafy.codemaestro.domain.friend.dto;

import lombok.*;

@Getter
@Setter
public class FriendListResponseDto {
    private Long friendId; // 친구 ID(user PK)
    private String nickname; // 친구 닉네임
    private String profileImageUrl; // 친구 프로필 이미지
    private Long requestId; // 친구 요청 목록 ID(friendRequest PK) - 친구 삭제 시 필요

    public FriendListResponseDto(Long friendId, String nickname, String profileImageUrl, Long requestId) {
        this.friendId = friendId;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.requestId = requestId;
    }
}
