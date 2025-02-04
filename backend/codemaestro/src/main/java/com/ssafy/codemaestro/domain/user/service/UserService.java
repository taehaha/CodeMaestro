package com.ssafy.codemaestro.domain.user.service;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.domain.user.dto.UserProfileUpdateDto;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.InvalidPasswordException;
import com.ssafy.codemaestro.global.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 개인 정보 조회
    // readOnly 로 바꾸기
    public UserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserProfileResponseDto.from(user);
    }

    // 개인 정보 수정
    public UserProfileResponseDto updateUserProfile(Long userId, UserProfileUpdateDto userProfileUpdateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not Found"));

        user.setNickname(userProfileUpdateDto.getNickname());
        user.setProfileImageUrl(userProfileUpdateDto.getProfileImageUrl());
        user.setProfileBackgroundImageUrl(userProfileUpdateDto.getProfileBackgroundImgUrl());
        user.setDescription(userProfileUpdateDto.getDescription());

        User savedUser = userRepository.save(user);
        return UserProfileResponseDto.from(savedUser);
    }

    // 비밀번호 수정
    public void updatePassword(Long userId, UserProfileUpdateDto userProfileUpdateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not Found"));

        // 현재 비밀번호 확인
        if(!passwordEncoder.matches(userProfileUpdateDto.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        // 새 비밀번호 암호화, 저장
        String encodePassword = passwordEncoder.encode(userProfileUpdateDto.getNewPassword());
        user.setPassword(encodePassword);
        userRepository.save(user);
    }
}
