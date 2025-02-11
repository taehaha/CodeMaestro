package com.ssafy.codemaestro.domain.user.repository;

import com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto;
import com.ssafy.codemaestro.global.entity.LoginProvider;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 메서드들...
    Boolean existsByEmail(String email);
    Boolean existsByNickname(String nickname);
    User findByEmail(String email);

    Boolean existsByEmailAndLoginProvider(String email, LoginProvider loginProvider);

    User findByLoginIdAndLoginProvider(String loginId, LoginProvider loginProvider);

    // 유저 검색
    List<User> findByIdNot(Long currentUserId);
    List<User> findByNicknameContainingAndIdNot(String trim, Long currentUserId);

    @Query("SELECT new com.ssafy.codemaestro.domain.user.dto.UserProfileResponseDto(" +
            "u.id, u.email, u.nickname, u.profileImageUrl, u.profileBackgroundImageUrl, " +
            "u.loginId, u.description, u.loginProvider, COALESCE(b.tier, 100)) " +
            "FROM User u LEFT JOIN BojUser b ON b.user = u " +
            "WHERE u.id = :userId")
    Optional<UserProfileResponseDto> findUserWithBojInfo(@Param("userId") Long userId);
}