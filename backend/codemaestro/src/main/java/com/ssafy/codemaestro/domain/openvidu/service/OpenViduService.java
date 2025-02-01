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

import java.util.Map;
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
     * 새로운 회의방(Session)을 만듦.
     * @param owner
     * @param title
     * @param description
     * @param accessCode
     * @param pl
     * @return conferenceId
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
     *
     * @param conferenceId
     * @return
     */
    public Optional<String> connectConference(User participant, String conferenceId) {
        Session session = openVidu.getActiveSession(conferenceId);

        System.out.println(session);
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

    //TODO: Openvidu 문서 보고 더 해봐야 할거같음.. 보규형이랑 협업해서 작동 확인하기.

}
