package com.ssafy.codemaestro.domain.group.service;

import com.ssafy.codemaestro.domain.group.dto.GroupDetailResponseDto;
import com.ssafy.codemaestro.domain.group.dto.GroupRequestDto;
import com.ssafy.codemaestro.domain.group.dto.GroupResponseDto;
import com.ssafy.codemaestro.domain.group.dto.TransferOwnerRequestDto;
import com.ssafy.codemaestro.domain.group.repository.GroupMemberRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupRepository;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.Group;
import com.ssafy.codemaestro.global.entity.GroupMember;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.entity.GroupRole;
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
                .orElseThrow(() -> new BadRequestException("User not found"));

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
                .orElseThrow(() -> new BadRequestException("Group not found"));

        return new GroupDetailResponseDto(group);
    }

    // 그룹 탈퇴
    public void leaveGroup(Long groupId, Long userId) {
        GroupMember groupMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new BadRequestException("Group Member not found"));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BadRequestException("Group not found"));

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
                .orElseThrow(() -> new BadRequestException("Group not found"));

        if (!group.getOwner().getId().equals(request.getCurrentOwnerId())) {
            throw new BadRequestException("Only the current owner can transfer ownership.");
        }

        GroupMember newOwnerMember = groupMemberRepository.findByGroupIdAndUserId(
                        request.getGroupId(), request.getNewOwnerId())
                .orElseThrow(() -> new BadRequestException("The specified user is not a member of this group."));

       GroupMember currentOwnerMember = groupMemberRepository.findByGroupIdAndUserId(
                        request.getGroupId(), request.getCurrentOwnerId())
                .orElseThrow(() -> new BadRequestException("Current owner not found in group members."));

        currentOwnerMember.setRole(GroupRole.MEMBER);
        newOwnerMember.setRole(GroupRole.OWNER);

        User newOwner = newOwnerMember.getUser();
        group.setOwner(newOwner);

        // 저장
        groupMemberRepository.save(currentOwnerMember); // 기존 소유자 정보 저장
        groupMemberRepository.save(newOwnerMember);     // 새로운 소유자 정보 저장
        groupRepository.save(group);                    // 그룹 정보 저장
    }

    // 그룹 검색
    public List<GroupResponseDto> searchGroups(String groupName) {
        List<Group> groups;

        // groupName이 없으면 전체 목록 반환
        if(groupName == null || groupName.trim().isEmpty()) {
            groups = groupRepository.findAll();
        } else {
            groups = groupRepository.findByNameContaining(groupName);
        }

        // DTO 반환
        List<GroupResponseDto> searchGroupsList = new ArrayList<>();
        for(Group group : groups) {
            GroupResponseDto dto = new GroupResponseDto(group);
            searchGroupsList.add(dto);
        }

        return searchGroupsList;
    }
}