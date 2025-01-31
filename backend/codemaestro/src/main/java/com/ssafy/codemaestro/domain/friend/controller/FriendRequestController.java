package com.ssafy.codemaestro.domain.friend.controller;

import com.ssafy.codemaestro.domain.friend.dto.FriendListResponseDto;
import com.ssafy.codemaestro.domain.friend.dto.FriendRequestDto;
import com.ssafy.codemaestro.domain.friend.service.FriendRequestService;
import lombok.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    // 친구 요청
    @PostMapping("/requests")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDto request) {
        friendRequestService.sendFriendRequest(request);
        return ResponseEntity.ok().build();
    }

    // 친구 요청 수락
    // ddd
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId) {
        friendRequestService.acceptFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    // 친구 요청 거절
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long requestId) {
        friendRequestService.rejectFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    // 대기 중인 요청 조회
    @GetMapping("/requests/{userId}/pending")
    public ResponseEntity<List<FriendListResponseDto>> getPendingRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(friendRequestService.getPendingRequests(userId));
    }

    // 친구 전체 목록 조회
    @GetMapping("/users/{userId}/friends")
    public ResponseEntity<List<FriendListResponseDto>> getAllFriends(@PathVariable Long userId) {
        return ResponseEntity.ok(friendRequestService.getAllFriends(userId));
    }

    // 친구 삭제
    @DeleteMapping("/requests/{requestId}/delete")
    public ResponseEntity<?> deleteFriend(@PathVariable Long requestId) {
        friendRequestService.deleteFriend(requestId);
        return ResponseEntity.ok().build();
    }
}