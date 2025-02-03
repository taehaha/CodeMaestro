package com.ssafy.codemaestro.domain.user.service;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 단순 조회 쿼리에서는 읽기 전용 트랜젝션으로 관리하는게 좋음.
    // 왜? JPA에서는 user 엔티티의 스냅샷을 생성하고 메모리에서 관리하는데 단순 조회에서는 해당 작업이 필요 없음
    // 유저 정보 조회
    @Transactional
    public UserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserProfileResponseDto.from(user);
    }
}
