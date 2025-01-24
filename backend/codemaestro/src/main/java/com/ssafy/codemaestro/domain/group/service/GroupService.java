package com.ssafy.codemaestro.domain.group.service;

import com.ssafy.codemaestro.domain.group.dto.GroupDetailResponseDto;
import com.ssafy.codemaestro.domain.group.dto.GroupRequestDto;
import com.ssafy.codemaestro.domain.group.dto.GroupResponseDto;
import com.ssafy.codemaestro.domain.group.dto.TransferOwnerRequestDto;
import com.ssafy.codemaestro.domain.group.entity.Group;
import com.ssafy.codemaestro.domain.group.entity.GroupMember;
import com.ssafy.codemaestro.domain.group.entity.GroupRole;
import com.ssafy.codemaestro.domain.group.repository.GroupMemberRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupRepository;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.*;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    // 그룹 생성
    public GroupResponseDto createGroup(GroupRequestDto groupRequestDto) {
        System.out.println(groupRequestDto.getUserId());
        User owner = userRepository.findById(groupRequestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Group group = new Group();
        group.setName(groupRequestDto.getName());
        group.setDescription(groupRequestDto.getDescription());
        group.setOwner(owner); // 그룹의 소유자 설정
        group.setCurrentMembers(1);

        groupRepository.save(group);

        // 생성자는 그룹에 OWNER로 참여
        GroupMember groupMember = new GroupMember();
        groupMember.setUser(owner);
        groupMember.setGroup(group);
        groupMember.setRole(GroupRole.OWNER);

        groupMemberRepository.save(groupMember);

        return new GroupResponseDto(group);
    }

    // 그룹 삭제
    public void deleteGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        groupRepository.delete(group);
    }

    // 전체 그룹 조회
    public List<GroupResponseDto> getAllGroups() {
        List<Group> groups = groupRepository.findAll();

        List<GroupResponseDto> groupResponseDtos = new ArrayList<>();
        for(Group group : groups) {
            GroupResponseDto gouGroupResponseDto = new GroupResponseDto(group);
            groupResponseDtos.add(gouGroupResponseDto);
        }

        return groupResponseDtos;
    }

    // 개별 그룹 조회
    public List<GroupResponseDto> getUserGroups(Long userId) {
        List<GroupMember> groupMembers = groupMemberRepository.findByUserId(userId);

        List<GroupResponseDto> groupResponseDtos = new ArrayList<>();
        for (GroupMember groupMember : groupMembers) {
            groupResponseDtos.add(new GroupResponseDto(groupMember.getGroup()));
        }
        return groupResponseDtos;
    }

    // 그룹 상세 조회
    public GroupDetailResponseDto getGroupDetails(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        return new GroupDetailResponseDto(group);
    }

    // 그룹 탈퇴
    public void leaveGroup(Long groupId, Long userId) {
        GroupMember groupMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Group Member not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // 그룹장이 탈퇴하려는 경우 Bad_request 반환
        if (group.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Group owner cannot leave the group");
        }

        groupMemberRepository.delete(groupMember);
        group.setCurrentMembers(group.getCurrentMembers() - 1);
        groupRepository.save(group);
    }

    // 그룹장 권한 위임
    public void transferOwner(TransferOwnerRequestDto request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.getOwner().getId().equals(request.getCurrentOwnerId())) {
            throw new IllegalArgumentException("Only the current owner can transfer ownership.");
        }

        GroupMember newOwnerMember = groupMemberRepository.findByGroupIdAndUserId(
                        request.getGroupId(), request.getNewOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("The specified user is not a member of this group."));

        GroupMember currentOwnerMember = groupMemberRepository.findByGroupIdAndUserId(
                        request.getGroupId(), request.getCurrentOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Current owner not found in group members."));

        currentOwnerMember.setRole(GroupRole.MEMBER);
        newOwnerMember.setRole(GroupRole.OWNER);

        User newOwner = newOwnerMember.getUser();
        group.setOwner(newOwner);

        // 저장
        groupMemberRepository.save(currentOwnerMember); // 기존 소유자 정보 저장
        groupMemberRepository.save(newOwnerMember);     // 새로운 소유자 정보 저장
        groupRepository.save(group);                    // 그룹 정보 저장
    }
}

//    // 그룹 참가 요청
//    public JoinRequestResponse createJoinRequest(Long groupId, JoinRequestRequest request) {
//        Group group = groupRepository.findById(groupId)
//                .orElseThrow(() -> new NotFoundException("Group not found"));
//
//        User currentUser = getCurrentUser();
//
//        // 이미 멤버인지 확인
//        if (memberRepository.existsByUserAndGroup(currentUser, group)) {
//            throw new BadRequestException("Already a member of this group");
//        }
//
//        // 이미 요청했는지 확인
//        if (joinRequestRepository.existsByUserAndGroupAndStatus(
//                currentUser, group, GroupRequestStatus.PENDING)) {
//            throw new BadRequestException("Join request already exists");
//        }
//
//        GroupJoinRequest joinRequest = new GroupJoinRequest();
//        joinRequest.setUser(currentUser);
//        joinRequest.setGroup(group);
//        joinRequest.setMessage(request.getMessage());
//        joinRequest.setStatus(GroupRequestStatus.PENDING);
//        joinRequest.setCreatedAt(LocalDateTime.now());
//        joinRequest.setUpdatedAt(LocalDateTime.now());
//
//        joinRequestRepository.save(joinRequest);
//
//        // SSE로 그룹 오너에게 알림
//        notifyGroupOwner(group.getOwner().getId(), "New join request received");
//
//        return new JoinRequestResponse(joinRequest);
//    }
//
//    // 참가 요청 수락
//    public void acceptJoinRequest(Long requestId) {
//        GroupJoinRequest request = joinRequestRepository.findById(requestId)
//                .orElseThrow(() -> new NotFoundException("Join request not found"));
//
//        User currentUser = getCurrentUser();
//        if (!request.getGroup().getOwner().equals(currentUser)) {
//            throw new UnauthorizedException("Only group owner can accept join requests");
//        }
//
//        request.setStatus(GroupRequestStatus.ACCEPTED);
//        request.setUpdatedAt(LocalDateTime.now());
//
//        // 새 멤버 추가
//        GroupMember member = new GroupMember();
//        member.setUser(request.getUser());
//        member.setGroup(request.getGroup());
//        member.setRole(GroupRole.MEMBER);
//        member.setJoinedAt(LocalDateTime.now());
//        member.setUpdatedAt(LocalDateTime.now());
//
//        memberRepository.save(member);
//
//        // 현재 멤버 수 업데이트
//        request.getGroup().setCurrentMembers(
//                request.getGroup().getCurrentMembers() + 1);
//
//        // SSE로 요청자에게 알림
//        notifyUser(request.getUser().getId(), "Your join request was accepted");
//    }
//
//    // 알림?
//    private SseEmitter notifyUser(Long userId, String message) {
//        SseEmitter emitter = new SseEmitter(TimeUnit.MINUTES.toMillis(1));
//        try {
//            emitter.send(SseEmitter.event()
//                    .name("notification")
//                    .data(message));
//        } catch (IOException e) {
//            emitter.completeWithError(e);
//        }
//        return emitter;
//    }
//
//    // 알림?
//    private SseEmitter notifyGroupOwner(Long ownerId, String message) {
//        return notifyUser(ownerId, message);
//    }
//
//    // 참가 요청 거절
//    public void rejectJoinRequest(Long requestId) {
//        GroupJoinRequest request = joinRequestRepository.findById(requestId)
//                .orElseThrow(() -> new NotFoundException("Join request not found"));
//
//        User currentUser = getCurrentUser();
//        if (!request.getGroup().getOwner().equals(currentUser)) {
//            throw new UnauthorizedException("Only group owner can reject join requests");
//        }
//
//        request.setStatus(GroupRequestStatus.REJECTED);
//        request.setUpdatedAt(LocalDateTime.now());
//
//        // SSE로 요청자에게 알림
//        notifyUser(request.getUser().getId(), "Your join request was rejected");
//    }
//
//    // 내가 참여한 그룹 조회
//    public List<GroupResponse> getMyGroups() {
//        User currentUser = getCurrentUser();
//        return groupRepository.findGroupsByUserId(currentUser.getId())
//                .stream()
//                .map(GroupResponse::new)
//                .toList();
//    }
//
//    // 그룹 탈퇴
//    public void leaveGroup(Long groupId) {
//        Group group = groupRepository.findById(groupId)
//                .orElseThrow(() -> new NotFoundException("Group not found"));
//
//        User currentUser = getCurrentUser();
//
//        // 그룹 소유자는 탈퇴할 수 없음
//        if (group.getOwner().equals(currentUser)) {
//            throw new BadRequestException("Group owner cannot leave the group. Please delete the group instead.");
//        }
//
//        GroupMember member = memberRepository.findByUserAndGroup(currentUser, group)
//                .orElseThrow(() -> new NotFoundException("You are not a member of this group"));
//
//        memberRepository.delete(member);
//
//        // 현재 멤버 수 감소
//        group.setCurrentMembers(group.getCurrentMembers() - 1);
//        groupRepository.save(group);
//    }
//
//    // 현재 사용자 가져오기 (Security Context에서 가져오는 것으로 가정)
//    private User getCurrentUser() {
//        // SecurityContextHolder에서 사용자 정보를 가져오는 로직 구현 필요
//        return null; // 실제 구현 필요
//    }
//}