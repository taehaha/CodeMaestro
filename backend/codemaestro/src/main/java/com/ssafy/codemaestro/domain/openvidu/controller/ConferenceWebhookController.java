package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.openvidu.service.OpenviduWebHookService;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@RestController
@RequestMapping("/conference")
public class ConferenceWebhookController {
    OpenviduWebHookService openviduWebHookService;

    @Autowired
    public ConferenceWebhookController(OpenviduWebHookService openviduWebHookService) {
        this.openviduWebHookService = openviduWebHookService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> OpenViduWebhook(@RequestBody Map<String, Object> eventInfo) {
        log.debug("OpenVidu Webhook Event triggered.");
        eventInfo.entrySet().forEach(System.out::println);

        String event = (String) eventInfo.get("event");

        // event 별 분기
        if ("sessionCreated".equals(event)) {

        } else if ("sessionDestroyed".equals(event)) {
            String sessionId = (String) eventInfo.get("sessionId");
            Long timestamp = (Long) eventInfo.get("timestamp");
            int duration = (int) eventInfo.get("duration");
            openviduWebHookService.onSessionDestroyed(sessionId, timestamp, duration);

        } else if ("participantJoined".equals(event)) {
            String sessionId = (String) eventInfo.get("sessionId");
            String connectionId = (String) eventInfo.get("connectionId");
            String serverData = (String) eventInfo.get("serverData");
            Long timestamp = (Long) eventInfo.get("timestamp");
            openviduWebHookService.onParticipantJoined(serverData, sessionId, connectionId, timestamp);

        } else if ("participantLeft".equals(event)) {
            String connectionId = (String) eventInfo.get("connectionId");
            Long timestamp = (Long) eventInfo.get("timestamp");
            int duration = (int) eventInfo.get("duration");
            openviduWebHookService.onParticipantLeft(connectionId, timestamp, duration);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
