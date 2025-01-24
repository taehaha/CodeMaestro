package com.ssafy.codemaestro.domain.auth.controller;

import com.ssafy.codemaestro.domain.auth.dto.FindPasswordRequestDto;
import com.ssafy.codemaestro.domain.auth.dto.LogoutResponseDto;
import com.ssafy.codemaestro.domain.auth.dto.SignUpDto;
import com.ssafy.codemaestro.domain.auth.entity.RefreshEntity;
import com.ssafy.codemaestro.domain.auth.repository.RefreshRepository;
import com.ssafy.codemaestro.domain.auth.service.AuthService;
import com.ssafy.codemaestro.domain.verify.dto.ValidateEmailPinRequestDto;
import com.ssafy.codemaestro.domain.verify.dto.VerifyEmailRequestDto;
import com.ssafy.codemaestro.domain.auth.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

/**
 * Spring Security에서 Filter로 처리되는 Endpoint들을 Swagger에 표시하기 위해 사용하는 빈 Controller
 */
@RestController
public class AuthController {
    private final AuthService authService;
    private final RefreshRepository refreshRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthService authService, RefreshRepository refreshRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.refreshRepository = refreshRepository;
        this.jwtUtil = jwtUtil;
    }

    // 로그인
//    @PostMapping("/auth/signin")
//    public void signin() {}

    // 로그아웃
    @PostMapping("/auth/signup")
    public ResponseEntity<Void> signup(SignUpDto signUpDto) {
        authService.joinProcess(signUpDto);

        return ResponseEntity.ok().build();
    }

    // 로그아웃
    @DeleteMapping("/auth/logout")
    public ResponseEntity<Void> logout(LogoutResponseDto dto) {
        authService.invaildateRefreshToken(dto.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    // JWT RefreshToken 재발급
    @PostMapping("/auth/reissue")
    public ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("refresh")) {
                refresh = cookie.getValue();
            }
        }

        // token이 있는지 확인
        if (refresh == null) {
            return new ResponseEntity<>("refresh is null", HttpStatus.BAD_REQUEST);
        }

        // token이 유효한지 확인
        try {
            jwtUtil.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            return new ResponseEntity<>("refresh expired", HttpStatus.BAD_REQUEST);
        }

        // refreshToken이 맞는지 확인
        String category = jwtUtil.getCategory(refresh);
        if (!category.equals("refresh")) {
            return new ResponseEntity<>("invaild refresh", HttpStatus.BAD_REQUEST);
        }

        // DB에 저장되어있는지 확인
        boolean isExist = refreshRepository.existsByRefreshToken(refresh);
        if (!isExist) {
            return new ResponseEntity<>("invaild refresh", HttpStatus.BAD_REQUEST);
        }

        // Token에서 User 정보 추출
        String userId = jwtUtil.getId(refresh);

        // 새로 발급할 AccessToken, RefreshToken
        String newAccess = jwtUtil.createToken("access", userId, 60 * 60 * 10L);
        String newRefresh = jwtUtil.createToken("refresh", userId, 60 * 60 * 10L);

        refreshRepository.deleteByRefreshToken(refresh);
        addRefreshEntity(userId, newRefresh, 60 * 60 * 10L);

        response.setHeader("access", newAccess);
        response.addCookie(jwtUtil.createJwtCookie("refresh", newRefresh));

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

    private void addRefreshEntity(String userId, String refresh, Long expireMs) {
        Date date = new Date(System.currentTimeMillis() + expireMs);

        RefreshEntity refreshEntity = new RefreshEntity();
        refreshEntity.setEmail(userId);
        refreshEntity.setRefreshToken(refresh);
        refreshEntity.setExpiration(date.toString());

        refreshRepository.save(refreshEntity);
    }
}
