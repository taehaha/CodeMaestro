package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.dto.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.*;
import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import com.ssafy.codemaestro.domain.user.entity.User;
import io.openvidu.java.client.Connection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
     * @param conferenceId
     * @param userDetails
     * @return
     */
    @PostMapping("/{conferenceId}/issue-token")
    public ResponseEntity<ConferenceConnectResponse> issueToken(@PathVariable String conferenceId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        System.out.println("ISSUE TOKEN IN");
        User currentUser = userDetails.getUser();

        Connection connection = openViduService.issueToken(currentUser, conferenceId);

        ConferenceConnectResponse response = new ConferenceConnectResponse(connection.getToken());
        return new ResponseEntity<>((response), HttpStatus.OK);
    }

//    /**
//     * Conection 제거
//     * @param userDetails
//     * @return
//     */
//    //TODO: webhook에서 처리하도록 해야할듯?
//    @DeleteMapping("/{conferneceId}/connection")
//    public ResponseEntity<Void> disconnectConference(@PathVariable String conferneceId, @AuthenticationPrincipal CustomUserDetails userDetails) {
//        User currentUser = userDetails.getUser();
//        openViduService.disconnectConference(currentUser);
//
//        return new ResponseEntity<>(HttpStatus.OK);
//    }
}
