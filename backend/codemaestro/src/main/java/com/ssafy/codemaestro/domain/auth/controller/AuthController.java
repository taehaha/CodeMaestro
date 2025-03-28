package com.ssafy.codemaestro.domain.auth.controller;

import com.ssafy.codemaestro.domain.auth.dto.AccessTokenReissueRequest;
import com.ssafy.codemaestro.domain.auth.entty.CustomUserDetails;
import com.ssafy.codemaestro.domain.auth.dto.FindPasswordRequestDto;
import com.ssafy.codemaestro.domain.auth.dto.LogoutResponseDto;
import com.ssafy.codemaestro.domain.auth.dto.SignUpDto;
import com.ssafy.codemaestro.domain.auth.service.AuthService;
import com.ssafy.codemaestro.domain.validation.dto.ValidateEmailPinRequestDto;
import com.ssafy.codemaestro.domain.validation.dto.VerifyEmailRequestDto;
import com.ssafy.codemaestro.global.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // 회원가입
    @PostMapping("/auth/signup")
    public ResponseEntity<Void> signup(SignUpDto signUpDto) {
        boolean success = authService.signup(signUpDto);

        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

    /**
     * 회원탈퇴
     */
    @DeleteMapping("/auth/quit")
    public ResponseEntity<Void> quit() {
        // 로그인된 유저 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        long userId = Long.parseLong(userDetails.getUsername());

        // 회원탈퇴
        authService.quit(userId);

        return ResponseEntity.ok().build();
    }

    // 로그아웃
    @DeleteMapping("/auth/logout")
    public ResponseEntity<Void> logout(LogoutResponseDto dto) {
        authService.invaildateRefreshToken(dto.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    // JWT AccessToken 및 RefreshToken 재발급
    @PostMapping("/auth/reissue")
    public ResponseEntity<Void> reissue(HttpServletRequest request,
                                        HttpServletResponse response,
                                        @RequestBody(required = false) AccessTokenReissueRequest dto) {
        // 토큰 받아오기
        String refresh = dto.getRefreshToken(); // 본문에서 먼저 받음

        if (refresh == null) { // 본문에 토큰이 없으면 쿠키에서 받음
            Cookie[] cookies = request.getCookies();
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) {
                    refresh = cookie.getValue();
                }
            }
        }

        // token이 있는지 확인
        if (refresh == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String[] tokens = authService.reissueAccessAndRefreshToken(refresh);
        String newAccessToken = tokens[0];
        String newRefreshToken = tokens[1];

        response.setHeader("access", newAccessToken);
        response.addCookie(jwtUtil.createJwtCookie("refresh", newRefreshToken));

        return ResponseEntity.ok().build();
    }

    // 비밀번호 찾기
    @PostMapping("/auth/find-password")
    public ResponseEntity<Void> findPassword(@RequestBody FindPasswordRequestDto findPasswordRequestDto) {
        boolean result = authService.findPassword(findPasswordRequestDto.getEmail());

        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 이메일 인증 생성 및 발송
    @PostMapping("/auth/verify/email")
    public ResponseEntity<Void> verifyEmail(@RequestBody VerifyEmailRequestDto dto) {
        String email = dto.getEmail();

        boolean result = authService.sendVerifyEmail(email);

        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 이메일에서 얻은 pin 번호로 현재 이메일 인증
    @PutMapping("/auth/verify/email")
    public ResponseEntity<Void> checkVerifyEmail(@RequestBody ValidateEmailPinRequestDto dto) {
        String email = dto.getEmail();
        String pin = dto.getPin();

        boolean result = authService.verifyEmail(email, pin);

        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
