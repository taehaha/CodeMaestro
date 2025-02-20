package com.ssafy.codemaestro.domain.user.dto;

import com.ssafy.codemaestro.global.entity.LoginProvider;
import com.ssafy.codemaestro.global.entity.User;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA에서 필요
public class UserProfileResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private String profileBackgroundImageUrl;
    private String loginId;
    private String description;
    private String loginProvider;
    private int bojTier;

    // JPQL에서 사용할 생성자
    public UserProfileResponseDto(Long userId, String email, String nickname,
                                  String profileImageUrl, String profileBackgroundImageUrl,
                                  String loginId, String description, LoginProvider loginProvider,
                                  int bojTier) {
        this.userId = userId;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.profileBackgroundImageUrl = profileBackgroundImageUrl;
        this.loginId = loginId;
        this.description = description;
        this.loginProvider = loginProvider.toString();
        this.bojTier = bojTier;
    }

    // User 엔티티로부터 DTO를 생성하는 정적 팩토리 메서드
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