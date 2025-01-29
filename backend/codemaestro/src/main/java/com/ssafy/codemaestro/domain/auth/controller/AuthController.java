package com.ssafy.codemaestro.domain.auth.controller;

import com.ssafy.codemaestro.domain.auth.dto.FindPasswordRequestDto;
import com.ssafy.codemaestro.domain.auth.dto.LogoutResponseDto;
import com.ssafy.codemaestro.domain.auth.dto.SignUpDto;
import com.ssafy.codemaestro.domain.auth.service.AuthService;
import com.ssafy.codemaestro.domain.verify.dto.ValidateEmailPinRequestDto;
import com.ssafy.codemaestro.domain.verify.dto.VerifyEmailRequestDto;
import com.ssafy.codemaestro.domain.auth.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // 로그아웃
    @PostMapping("/auth/signup")
    public ResponseEntity<Void> signup(SignUpDto signUpDto) {
        boolean success = authService.join(signUpDto);

        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 로그아웃
    @DeleteMapping("/auth/logout")
    public ResponseEntity<Void> logout(LogoutResponseDto dto) {
        authService.invaildateRefreshToken(dto.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    // JWT AccessToken 및 RefreshToken 재발급
    @PostMapping("/auth/reissue")
    public ResponseEntity<Void> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("refresh")) {
                refresh = cookie.getValue();
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
    @GetMapping("/auth/verify/email")
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
