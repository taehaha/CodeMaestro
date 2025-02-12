package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.vo.ConnectionDataVo;
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

@Slf4j
@Service
public class OpenviduWebHookService {
    private final UserRepository userRepository;
    private final ConferenceRepository conferenceRepository;
    private final UserConferenceRepository userConferenceRepository;

    @Autowired
    public OpenviduWebHookService(UserRepository userRepository, ConferenceRepository conferenceRepository, UserConferenceRepository userConferenceRepository) {
        this.userRepository = userRepository;
        this.conferenceRepository = conferenceRepository;
        this.userConferenceRepository = userConferenceRepository;
    }

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    private OpenVidu Openvidu;

    @PostConstruct
    private void init() {
        Openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    @Transactional
    public void onSessionDestroyed(String sessionId) {
        log.debug("OpenVidu Webhook : Session Destroyed:");

        userConferenceRepository.deleteByConferenceId(Long.valueOf(sessionId));
        conferenceRepository.deleteById(Long.valueOf(sessionId));
    }

    public void onParticipantJoined(String serverDataJson, String sessionId, String connectionId) {
        log.debug("OpenVidu Webhook : Participant Joined:");
        // screenShare용 connection 구분
        if (serverDataJson.isBlank()) return;

        ConnectionDataVo connectionVo = ConnectionDataVo.fromJson(serverDataJson);
        // AccessToken에서 유저 ID 파싱
        String participantId = connectionVo.getUserId();
        log.debug("Connection 정보 : " + connectionVo);
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
        log.debug("참가자 정보 저장 완료");
    }

    @Transactional
    public void onParticipantLeft(String connectionId) {
        log.debug("OpenVidu Webhook : Participant Left:");

        userConferenceRepository.deleteByConnectionId(connectionId);
    }
}
