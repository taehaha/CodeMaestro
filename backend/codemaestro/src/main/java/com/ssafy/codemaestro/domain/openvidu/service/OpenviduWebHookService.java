package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.group.repository.GroupConferenceHistoryRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupConferenceMemberHistoryRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupMemberRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.vo.ConnectionDataVo;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.*;
import com.ssafy.codemaestro.global.exception.NotFoundException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.util.JwtUtil;
import io.openvidu.java.client.OpenVidu;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Slf4j
@Service
public class OpenviduWebHookService {
    private final UserRepository userRepository;
    private final ConferenceRepository conferenceRepository;
    private final UserConferenceRepository userConferenceRepository;
    private final GroupConferenceHistoryRepository groupConferenceHistoryRepository;
    private final GroupConferenceMemberHistoryRepository groupConferenceMemberHistoryRepository;
    private final GroupMemberRepository groupMemberRepository;
    @Autowired
    public OpenviduWebHookService(UserRepository userRepository, ConferenceRepository conferenceRepository, UserConferenceRepository userConferenceRepository, GroupConferenceHistoryRepository groupConferenceHistoryRepository, GroupConferenceMemberHistoryRepository groupConferenceMemberHistoryRepository, GroupMemberRepository groupMemberRepository) {
        this.userRepository = userRepository;
        this.conferenceRepository = conferenceRepository;
        this.userConferenceRepository = userConferenceRepository;
        this.groupConferenceHistoryRepository = groupConferenceHistoryRepository;
        this.groupConferenceMemberHistoryRepository = groupConferenceMemberHistoryRepository;
        this.groupMemberRepository = groupMemberRepository;
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
    public void onSessionDestroyed(String sessionId, Long timestamp, int duration) {
        log.debug("OpenVidu Webhook : Session Destroyed:");

        Optional<Conference> conferenceOptional = conferenceRepository.findById((Long.valueOf(sessionId)));

        if(conferenceOptional.isEmpty()) {
            log.debug("이미 종료된 conference입니다. {}", sessionId);
            return;
        }

        Conference conference = conferenceOptional.get();

        // 그룹 회의인 경우 히스토리 업데이트
        if(conference.getGroup() != null) {
            try {
                LocalDateTime endTime = LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(timestamp),
                        ZoneId.systemDefault()
                );

                GroupConferenceHistory history = groupConferenceHistoryRepository
                        .findByGroupAndEndTimeIsNull(conference.getGroup())
                        .orElseThrow(() -> new NotFoundException("현재 활성화된 그룹 컨퍼런스 히스토리가 없음"));

                if(history.getEndTime() != null) {
                    log.debug("이미 종료 처리된 히스토리입니다: {}", sessionId);
                    return;
                }

                history.setEndTime(endTime);
                history.setDuration(duration);

                groupConferenceHistoryRepository.save(history);
                log.debug("그룹 회의 히스토리 종료 처리 완료");
            } catch (Exception e) {
                log.warn("히스토리가 이미 처리되었습니다. conferenceId: {}", sessionId);
            }
        }

        try {
            userConferenceRepository.deleteByConferenceId(Long.valueOf(sessionId));
            conferenceRepository.deleteById(Long.valueOf(sessionId));
        } catch (Exception e) {
            log.warn("Conference 삭제 실패. 이미 삭제되었을 수 있습니다. {}", sessionId);
        }
    }

    public void onParticipantJoined(String serverDataJson, String sessionId, String connectionId, Long timestamp) {
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

        // 그룹 회의이고 참가자가 그룹 멤버인 경우 그룹 회의 멤버 히스토리 추가
        if(conference.getGroup() != null) {
            boolean isGroupMember = groupMemberRepository.findByGroupAndUser(conference.getGroup(), participant)
                    .isPresent();

            if(!isGroupMember) {
                log.debug("그룹 참가자가 아니므로 히스토리 저장하지 않음. userId: {}", participant.getId());
                return;
            }

            // opeevidu에서 제공해주는 UTC밀리초 시간 변황
            LocalDateTime joinTime = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(timestamp),
                    ZoneId.systemDefault()
            );

            GroupConferenceHistory history = groupConferenceHistoryRepository
                    .findByGroupAndEndTimeIsNull(conference.getGroup())
                    .orElseThrow(() -> new NotFoundException("현재 활성화된 그룹 컨퍼런스 히스토리를 찾을 수 없음."));

            GroupConferenceMemberHistory memberHistory = GroupConferenceMemberHistory.builder()
                    .groupConferenceHistory(history)
                    .participant(participant)
                    .joinTime(joinTime)
                    .build();

            groupConferenceMemberHistoryRepository.save(memberHistory);
            log.debug("그룹 회의 참가자 정보 저장 완료");
        }
    }

    @Transactional
    public void onParticipantLeft(String connectionId, Long timestamp, int duration) {
        log.debug("OpenVidu Webhook : Participant Left:");

        Optional<UserConference> userConferenceOptional = userConferenceRepository.findByConnectionId(connectionId);

        if(userConferenceOptional.isEmpty()) {
            log.debug("이미 처리된 connection 입니다. {}", connectionId);
            return;
        }

        // 퇴장하는 참가자 UserConference 조회
        UserConference userConference = userConferenceOptional.get();
        Conference conference = userConference.getConference();
        User participant = userConference.getUser();

        // 그룹 회의인 경우 참가자 히스토리 업데이트
        if(conference.getGroup() != null) {
            try {
                LocalDateTime leaveTime = LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(timestamp),
                        ZoneId.systemDefault()
                );

                GroupConferenceHistory history = groupConferenceHistoryRepository
                        .findByGroupAndEndTimeIsNull(conference.getGroup())
                        .orElseThrow(() -> new NotFoundException("현재 활성화된 그룹 컨퍼런스 히스토리를 찾을 수 없음."));

                GroupConferenceMemberHistory memberHistory = groupConferenceMemberHistoryRepository
                        .findByGroupConferenceHistoryAndParticipantAndLeaveTimeIsNull(history, participant)
                        .orElseThrow(() -> new NotFoundException("해당 참가자의 활성화된 히스토리를 찾을 수 없음."));

                memberHistory.setLeaveTime(leaveTime);
                memberHistory.setDuration(duration);

                groupConferenceMemberHistoryRepository.save(memberHistory);
                log.debug("그룸 회의 참가자 퇴장 정보 저장 완료");
            } catch (Exception e) {
                log.warn("히스토리가 이미 처리되었습니다. connectionId: {}", connectionId);
            }
        }
        try {
            userConferenceRepository.deleteByConnectionId(connectionId);
        } catch (Exception e) {
            log.warn("UserConference 삭제 실패, 이미 삭제되었을 수 있습니다: {}", connectionId);
        }
    }
}
