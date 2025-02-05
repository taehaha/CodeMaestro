package com.ssafy.codemaestro.domain.user.controller;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.domain.user.dto.UserProfileUpdateDto;
import com.ssafy.codemaestro.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponseDto profile = userService.getUserProfile(Long.parseLong(userDetails.getUsername())); // 문자열 반환
        return ResponseEntity.ok(profile);
    }

    // 개인 정보 수정
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UserProfileUpdateDto userProfileUpdateDto) {
        Long userId = Long.parseLong(userDetails.getUsername());
        UserProfileResponseDto updateUserProfile = userService.updateUserProfile(userId, userProfileUpdateDto);
        return ResponseEntity.ok(updateUserProfile);
    }

    // 비밀번호 수정
    @PatchMapping("/profile/password")
    public ResponseEntity<?> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UserProfileUpdateDto userProfileUpdateDto) {

        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updatePassword(userId, userProfileUpdateDto);
        return ResponseEntity.ok("Success : password update");
    }
}
