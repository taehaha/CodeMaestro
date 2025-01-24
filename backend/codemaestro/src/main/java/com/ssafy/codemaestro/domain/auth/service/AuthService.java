package com.ssafy.codemaestro.domain.auth.service;

import com.ssafy.codemaestro.domain.auth.dto.SignUpDto;
import com.ssafy.codemaestro.domain.auth.entity.VerifyEmailEntity;
import com.ssafy.codemaestro.domain.auth.repository.RefreshRepository;
import com.ssafy.codemaestro.domain.auth.repository.VerifyEmailRepository;
import com.ssafy.codemaestro.domain.auth.util.MailUtil;
import com.ssafy.codemaestro.domain.user.entity.LoginProvider;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshRepository refreshRepository;
    private final VerifyEmailRepository verifyEmailRepository;

    private final MailUtil mailUtil;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository, RefreshRepository refreshRepository, VerifyEmailRepository verifyEmailRepository, MailUtil mailUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshRepository = refreshRepository;
        this.verifyEmailRepository = verifyEmailRepository;
        this.mailUtil = mailUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public void joinProcess(SignUpDto signUpDto) {
        // 유저가 이미 존재하는지 확인
        Boolean isExist = userRepository.existsByEmailAndLoginProvider(signUpDto.getEmail(), LoginProvider.LOCAL);

        if (isExist) {
            return;
        }

        // 새로운 유저 생성
        User user = new User();

        user.setEmail(signUpDto.getEmail());
        user.setPassword(passwordEncoder.encode(signUpDto.getPassword()));
        user.setNickname(signUpDto.getNickname());
        user.setProfileImageUrl(null); // TODO: 기본 이미지 URL로 변환 필요
        user.setLoginProvider(LoginProvider.LOCAL);
        user.setLoginId(null);
        user.setDescription(signUpDto.getDescription());

        userRepository.save(user);
    }

    public boolean invaildateRefreshToken(String refreshToken) {
        refreshRepository.deleteByRefreshToken(refreshToken);
        return true;
    }

    public boolean findPassword(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) return false;

        // 비밀번호 생성
        String password = this.generateRandomString(10, "abcdefghijklmnopqrstuvwxyz!@#$%^&*");

        // 비밀번호 저장
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);

        // 변경된 비밀번호 발송
        try {
            mailUtil.send(user.getEmail(), "CodeMaestro 비밀번호 재설정", "<h1>새로운 비밀번호입니다.</h1> <h4>" + password + "</h4>");
        } catch (MessagingException e) {
            System.err.println("비밀번호 찾기 메일 발송 오류 발생.");
            e.printStackTrace();
            return false;
        }

        return true;
    }

    public boolean sendVerifyEmail(String email) {
        String pin = generateRandomString(6, "0123456789");

        String content =
                "<h1>이메일 인증</h1><h4>인증번호 : " + pin + "</h4>";

        VerifyEmailEntity entity = VerifyEmailEntity.builder()
                .email(email)
                .pin(pin)
                .build();

        try {
            mailUtil.send(email, "CodeMaestro 이메일 인증", content);
            verifyEmailRepository.save(entity);
            return true;
        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean verifyEmail(String email, String pin) {
        VerifyEmailEntity verifyEmailEntity = verifyEmailRepository.findByEmailAndPin(email, pin);

        if (verifyEmailEntity == null) {
            return false;
        } else {
            verifyEmailRepository.delete(verifyEmailEntity);
            return true;
        }
    }

    private String generateRandomString(int length, String characters) {
        SecureRandom secureRandom = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(secureRandom.nextInt(characters.length())));
        }

        return sb.toString();
    }
}
