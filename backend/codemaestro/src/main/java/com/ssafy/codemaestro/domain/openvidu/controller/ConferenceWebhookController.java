package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.openvidu.service.OpenViduWebHookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 여기서 접속 관련 DB 동기화를 실행하면 됨
 */
@RestController
@RequestMapping("/conference")
public class ConferenceWebhookController {
    OpenViduWebHookService openViduWebHookService;

    @Autowired
    public ConferenceWebhookController(OpenViduWebHookService openViduWebHookService) {
        this.openViduWebHookService = openViduWebHookService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> OpenViduWebhook(@RequestBody Map<String, Object> eventInfo) {
        eventInfo.entrySet().forEach(System.out::println);

        String event = (String) eventInfo.get("event");

        // event 별 분기
        if ("sessionCreated".equals(event)) {

        } else if ("sessionDestroyed".equals(event)) {
            String sessionId = (String) eventInfo.get("sessionId");
            openViduWebHookService.onSessionDestroyed(Long.valueOf(sessionId));

        } else if ("participantJoined".equals(event)) {
            String sessionId = (String) eventInfo.get("sessionId");
            String connectionId = (String) eventInfo.get("connectionId");
            String clientData = (String) eventInfo.get("clientData");
            openViduWebHookService.onParticipantJoined(clientData, sessionId, connectionId);

        } else if ("participantLeft".equals(event)) {
            String connectionId = (String) eventInfo.get("connectionId");
            openViduWebHookService.onParticipantLeft(connectionId);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
