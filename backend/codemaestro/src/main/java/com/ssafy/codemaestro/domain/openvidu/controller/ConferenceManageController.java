package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/conference/{conferenceId}")
public class ConferenceManageController {
    private final OpenViduService openViduService;

    @Autowired
    public ConferenceManageController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

//    @GetMapping("/kick")
//    public ResponseEntity<Void> kickParticipant(@PathVariable String conferenceId) {
//
//    }
}
