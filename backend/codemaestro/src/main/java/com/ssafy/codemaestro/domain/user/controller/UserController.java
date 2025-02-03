package com.ssafy.codemaestro.domain.user.controller;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 개인 정보 조회
     * @AuthenticationPrincipal 어노테이션을 사용하여 JWT 토큰이나 세션에서 인증된 사용자 정보를 가져옴
     * @param userDetails
     * @return
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponseDto profile = userService.getUserProfile(Long.parseLong(userDetails.getUsername())); // 문자열 반환
        return ResponseEntity.ok(profile);
    }

    // 개인 정보 수정

}
