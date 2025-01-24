package com.ssafy.codemaestro.domain.group.service;

import com.ssafy.codemaestro.domain.group.dto.GroupJoinRequestDto;
import com.ssafy.codemaestro.domain.group.entity.Group;
import com.ssafy.codemaestro.domain.group.entity.GroupJoinRequest;
import com.ssafy.codemaestro.domain.group.entity.GroupRequestStatus;
import com.ssafy.codemaestro.domain.group.repository.GroupJoinRequestRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupRepository;
import com.ssafy.codemaestro.domain.notification.service.NotificationService;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class GroupRequestService {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final NotificationService notificationService;

    // 그룹 가입 요청
    @Transactional
    public void sendGroupJoinRequest(GroupJoinRequestDto request) {
        GroupJoinRequest groupJoinRequest = saveGroupJoinRequest(request);

        // 그룹장에게 알림 전송
        Long groupOwnerId = groupJoinRequest.getGroup().getOwner().getId(); // 그룹장의 ID 가져오기
        notificationService.sendGroupJoinRequestNotification(
                groupOwnerId, // 그룹장에게 알림
                GroupJoinRequestDto.from(groupJoinRequest)
        );
    }

    // 그룹 요청 DB 저장
    @Transactional
    private GroupJoinRequest saveGroupJoinRequest(GroupJoinRequestDto request) {
        // 이미 존재하는 요청 확인
        boolean alreadyExists = groupJoinRequestRepository.existsByUserIdAndGroupIdAndStatus(
                request.getUserId(),
                request.getGroupId(),
                GroupRequestStatus.PENDING
        );

        if (alreadyExists) {
            throw new IllegalStateException("Group join request already exists");
        }

        // User와 Group 조회
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found with id: " + request.getGroupId()));

        // 요청 생성 및 저장
        GroupJoinRequest groupJoinRequest = new GroupJoinRequest();
        groupJoinRequest.setUser(user);
        groupJoinRequest.setGroup(group);
        groupJoinRequest.setStatus(GroupRequestStatus.PENDING);
        groupJoinRequest.setMessage(request.getMessage());

        return groupJoinRequestRepository.save(groupJoinRequest);
    }

    // 그룹 요청 수락
    @Transactional
    public void acceptGroupJoinRequest(Long requestId) {
        // 요청을 DB에서 찾기
        Optional<GroupJoinRequest> optionalRequest = groupJoinRequestRepository.findById(requestId);
        if (!optionalRequest.isPresent()) {
            throw new IllegalArgumentException("Group join request not found");
        }

        GroupJoinRequest request = optionalRequest.get(); // 객체 가져오기

        request.setStatus(GroupRequestStatus.ACCEPTED);

        groupJoinRequestRepository.save(request);
    }

    // 가입 요청 거절
    public void rejectGroupJoinRequest(Long requestId) {
        Optional<GroupJoinRequest> optionalRequest = groupJoinRequestRepository.findById(requestId);
        if(!optionalRequest.isPresent()) {
            throw new IllegalArgumentException("Group request not found");
        }

        GroupJoinRequest request = optionalRequest.get();
        request.reject();
        groupJoinRequestRepository.save(request);
    }
}
