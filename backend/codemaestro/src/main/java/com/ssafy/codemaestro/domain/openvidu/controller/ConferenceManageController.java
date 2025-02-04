package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.auth.dto.CustomUserDetails;
import com.ssafy.codemaestro.domain.openvidu.dto.ConferenceKickUserRequest;
import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import com.ssafy.codemaestro.domain.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/conference/manage")
public class ConferenceManageController {
    OpenViduService openViduService;

    @Autowired
    public ConferenceManageController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

    @DeleteMapping("/user")
    public ResponseEntity<Void> kickUser(@RequestBody ConferenceKickUserRequest dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();

        boolean result = openViduService.kickUserFromConference(user, dto.getConferenceId(), dto.getTargetUserId());

        if (result) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
