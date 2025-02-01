package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.dto.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.ConferenceInitRequest;
import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import com.ssafy.codemaestro.domain.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.hibernate5.SpringSessionContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/conference")
public class OpenViduController {
    private final OpenViduService openViduService;

    @Autowired
    public OpenViduController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    @PostMapping("/init")
    public ResponseEntity<String> initializeConference(@RequestBody ConferenceInitRequest dto) {
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
            return new ResponseEntity<>(optionalConferenceId.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/connect/{conferenceId}")
    public ResponseEntity<String> connectToConference(@PathVariable String conferenceId) {
        User currentUser = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser();

        Optional<String> optionalConnectionToken = openViduService.connectConference(currentUser, conferenceId);

        if (optionalConnectionToken.isPresent()) {
            return new ResponseEntity<>(optionalConnectionToken.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
