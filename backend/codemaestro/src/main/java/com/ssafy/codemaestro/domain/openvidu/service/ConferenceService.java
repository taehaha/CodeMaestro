package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.ProgrammingLanguage;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.entity.UserConference;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.exception.openvidu.ConnectionAlreadyExistException;
import com.ssafy.codemaestro.global.exception.openvidu.InvaildAccessCodeException;
import com.ssafy.codemaestro.global.util.OpenViduUtil;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ConferenceService {
    private final ConferenceRepository conferenceRepository;
    private final UserConferenceRepository userConferenceRepository;

    private final OpenViduUtil openViduUtil;

    @Autowired
    public ConferenceService(OpenViduUtil openViduUtil, UserConferenceRepository userConferenceRepository, ConferenceRepository conferenceRepository) {
        this.openViduUtil = openViduUtil;
        this.userConferenceRepository = userConferenceRepository;
        this.conferenceRepository = conferenceRepository;
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
     * 특정 사용자에 대해 주어진 세부 정보를 기반으로 새 회의를 초기화합니다.
     * 제공된 매개변수를 기반으로 새 Conference 엔터티를 생성하고 저장합니다.
     * OpenVidu를 사용해 회의 세션을 생성하며 해당 세션의 ID를 반환합니다.
     * 사용자가 이미 기존 연결을 보유하고 있는 경우 예외를 발생시킵니다.
     *
     * @param moderator        회의를 소유할 사용자.
     * @param title        회의 제목.
     * @param description  회의 설명.
     * @param accessCode   회의 액세스 코드.
     * @param pl           회의와 관련된 프로그래밍 언어.
     * @return 새로 생성된 OpenVidu 세션의 세션 ID.
     * @throws ConnectionAlreadyExistException 사용자가 이미 기존 연결을 보유하고 있는 경우.
     * @throws RuntimeException OpenVidu 서버 통신이나 OpenVidu Java 클라이언트 오류가 발생한 경우.
     */
    @Transactional
    public String initializeConference(User moderator, String title, String description, String accessCode, ProgrammingLanguage pl) {
        // 이미 User가 Connection을 가지고 있으면 throw
        userConferenceRepository.findByUser(moderator).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + moderator.getId() + ", conferenceId : " + conference.getId());
                });

        Conference conference = Conference.builder()
                .moderator(moderator)
                .title(title)
                .description(description)
                .accessCode(accessCode)
                .build();

        conferenceRepository.save(conference);
    
        SessionProperties properties =
                new SessionProperties.Builder()
                .customSessionId(String.valueOf(conference.getId()))
                .build();
    
        try {
            Session session = openVidu.createSession(properties);
            return session.getSessionId();
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Failed to create OpenVidu session", e);
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Failed to create OpenVidu session", e);
        }
    }


    /**
     * 사용자를 OpenVidu의 회의 세션에 연결합니다. 이 메서드는 세션이 존재하는지 확인하고,
     * 사용자가 이미 연결되어 있지 않은지 검증하며, 해당 사용자를 위한 적절한 역할을 가진
     * 연결 토큰을 생성합니다. 또한 사용자-회의 연결 정보를 데이터베이스에 저장합니다.
     *
     * @param participant 회의에 연결하려는 사용자
     * @param conferenceId 사용자가 연결하려는 회의의 ID
     * @return 지정된 회의 세션에서 사용자를 위한 생성된 Connection 객체
     * @throws CannotFindSessionException 회의 세션 또는 회의를 찾을 수 없는 경우
     * @throws ConnectionAlreadyExistException 사용자가 이미 회의에 연결된 경우
     * @throws RuntimeException OpenVidu와 상호작용 중 오류가 발생한 경우
     */
    @Transactional
    public Connection issueToken(User participant, String conferenceId, String accessCode) {
        Session session = openVidu.getActiveSession(conferenceId);

        /* 유효성 검증 */
        if (session == null) {
            throw new CannotFindSessionException("Session을 찾을 수 없습니다. : sessionId : " + conferenceId);
        }

        userConferenceRepository.findByUser(participant).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + participant.getId() + ", conferenceId : " + conferenceId);
                });

        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId))
                .orElseThrow(() -> new CannotFindSessionException("conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));

        if (!openViduUtil.isAccessCodeCorrect(accessCode, conference)) {
            throw new InvaildAccessCodeException("방 번호 : " + conferenceId + " 비밀번호 : " + conference.getAccessCode() + " 입력된 비밀번호 : " + accessCode);
        }

        /* OpenVidu Connection Token 발급 */
        OpenViduRole role = openViduUtil.determineRole(participant, conference);

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .role(role)
                .build();

        Connection connection;
        try {
            connection = session.createConnection(properties);
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        }

        return connection;
    }

    public Conference getConference(String conferenceId) {
        return conferenceRepository.findById(Long.valueOf(conferenceId)).orElseThrow(() -> new CannotFindSessionException("Conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));
    }

    public List<Conference> getAllConferences() {
        return conferenceRepository.findAll();
    }

    public int getParticipantNum(String conferenceId) {
        Session session = openVidu.getActiveSession(conferenceId);
        return session.getConnections().size();
    }

    public List<User> getParticipants(String conferenceId) {
        Long conferenceIdLong = Long.valueOf(conferenceId);
        return userConferenceRepository.findByConference_Id(conferenceIdLong).stream()
                .map(UserConference::getUser)
                .collect(Collectors.toList());
    }
}
