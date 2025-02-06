package com.ssafy.codemaestro.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import io.openvidu.java.client.Connection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OpenViduUtil {
    private final WebClient openviduWebClient;
    private final ObjectMapper objectMapper;

    public boolean isModerator(User participant, Conference conference) {
        return conference.getModerator().getId().equals(participant.getId());
    }

    public boolean isAccessCodeCorrect(String accessCode, Conference conference) {
        String conferenceAccessCode = conference.getAccessCode();

        if (conferenceAccessCode == null || conferenceAccessCode.isBlank()) return true;
        else if (accessCode != null) {
            return conferenceAccessCode.equals(accessCode);
        }
        return false;
    }

    public ResponseEntity<Void> sendChangeModeratorSignal(String sessionId, List<Connection> connectionList, User newModerator) {
        ObjectNode jsonBody = objectMapper.createObjectNode();
        ArrayNode connectionIds = objectMapper.createArrayNode();

        connectionList.stream()
                .map(Connection::getConnectionId)
                .forEach(connectionIds::add);

        jsonBody.put("session", sessionId);
        jsonBody.set("to", connectionIds);
        jsonBody.put("type", "moderatorChange");
        jsonBody.put("data", newModerator.getId().toString());

        return openviduWebClient.post()
                .uri("/openvidu/api/signal")
                .body(Mono.just(jsonBody), ObjectNode.class)
                .retrieve()
                .toBodilessEntity()
                .doOnError(e -> System.out.println("sendSignal error: " + e.getMessage()))
                .block();
    }
}
