package com.ssafy.codemaestro.domain.group.controller;

import com.ssafy.codemaestro.domain.group.dto.*;
import com.ssafy.codemaestro.domain.group.service.GroupRequestService;
import com.ssafy.codemaestro.domain.group.service.GroupService;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import lombok.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final GroupRequestService groupRequestService;

    // 전체 그룹 조회
    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> getAllGroups() {
        List<GroupResponseDto> groups = groupService.getAllGroups();
        return ResponseEntity.ok(groups);
    }

    // 유저별 참여 그룹 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupResponseDto>> getUserGroups(@PathVariable Long userId) {
        List<GroupResponseDto> userGroups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(userGroups);
    }

    // 그룹 상세 조회
    @GetMapping("/{groupId}/detail")
    public ResponseEntity<GroupDetailResponseDto> getGroupsDetails(@PathVariable Long groupId) {
        GroupDetailResponseDto groupDetail = groupService.getGroupDetails(groupId);
        return ResponseEntity.ok(groupDetail);
    }

    //  그룹 생성
    @PostMapping
    public ResponseEntity<GroupResponseDto> createGroup(@RequestBody GroupRequestDto requestDto) {
        return ResponseEntity.ok(groupService.createGroup(requestDto));
    }

    // 그룹 삭제
    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.ok("Group delete Ok");
    }

    // 그룹 탈퇴
    @DeleteMapping("/leave")
    public ResponseEntity<?> leaveGroup(@RequestBody GroupLeaveRequestDto request) {
        groupService.leaveGroup(request.getGroupId(), request.getUserId());
        return ResponseEntity.ok("Group leave Ok");
    }

    // 그룹장 권한 위임
    @PutMapping("/transfer-owner")
    public ResponseEntity<String> transferGroupOwner(@RequestBody TransferOwnerRequestDto request) {
        groupService.transferOwner(request);
        return ResponseEntity.ok("Group ownership has been successfully transferred.");
    }

    // 그룹 가입 요청
    @PostMapping("/requests")
    public ResponseEntity<?> sendGroupJoinRequest(@RequestBody GroupJoinRequestDto request) {
        groupRequestService.sendGroupJoinRequest(request);
        return ResponseEntity.ok("Group Join Request Ok");
    }

    // 가입 요청 수락
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptGroupJoinRequest(@PathVariable Long requestId) {
        groupRequestService.acceptGroupJoinRequest(requestId);
        return ResponseEntity.ok("Group Join Request ACCEPT Ok");
    }


    // 가입 요청 거절
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectGroupJoinRequest(@PathVariable Long requestId) {
        groupRequestService.rejectGroupJoinRequest(requestId);
        return ResponseEntity.ok("Group Join Request REJECT Ok");
    }

    // 대기 중인 요청 조회
    @GetMapping("/requests/{userId}/pending")
    public ResponseEntity<List<GroupJoinResponseDto>> getPendingGroupRequest(@PathVariable Long userId) {
        return ResponseEntity.ok(groupRequestService.getPendingGroupRequest(userId));
    }



    // 그룹 검색
    @GetMapping("/search")
    public ResponseEntity<List<GroupResponseDto>> searchGroups(@RequestParam(required = false) String groupName) {
        List<GroupResponseDto> searchGroups = groupService.searchGroups(groupName);
        return ResponseEntity.ok(searchGroups);
    }

    // 그룹 랭킹 조회
    @GetMapping("/rankings")
    public ResponseEntity<List<GroupRankingResponseDto>> getGroupRankings(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        // 만약 param 안넘어오면 자동으로 오늘시간 설정해서 주기
        if(year == null || month == null) {
            LocalDateTime now = LocalDateTime.now();
            year = now.getYear();
            month = now.getMonthValue();
        }

        List<GroupRankingResponseDto> rankings = groupService.getGroupByTotalScore(year, month);

        if (rankings == null || rankings.isEmpty()) {
            throw new BadRequestException("No group rankings found for the specified year and month.");
        }

        return ResponseEntity.ok(rankings);
    }

    @GetMapping("/{groupId}/conferences/my-stats")
    public ResponseEntity<GroupConferenceStateResponse> getMyConferenceStats(
        @PathVariable Long groupId,
        @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername());
        GroupConferenceStateResponse stats = groupService.getUserConferenceStats(groupId, userId);
        System.out.println(stats);
        return ResponseEntity.ok(stats);
    }

    // 최근 5개의 회의별 그룹원 참여 여부
    @GetMapping("/{groupId}/attendance")
    public ResponseEntity<GroupConferenceAttendanceResponse> getGroupAttendance(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupAttendance(groupId));
    }
}