package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.global.entity.Conference;
import com.ssafy.codemaestro.global.entity.ProgrammingLanguage;
import com.ssafy.codemaestro.global.entity.UserConference;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindConnectionException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.exception.openvidu.ConnectionAlreadyExistException;
import com.ssafy.codemaestro.global.util.OpenViduUtil;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class OpenViduService {
    private ConferenceRepository conferenceRepository;
    private UserConferenceRepository userConferenceRepository;

    private OpenViduUtil openViduUtil;

    @Autowired
    public OpenViduService(OpenViduUtil openViduUtil, UserConferenceRepository userConferenceRepository, ConferenceRepository conferenceRepository) {
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
    @Transactional
    public String initializeConference(User owner, String title, String description, String accessCode, ProgrammingLanguage pl) {
        // 이미 User가 Connection을 가지고 있으면 throw
        userConferenceRepository.findByUser(owner).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + owner.getId() + ", conferenceId : " + conference.getId());
                });

        Conference conference = Conference.builder()
                .owner(owner)
                .title(title)
                .description(description)
                .accessCode(accessCode)
                .programmingLanguage(pl)
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
    public Connection issueToken(User participant, String conferenceId) {
        Session session = openVidu.getActiveSession(conferenceId);

        // 생성되어있는 세션이 없을 경우 throw
        if (session == null) {
            throw new CannotFindSessionException("Session을 찾을 수 없습니다. : sessionId : " + conferenceId);
        }

        // 이미 User가 Connection을 가지고 있으면 throw
        userConferenceRepository.findByUser(participant).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + participant.getId() + ", conferenceId : " + conferenceId);
                });

        // DB에서 conference를 찾을 수 없으면 throw
        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId))
                .orElseThrow(() -> new CannotFindSessionException("conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));

        // Openvidu role 선택
        OpenViduRole role = openViduUtil.determineRole(participant, conference);

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .role(role)
                .build();

        // OpenVidu 토큰 발급
        Connection connection = null;
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
}
