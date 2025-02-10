package com.ssafy.codemaestro.domain.friend.repository;

import com.ssafy.codemaestro.global.entity.FriendRequest;
import com.ssafy.codemaestro.global.entity.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequestStatus status);
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    boolean existsBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, FriendRequestStatus status);

    // 양방향 친구 관계 조회 (내가 수락한 요청 + 내가 보내서 수락된 요청)
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
            "(fr.senderId = :userId OR fr.receiverId = :userId) " +
            "AND fr.status = :status")
    List<FriendRequest> findAllFriendsByUserIdAndStatus(Long userId, FriendRequestStatus status);
}
