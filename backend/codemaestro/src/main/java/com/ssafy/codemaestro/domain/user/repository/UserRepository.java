package com.ssafy.codemaestro.domain.user.repository;

import com.ssafy.codemaestro.global.entity.LoginProvider;
import com.ssafy.codemaestro.global.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}