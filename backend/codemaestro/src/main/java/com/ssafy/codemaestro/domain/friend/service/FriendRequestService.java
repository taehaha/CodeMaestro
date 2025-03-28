package com.ssafy.codemaestro.domain.friend.service;

import com.ssafy.codemaestro.domain.friend.dto.FriendListResponseDto;
import com.ssafy.codemaestro.domain.friend.dto.FriendRequestDto;
import com.ssafy.codemaestro.domain.friend.dto.FriendResponseDto;
import com.ssafy.codemaestro.domain.friend.repository.FriendRequestRepository;
import com.ssafy.codemaestro.domain.notification.service.NotificationService;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.FriendRequest;
import com.ssafy.codemaestro.global.entity.FriendRequestStatus;
import com.ssafy.codemaestro.global.exception.AlreadyRequestExistExceptions;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class FriendRequestService {
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // 친구 요청
    public void sendFriendRequest(FriendRequestDto request) {
        FriendRequest friendRequest = saveFriendRequest(request);

        // sender와 receiver 정보 조회
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new BadRequestException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new BadRequestException("Receiver not found"));

        // 알림 전송
        notificationService.sendFriendRequestNotification(
                request.getReceiverId(),
                FriendResponseDto.from(friendRequest, sender, receiver)
        );
    }

    // 친구 요청 DB 저장
    private FriendRequest saveFriendRequest(FriendRequestDto request) {
        // User 엔티티 조회
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new EntityNotFoundException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new EntityNotFoundException("Receiver not found"));

        // 이미 존재하는 친구 요청이 있는지 확인
        boolean alreadyExists = friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(
                request.getSenderId(), request.getReceiverId(), FriendRequestStatus.PENDING);

        if (alreadyExists) {
            throw new AlreadyRequestExistExceptions("Friend request already exists");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .build();
        return friendRequestRepository.save(friendRequest);
    }

    // 친구 요청 수락
    public void acceptFriendRequest(Long requestId) {
        Optional<FriendRequest> optionalRequest = friendRequestRepository.findById(requestId);
        if (!optionalRequest.isPresent()) {
            throw new IllegalArgumentException("Friend request not found");
        }

        FriendRequest request = optionalRequest.get(); // 객체 가져오기

//        if(!request.getStatus().equals("PENDING")) {
//            throw new BadRequestException("is not PENDING");
//        }

        request.accept(); // PENDING -> ACCEPTED
        friendRequestRepository.save(request); // DB 저장

    }

    // 친구 요청 거절
    public void rejectFriendRequest(Long requestId) {
        Optional<FriendRequest> optionalRequest = friendRequestRepository.findById(requestId);
        if(!optionalRequest.isPresent()) {
            throw new IllegalArgumentException("Friend request not found");
        }

        FriendRequest request = optionalRequest.get();

//        if(!request.getStatus().equals("PENDING")) {
//            throw new BadRequestException("is not PENDING");
//        }

        request.reject();
        friendRequestRepository.save(request);
    }

    // 대기 중인 요청 조회
    public List<FriendListResponseDto> getPendingRequests(Long userId) {
        List<FriendRequest> friendRequests = friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendRequestStatus.PENDING);

        List<FriendListResponseDto> friendListResponseDtos = new ArrayList<>();

        for (FriendRequest friendRequest : friendRequests) {
            // 요청자를 찾음
            Long senderId = friendRequest.getSender().getId();
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            FriendListResponseDto responseDto = new FriendListResponseDto(
                    sender.getId(),
                    sender.getNickname(),
                    sender.getProfileImageUrl(),
                    friendRequest.getId()
            );

            friendListResponseDtos.add(responseDto);
        }

        return friendListResponseDtos;
    }

    // 친구 전체 목록 조회
    public List<FriendListResponseDto> getAllFriends(Long userId) {
        List<FriendRequest> friendRequests = friendRequestRepository
                .findAllFriendsByUserIdAndStatus(userId, FriendRequestStatus.ACCEPTED);

        List<FriendListResponseDto> friendList = new ArrayList<>();

        for (FriendRequest fr : friendRequests) {
            // 내가 보낸 요청인지 받은 요청인지 확인 - 친구는 양방향 이니끼
            Long friendId = fr.getSender().getId().equals(userId) ? fr.getReceiver().getId() : fr.getSender().getId();
            User friend = userRepository.findById(friendId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            friendList.add(new FriendListResponseDto(
                    friend.getId(),
                    friend.getNickname(),
                    friend.getProfileImageUrl(),
                    fr.getId()
            ));
        }

        return friendList;
    }

    // 친구 삭제
    public void deleteFriend(Long requestId) {
        // friendRequestId로 친구 요청을 찾음
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend relationship not found"));

        // ACCEPTED 상태인 경우에만 삭제 가능
        if (request.getStatus() != FriendRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Can only delete accepted friend relationships");
        }

        // 데이터베이스에서 실제로 삭제
        friendRequestRepository.delete(request);
    }
}