package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.entty.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.*;
import com.ssafy.codemaestro.domain.openvidu.service.ConferenceService;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.ConferenceTag;
import com.ssafy.codemaestro.global.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/conference")
public class ConferenceController {
    private final ConferenceService conferenceService;

    @Autowired
    public ConferenceController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    /**
     * 회의실을 생성합니다.
     * @param dto
     * @param userDetails
     * @return
     */
    @PostMapping("/create")
    public ResponseEntity<ConferenceInitResponse> initializeConference(@ModelAttribute ConferenceInitRequest dto,
                                                                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        System.out.println(dto);

        String conferenceId = conferenceService.initializeConference(
                currentUser,
                dto.getTitle(),
                dto.getDescription(),
                dto.getAccessCode(),
                dto.getGroupId(),
                dto.getTagNameList(),
                dto.getThumbnail()
        );

        return new ResponseEntity<>(new ConferenceInitResponse(conferenceId), HttpStatus.CREATED);

    }

    /**
     * Connection token을 생성해서 반환해줌.
     * DB에 상태를 업데이트 해주지 않는다. -> WebHook에서 처리해줌
     * @return
     */
    @PostMapping("/{conferenceId}/issue-token")
    public ResponseEntity<ConferenceConnectResponse> issueToken(@PathVariable String conferenceId,
                                                                @RequestBody(required = false) ConferenceIssueTokenRequest dto,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        String accessCode = dto.getAccessCode();

        ConferenceConnectResponse response = conferenceService.issueToken(currentUser, conferenceId, accessCode);

        return new ResponseEntity<>((response), HttpStatus.OK);
    }

    /**
     * 모든 회의의 정보를 가공해서 리턴함
     * @return
     */
    @GetMapping("")
    @Transactional(readOnly = true) // LAZY 로딩 문제 해결
    public ResponseEntity<List<ConferenceInfoResponse>> getAllConferenceInfo() {
        List<Conference> conferenceList = conferenceService.getAllConferences();

        List<ConferenceInfoResponse> responseList = new ArrayList<>();

        for (Conference conference : conferenceList) {
            int participantNum = conferenceService.getParticipantNum(String.valueOf(conference.getId()));

            ConferenceInfoResponse conferenceInfo = ConferenceInfoResponse.builder()
                    .conferenceId(conference.getId().toString())
                    .title(conference.getTitle())
                    .description(conference.getDescription())
                    .isPrivate(conference.getAccessCode() != null)
                    .thumbnailUrl(conference.getThumbnailUrl())
                    .hostNickName(conference.getModerator().getNickname())
                    .participantNum(participantNum)
                    .tagNameList(ConferenceTag.toTagNameList(conference.getTags()))
                    .createdAt(conference.getCreatedAt())
                    .build();

            responseList.add(conferenceInfo);
        }

        return new ResponseEntity<>(responseList, HttpStatus.OK);
    }

    /**
     * 특정 컨퍼런스의 정보를 반환함
     * @param conferenceId
     * @return
     */
    @GetMapping("/{conferenceId}")
    @Transactional(readOnly = true) // LAZY 로딩 문제 해결
    public ResponseEntity<ConferenceInfoResponse> conferenceInfo(@PathVariable String conferenceId) {
        Conference conference = conferenceService.getConference(conferenceId);

        int participantNum = conferenceService.getParticipantNum(String.valueOf(conference.getId()));

        ConferenceInfoResponse conferenceInfo = ConferenceInfoResponse.builder()
                .conferenceId(conferenceId)
                .title(conference.getTitle())
                .description(conference.getDescription())
                .isPrivate(conference.getAccessCode() != null)
                .thumbnailUrl(conference.getThumbnailUrl())
                .hostNickName(conference.getModerator().getNickname())
                .participantNum(participantNum)
                .tagNameList(ConferenceTag.toTagNameList(conference.getTags()))
                .createdAt(conference.getCreatedAt())
                .build();

        return new ResponseEntity<>(conferenceInfo, HttpStatus.OK);
    }

    /**
     * 컨퍼런스 정보를 갱신함
     * @param conferenceId
     * @param dto
     * @return
     */
    @PutMapping("/{conferenceId}")
    public ResponseEntity<ConferenceInfoResponse> updateConference(@PathVariable String conferenceId,
                                                                   @ModelAttribute ConferenceUpdateRequest dto) {
        conferenceService.updateConference(
                conferenceId,
                dto.getTitle(),
                dto.getDescription(),
                dto.getAccessCode(),
                dto.getThumbnailFile()
        );

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 특정 회의의 관리자를 업데이트합니다.
     * @param conferenceId 회의의 고유 식별자
     * @param newModeratorUserId 새로운 관리자의 사용자 ID를 포함한 요청 데이터
     * @param userDetails 현재 로그인된 사용자의 인증 정보
     * @return 작업 결과를 나타내는 HTTP 상태를 포함한 ResponseEntity
     */
    @PatchMapping("/{conferenceId}/moderator/{newModeratorUserId}")
    public ResponseEntity<Void> moderator(@PathVariable  String conferenceId,
                                          @PathVariable Long newModeratorUserId,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        conferenceService.changeModerator(conferenceId, currentUser, newModeratorUserId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * targetUserId를 회의실에서 강퇴함.
     * @param conferenceId
     * @param targetUserId
     * @param userDetails
     * @return
     */
    @DeleteMapping("/{conferenceId}/user/{targetUserId}")
    public ResponseEntity<Void> kickOut(@PathVariable String conferenceId,
                                        @PathVariable Long targetUserId,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        conferenceService.kick(conferenceId, currentUser, targetUserId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * targetUserId의 캠을 끔
     * @param conferenceId
     * @param targetUserId
     * @param userDetails
     * @return
     */
    @DeleteMapping("/{conferenceId}/video/{targetUserId}")
    public ResponseEntity<Void> unpublishVideo(@PathVariable String conferenceId,
                                          @PathVariable Long targetUserId,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        conferenceService.unpublishVideo(conferenceId, currentUser, targetUserId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * targetUserId의 오디오를 끔
     * @param conferenceId
     * @param targetUserId
     * @param userDetails
     * @return
     */
    @DeleteMapping("/{conferenceId}/audio/{targetUserId}")
    public ResponseEntity<Void> unpublishAudio(@PathVariable String conferenceId,
                                          @PathVariable Long targetUserId,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        conferenceService.unpublishAudio(conferenceId, currentUser, targetUserId);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
