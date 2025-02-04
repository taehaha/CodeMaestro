package com.ssafy.codemaestro.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileUpdateDto {
    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private String profileBackgroundImgUrl;
    private String description;

    // 비밀번호 변경 필드
    private String currentPassword;
    private String newPassword;
}
