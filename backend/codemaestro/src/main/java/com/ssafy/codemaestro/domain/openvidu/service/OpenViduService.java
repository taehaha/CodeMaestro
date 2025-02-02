package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.ProgrammingLanguage;
import com.ssafy.codemaestro.global.entity.UserConference;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class OpenViduService {
    private ConferenceRepository conferenceRepository;
    private UserConferenceRepository userConferenceRepository;

    @Autowired
    public OpenViduService(ConferenceRepository conferenceRepository, UserConferenceRepository userConferenceRepository) {
        this.conferenceRepository = conferenceRepository;
        this.userConferenceRepository = userConferenceRepository;
    }

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    private OpenVidu openVidu;

    /**
     * Bean으로 생성되면서 OpenVidu도 초기화됨
     */
    @PostConstruct
    private void init() {
        openVidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    /**
     * 새로운 세션을 초기화하여 회의 기록을 생성하고, 이를 저장소에 저장한 다음,
     * OpenVidu 서버에 해당 세션을 생성하려고 시도합니다.
     *
     * @param owner 세션을 소유한 사용자
     * @param title 세션의 제목
     * @param description 세션의 설명
     * @param accessCode 세션의 접근 코드
     * @param pl 세션과 연관된 프로그래밍 언어
     * @return 생성된 회의의 ID를 포함하는 {@code Optional} 객체 (성공 시), 실패 시 비어 있는 {@code Optional}
     */
    public Optional<String> initializeConference(User owner, String title, String description, String accessCode, ProgrammingLanguage pl) {
        Conference conference = Conference.builder()
                .owner(owner)
                .thumbnail(null)
                .title(title)
                .description(description)
                .active(true)
                .accessCode(accessCode)
                .programmingLanguage(pl)
                .build();

        conferenceRepository.save(conference);
        SessionProperties properties =
                new SessionProperties.Builder()
                .customSessionId(String.valueOf(conference.getId()))
                .build();

        try {
            openVidu.createSession(properties);
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
        }

        return Optional.ofNullable(String.valueOf(conference.getId()));
    }


    /**
     * sessionId로 식별되는 세션에 사용자를 연결하고, 성공 시 연결 토큰을 반환합니다.
     * 주어진 sessionId에 해당하는 활성 세션이 없을 경우, 비어 있는 {@code Optional}을 반환합니다.
     * 이 메서드는 참가자 정보를 저장하고 OpenVidu를 통해 세션 생성도 처리합니다.
     *
     * @param participant 세션에 연결하려는 사용자
     * @param conferenceId 연결할 회의 세션의 식별자
     * @return 세션 생성에 성공하면 연결 토큰을 포함하는 {@code Optional},
     *         주어진 sessionId에 활성 세션이 없으면 비어 있는 {@code Optional}
     */
    public Optional<String> connectConference(User participant, String conferenceId) {
        Session session = openVidu.getActiveSession(conferenceId);
        // 생성되어있는 세션이 없을 경우 null을 반환함
        if (session == null) {
            return Optional.empty();
        }

        // 참가자 정보 저장하기
        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId)).get();

        UserConference userConference = UserConference.builder()
                .user(participant)
                .conference(conference)
                .build();

        userConferenceRepository.save(userConference);

        // OpenVidu 토큰 발급
        String connectionToken = null;
        try {
            Connection connection = session.createConnection(new ConnectionProperties.Builder().build());
            connectionToken = connection.getToken();
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
        }

        return Optional.ofNullable(connectionToken);
    }

    /**
     * 사용자를 회의 세션에서 연결 해제하고 정리 작업을 수행합니다.
     *
     * @param user 회의에서 연결을 해제하려는 사용자
     * @param conferenceId 연결을 해제할 회의 세션의 고유 식별자
     * @param connectionToken 회의 세션에서 사용자의 연결에 관련된 토큰
     * @return 연결 해제와 정리 작업이 성공적으로 수행되면 true, 그렇지 않으면 false
     */
    public boolean disconnectConference(User user, String conferenceId, String connectionToken) {
        Session session = openVidu.getActiveSession(conferenceId);

        userConferenceRepository.deleteByUserId(user.getId());
        if (session == null) return false;

        // connectionToken에 해당하는 Connection 객체 찾기
        Connection connection = null;
        for (Connection conn : session.getConnections()) {
            if (conn.getToken().equals(connectionToken)) {
                connection = conn;
            }
        }

        if (connection == null) return false;

        try {
            session.forceDisconnect(connection);

            if (session.getConnections().isEmpty()) {
                conferenceRepository.deleteById(Long.valueOf(conferenceId));
            }
        } catch (OpenViduHttpException | OpenViduJavaClientException e) {
            log.error("Openvidu disconnectConference 실행 중 오류.");
            log.error(e.getMessage());
            return false;
        }

        return true;
    }

    //TODO: Openvidu 문서 보고 더 해봐야 할거같음.. 보규형이랑 협업해서 작동 확인하기.

}
