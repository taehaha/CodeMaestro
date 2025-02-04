package com.ssafy.codemaestro.domain.openvidu.service;

import com.google.gson.Gson;
import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.entity.UserConference;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.util.JwtUtil;
import io.openvidu.java.client.OpenVidu;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
public class OpenViduWebHookService {
    private final UserRepository userRepository;
    private final ConferenceRepository conferenceRepository;
    private final UserConferenceRepository userConferenceRepository;

    private final JwtUtil jwtUtil;

    @Autowired
    public OpenViduWebHookService(UserRepository userRepository, ConferenceRepository conferenceRepository, UserConferenceRepository userConferenceRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.conferenceRepository = conferenceRepository;
        this.userConferenceRepository = userConferenceRepository;
        this.jwtUtil = jwtUtil;
    }

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    private OpenVidu openVidu;

    @PostConstruct
    private void init() {
        openVidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    @Transactional
    public void onSessionDestroyed(Long sessionId) {
        log.debug("OpenVidu Webhook : Session Destroyed:");

        userConferenceRepository.deleteByConferenceId(sessionId);
        conferenceRepository.deleteById(sessionId);
    }

    @Transactional
    public void onParticipantJoined(String clientData, String sessionId, String connectionId) {
        Map<String, Object> map = clientDataParser(clientData);

        String accessToken = (String) map.get("accessToken");

        // AccessToken에서 유저 ID 파싱
        String participantId = jwtUtil.getId(accessToken);

        log.debug("OpenVidu Webhook : Participant Joined: userId : " + participantId);

        User participant = userRepository.findById(Long.valueOf(participantId)).orElseThrow(
                () -> new RuntimeException("OpenVidu WebHook : User not found")
        );
        Conference conference = conferenceRepository.findById(Long.valueOf(sessionId)).orElseThrow(
                () -> new CannotFindSessionException("OpenVidu WebHook : Session not found")
        );

        UserConference newUserConference = UserConference.builder()
                .user(participant)
                .connectionId(connectionId)
                .conference(conference)
                .build();

        userConferenceRepository.save(newUserConference);
    }

    @Transactional
    public void onParticipantLeft(String connectionId) {
        log.debug("OpenVidu Webhook : Participant Joined:");

        userConferenceRepository.deleteByConnectionId(connectionId);
    }

    private Map<String, Object> clientDataParser(String string) {
        Gson gson = new Gson();
        Map<String, Object> map = gson.fromJson(string, Map.class);

        return map;
    }
}
