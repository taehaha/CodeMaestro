package com.ssafy.codemaestro.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ssafy.codemaestro.domain.openvidu.vo.OpenviduSignalType;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import io.openvidu.java.client.Connection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenViduUtil {
    private final WebClient openviduWebClient;
    private final ObjectMapper objectMapper;

    public boolean isAccessCodeCorrect(String accessCode, Conference conference) {
        String conferenceAccessCode = conference.getAccessCode();

        if (conferenceAccessCode == null || conferenceAccessCode.isBlank()) return true;
        else if (accessCode != null) {
            return conferenceAccessCode.equals(accessCode);
        }
        return false;
    }

    public ResponseEntity<Void> sendSignal(String conferenceId, List<Connection> connectionList, OpenviduSignalType signalType, String data) {
        ObjectNode jsonBody = objectMapper.createObjectNode();
        ArrayNode connectionIds = objectMapper.createArrayNode();
        connectionList.stream()
                .map(Connection::getConnectionId)
                .forEach(connectionIds::add);

        jsonBody.put("session", conferenceId);
        jsonBody.set("to", connectionIds);
        jsonBody.put("type", signalType.toString());
        jsonBody.put("data", data);

        return openviduWebClient.post()
                .uri("/openvidu/api/signal")
                .body(Mono.just(jsonBody), ObjectNode.class)
                .retrieve()
                .toBodilessEntity()
                .doOnError(e -> {
                    log.error("sendSignal error: " + e.getMessage());
                    throw new RuntimeException("Openvidu Signaling에 문제가 있습니다.");
                })
                .block();
    }
}
