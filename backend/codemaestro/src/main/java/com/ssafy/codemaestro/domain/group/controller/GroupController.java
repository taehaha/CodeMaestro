package com.ssafy.codemaestro.domain.group.controller;

import com.ssafy.codemaestro.domain.group.dto.*;
import com.ssafy.codemaestro.domain.group.service.GroupRequestService;
import com.ssafy.codemaestro.domain.group.service.GroupService;
import lombok.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

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
    @GetMapping("/{userId}")
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



    //    // 그룹 참가 요청
//    @PostMapping("/{groupId}/join-requests")
//    public ResponseEntity<JoinRequestResponse> requestToJoin(
//            @PathVariable Long groupId,
//            @RequestBody @Valid JoinRequestRequest request) {
//        return ResponseEntity.ok(groupService.createJoinRequest(groupId, request));
//    }
//
//    // 참가 요청 수락
//    @PutMapping("/join-requests/{requestId}/accept")
//    public ResponseEntity<Void> acceptJoinRequest(@PathVariable Long requestId) {
//        groupService.acceptJoinRequest(requestId);
//        return ResponseEntity.ok().build();
//    }
//
//    // 참가 요청 거절
//    @PutMapping("/join-requests/{requestId}/reject")
//    public ResponseEntity<Void> rejectJoinRequest(@PathVariable Long requestId) {
//        groupService.rejectJoinRequest(requestId);
//        return ResponseEntity.ok().build();
//    }


//    // 대기 중인 요청 조회
}