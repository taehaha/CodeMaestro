package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.dto.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.*;
import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import com.ssafy.codemaestro.domain.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/conference")
public class OpenViduController {
    private final OpenViduService openViduService;

    @Autowired
    public OpenViduController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    /**
     * 제공된 요청 세부 정보를 기반으로 새로운 회의 세션을 초기화합니다.
     * 현재 로그인한 사용자를 인증하고 주어진 매개변수로 세션을 생성합니다.
     *
     * @param dto 초기화할 회의 세션의 세부 정보로,
     *            제목, 설명, 접근 코드 및 프로그래밍 언어를 포함합니다.
     * @return 세션이 성공적으로 생성된 경우 회의 ID를 포함한 ResponseEntity,
     *         실패한 경우 BAD_REQUEST 상태를 반환합니다.
     */
    @PostMapping("/init")
    public ResponseEntity<ConferenceInitResponse> initializeConference(@RequestBody ConferenceInitRequest dto) {
        // 현재 유저 정보 가져오기
        User currentUser = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser();
        Optional<String> optionalConferenceId =
                openViduService.initializeConference(
                        currentUser,
                        dto.getTitle(),
                        dto.getDescription(),
                        dto.getAccessCode(),
                        dto.getProgrammingLanguage()
                );

        if (optionalConferenceId.isPresent()) {
            String conferenceId = optionalConferenceId.get();
            return new ResponseEntity<>(new ConferenceInitResponse(conferenceId), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 인증된 사용자를 기존 회의 세션에 연결합니다.
     * 사용자를 검증하고 주어진 회의 ID에 대한 연결 토큰을 가져옵니다.
     *
     * @param dto 연결할 회의의 Request
     * @return 연결에 성공하면 HTTP 상태 OK와 함께 연결 토큰을 포함한 ResponseEntity를 반환하고,
     *         연결이 설정되지 않으면 HTTP 상태 NOT_FOUND를 반환합니다.
     */
    @PostMapping("/connect")
    public ResponseEntity<ConferenceConnectResponse> connectToConference(@RequestBody ConferenceConnectRequest dto) {
        User currentUser = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser();

        Optional<String> optionalConnectionToken = openViduService.connectConference(currentUser, dto.getConferenceId());

        if (optionalConnectionToken.isPresent()) {
            String connectionToken = optionalConnectionToken.get();
            return new ResponseEntity<>(new ConferenceConnectResponse(connectionToken), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // TODO: 프론트에서 작동이 안됨 고쳐야 함
    @PostMapping("/disconnect")
    public ResponseEntity<Void> disconnectConference(@RequestBody ConferenceDisconnectRequest dto) {
        User currentUser = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser();
        log.error("disconnect Controller");

        boolean result = openViduService.disconnectConference(currentUser, dto.getConferenceId(), null);

        if (result) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
