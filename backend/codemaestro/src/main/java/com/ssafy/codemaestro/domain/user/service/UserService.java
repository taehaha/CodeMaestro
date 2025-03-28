package com.ssafy.codemaestro.domain.user.service;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.domain.user.dto.UserProfileUpdateDto;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.InvalidPasswordException;
import com.ssafy.codemaestro.global.exception.UserNotFoundException;
import com.ssafy.codemaestro.global.util.S3Util;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Util s3Util;

    // 개인 정보 조회
    // readOnly 로 바꾸기
    public UserProfileResponseDto getUserProfile(Long userId) {
        return userRepository.findUserWithBojInfo(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    // 개인 정보 수정
    public UserProfileResponseDto updateUserProfile(Long userId, UserProfileUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not Found"));

        if (dto.getNickname() != null) {
            user.setNickname(dto.getNickname());
        }
        if (dto.getDescription() != null) {
            user.setDescription(dto.getDescription());
        }

        try {
            // 프로필 이미지 업데이트
            MultipartFile profileImage = dto.getProfileImage();
            if (profileImage != null && !profileImage.isEmpty()) {
                String profileImageUrl = s3Util.uploadFile(profileImage);
                // 기존 이미지는 삭제
                String oldProfileImageUrl = user.getProfileImageUrl();
                if(oldProfileImageUrl != null) {
                    s3Util.deleteFile(oldProfileImageUrl);
                }
                user.setProfileImageUrl(profileImageUrl);
            }

            // 배경 이미지 업데이트
            MultipartFile backgroundImage = dto.getProfileBackgroundImage();
            if (backgroundImage != null && !backgroundImage.isEmpty()) {
                String backgroundImageUrl = s3Util.uploadFile(backgroundImage);
                // 기존 이미지는 삭제
                String oldBackgroundImagrUrl = user.getProfileBackgroundImageUrl();
                if(oldBackgroundImagrUrl != null) {
                    s3Util.deleteFile(oldBackgroundImagrUrl);
                }
                user.setProfileBackgroundImageUrl(backgroundImageUrl);
            }

            User savedUser = userRepository.save(user);
            return UserProfileResponseDto.from(savedUser);

        } catch (Exception e) {
            throw new BadRequestException("프로필 업데이트 실패: " + e.getMessage());
        }
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

    // 유저 검색
    public List<UserProfileResponseDto> searchUsers(String nickname, Long currentUserId) {
        List<User> users;

        // nickname이 없으면 전체 목록 반환
        if(nickname == null || nickname.trim().isEmpty()) {
            return new ArrayList<>();
        } else {
            users = userRepository.findByNicknameContainingAndIdNot(nickname.trim(), currentUserId);
        }

        // DTO 반환
        List<UserProfileResponseDto> searchUserList = new ArrayList<>();
        for(User user : users) {
            UserProfileResponseDto dto = UserProfileResponseDto.from(user); // 이 부분 from 사용해서 수정
            searchUserList.add(dto);
        }

        return searchUserList;
    }
}
