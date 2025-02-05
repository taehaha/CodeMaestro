package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.dto.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.*;
import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import io.openvidu.java.client.Connection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/conference")
public class ConferenceController {
    private final OpenViduService openViduService;

    @Autowired
    public ConferenceController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    @PostMapping("/create")
    public ResponseEntity<ConferenceInitResponse> initializeConference(@RequestBody ConferenceInitRequest dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 현재 유저 정보 가져오기
        User currentUser = userDetails.getUser();
        String conferenceId =
                openViduService.initializeConference(
                        currentUser,
                        dto.getTitle(),
                        dto.getDescription(),
                        dto.getAccessCode(),
                        dto.getProgrammingLanguage()
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

        Connection connection = openViduService.issueToken(currentUser, conferenceId, accessCode);

        ConferenceConnectResponse response = new ConferenceConnectResponse(connection.getToken());
        return new ResponseEntity<>((response), HttpStatus.OK);
    }

    /**
     * 모든 회의의 정보를 가공해서 리턴함
     * @return
     */
    @GetMapping("")
    public ResponseEntity<List<ConferenceInfoResponse>> getAllConferenceInfo() {
        List<Conference> conferenceList = openViduService.getAllConferences();

        List<ConferenceInfoResponse> responseList = new ArrayList<>();

        for (Conference conference : conferenceList) {
            int participantNum = openViduService.getParticipantNum(String.valueOf(conference.getId()));

            ConferenceInfoResponse conferenceInfo = ConferenceInfoResponse.builder()
                    .conferenceId(conference.getId().toString())
                    .title(conference.getTitle())
                    .description(conference.getDescription())
                    .thumbnailUrl(conference.getThumbnailUrl())
                    .programmingLanguage(conference.getProgrammingLanguage())
                    .hostNickName(conference.getOwner().getNickname())
                    .participantNum(participantNum)
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
    public ResponseEntity<ConferenceInfoResponse> conferenceInfo(@PathVariable String conferenceId) {
        Conference conference = openViduService.getConference(conferenceId);

        int participantNum = openViduService.getParticipantNum(String.valueOf(conference.getId()));

        ConferenceInfoResponse conferenceInfo = ConferenceInfoResponse.builder()
                .conferenceId(conferenceId)
                .title(conference.getTitle())
                .description(conference.getDescription())
                .thumbnailUrl(conference.getThumbnailUrl())
                .programmingLanguage(conference.getProgrammingLanguage())
                .hostNickName(conference.getOwner().getNickname())
                .participantNum(participantNum)
                .createdAt(conference.getCreatedAt())
                .build();

        return new ResponseEntity<>(conferenceInfo, HttpStatus.OK);
    }
}
