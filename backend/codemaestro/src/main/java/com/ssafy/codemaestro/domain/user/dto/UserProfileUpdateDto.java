package com.ssafy.codemaestro.domain.user.dto;

import com.ssafy.codemaestro.domain.validation.controller.ValidateController;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileUpdateDto {
    private String nickname;
    private String description;
    private MultipartFile profileImage;
    private MultipartFile profileBackgroundImage;


    // 비밀번호 변경 필드
    private String currentPassword;
    private String newPassword;
}
