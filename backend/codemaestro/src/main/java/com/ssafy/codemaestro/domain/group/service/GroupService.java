package com.ssafy.codemaestro.domain.group.service;

import com.ssafy.codemaestro.domain.group.dto.*;
import com.ssafy.codemaestro.domain.group.repository.*;
import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.*;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;


@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final GroupConferenceHistoryRepository groupConferenceHistoryRepository;
    private final GroupConferenceMemberHistoryRepository memberHistoryRepository;
    private  final ConferenceRepository conferenceRepository;

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

       groupJoinRequestRepository.deleteByGroup(group);



       groupRepository.delete(group);
    }

    // 전체 그룹 조회
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
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

        // 그룹장이 탈퇴하려는 경우 실패
        if (group.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Group owner cannot leave the group");
        }

        // 그룹 멤버 수 감소
        group.setCurrentMembers(group.getCurrentMembers() - 1);
        groupRepository.save(group);

        // group_member 컬럼 삭제
        groupMemberRepository.delete(groupMember);
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

    // 그룹 랭킹 조회
    public List<GroupRankingResponseDto> getGroupByTotalScore(int year, int month) {
        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1);

        return groupConferenceHistoryRepository.findTopGroupsByTotalScore(
                startDate,
                endDate,
                PageRequest.of(0, 10)
        );
    }

    // 유저별 그룹 회의 참여 정보 조회
    public GroupConferenceStateResponse getUserConferenceStats(Long groupId, Long userId) {
        // 그룹 전체 회의 수 조회
        Integer totalConferences = groupConferenceHistoryRepository.countByGroupId(groupId);

        // 참여 이력 조회
        List<GroupConferenceMemberHistory> histories =
                memberHistoryRepository.findByParticipantIdAndGroupConferenceHistory_GroupId(userId, groupId);

        // DTO 반환
        List<ConferenceParticipationDto> participations = new ArrayList<>();
        for(GroupConferenceMemberHistory history : histories) {
            ConferenceParticipationDto dto = ConferenceParticipationDto.from(history);
            participations.add(dto);
        }

        return new GroupConferenceStateResponse(totalConferences, participations);
    }

    // 최근 5개의 회의별 그룹원 참여 여부
    public GroupConferenceAttendanceResponse getGroupAttendance(Long groupId) {
        // 최근 5개의 회의 조회
        Pageable pageable = PageRequest.of(0, 5);
        List<GroupConferenceHistory> recentConferences = groupConferenceHistoryRepository
                .findTop5ByGroupIdOrderByStartTimeDesc(groupId, pageable);

        Group group = groupConferenceHistoryRepository.findGroupWithMembers(groupId);

        List<ConferenceInfo> conferenceInfos = new ArrayList<>(); // 저장 필요
        for(GroupConferenceHistory conference : recentConferences) {
            conferenceInfos.add(new ConferenceInfo(
                    conference.getId(),
                    conference.getTitle(),
                    conference.getStartTime()
            ));
        }

        // 회의별 참석 현황 기록
        Map<Long, ConferenceAttendanceDto> attendanceMap = new HashMap<>();
        // 5개의 회의 순회하면서
        for(GroupConferenceHistory conference : recentConferences) {
            // 회의에 참석한 사람들의 ID 저장(중복 없음)
            Set<Long> attendees = new HashSet<>();
            for(GroupConferenceMemberHistory history : conference.getMemberHistories()) {
                attendees.add(history.getParticipant().getId());
            }

            // 그룹의 모든 멤버 돌면서 참석했는지 확인하고 기록
            for(GroupMember groupMember : group.getMembers()) {
                User member = groupMember.getUser();
                Long memberId = member.getId();

                if(!attendanceMap.containsKey(memberId)) {
                    attendanceMap.put(memberId, new ConferenceAttendanceDto(
                            memberId,
                            member.getNickname(),
                            new ArrayList<>(),
                            0.0
                    ));
                }
                attendanceMap.get(memberId).getAttendanceStatus()
                        .add(attendees.contains(memberId));
            }
        }

        // 참석률 계산
        List<ConferenceAttendanceDto> memberAttendance = new ArrayList<>();
        for(ConferenceAttendanceDto dto : attendanceMap.values()) {
            int attendCount = 0;
            for(Boolean attend : dto.getAttendanceStatus()) {
                if(attend) attendCount++;
            }

            dto.setAttendanceRate((double) attendCount * 100 / recentConferences.size());
            memberAttendance.add(dto);
        }

        return new GroupConferenceAttendanceResponse(conferenceInfos, memberAttendance);
    }

    // 현재 진행중인 그룹 회의있는지 확인

    public ResponseEntity<Long> checkCurrentGroupConference(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not Found"));

        Optional<Conference> activeConference = conferenceRepository.findByGroup(group);

        if(activeConference.isPresent()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .body(activeConference.get().getId());
        }

        return ResponseEntity.ok().build();
    }
}