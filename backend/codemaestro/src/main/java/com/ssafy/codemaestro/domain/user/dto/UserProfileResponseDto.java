package com.ssafy.codemaestro.domain.user.dto;

import com.ssafy.codemaestro.global.entity.User;
import lombok.*;

@Getter
@Builder
public class UserProfileResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private String profileBackgroundImageUrl;
    private String loginId;
    private String description;
    private String loginProvider;

    public static UserProfileResponseDto from(User user) {
        return UserProfileResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .profileBackgroundImageUrl(user.getProfileBackgroundImageUrl())
                .loginId(user.getLoginId())
                .description(user.getDescription())
                .loginProvider(user.getLoginProvider().toString())
                .build();
    }
}
