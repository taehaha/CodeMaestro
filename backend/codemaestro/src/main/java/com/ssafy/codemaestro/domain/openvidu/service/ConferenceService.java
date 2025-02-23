package com.ssafy.codemaestro.domain.openvidu.service;

import com.ssafy.codemaestro.domain.group.repository.GroupConferenceHistoryRepository;
import com.ssafy.codemaestro.domain.group.repository.GroupRepository;
import com.ssafy.codemaestro.domain.notification.service.NotificationService;
import com.ssafy.codemaestro.domain.openvidu.dto.ConferenceConnectResponse;
import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.ConferenceTagRepository;
import com.ssafy.codemaestro.domain.openvidu.repository.UserConferenceRepository;
import com.ssafy.codemaestro.domain.openvidu.vo.ConnectionDataVo;
import com.ssafy.codemaestro.domain.openvidu.vo.OpenviduSignalType;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.*;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import com.ssafy.codemaestro.global.exception.NotFoundException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindConnectionException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.exception.openvidu.ConnectionAlreadyExistException;
import com.ssafy.codemaestro.global.exception.openvidu.InvaildAccessCodeException;
import com.ssafy.codemaestro.global.util.S3Util;
import com.ssafy.codemaestro.global.util.OpenViduUtil;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@RequiredArgsConstructor
@Service
public class ConferenceService {
    private final UserRepository userRepository;
    private final ConferenceRepository conferenceRepository;
    private final ConferenceTagRepository conferenceTagRepository;
    private final UserConferenceRepository userConferenceRepository;
    private final GroupConferenceHistoryRepository groupConferenceHistoryRepository;
    private final NotificationService notificationService;
    private final GroupRepository groupRepository;

    private final OpenViduUtil openViduUtil;
    private final S3Util s3Util;

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
        try {
            openVidu.fetch();
        } catch (OpenViduHttpException | OpenViduJavaClientException e) {
            log.error("Openvidu 서버와 통신에 실패했습니다. {}", e.getMessage());
        }
    }

    /**
     * 특정 사용자에 대해 주어진 세부 정보를 기반으로 새 회의를 초기화합니다.
     * 제공된 매개변수를 기반으로 새 Conference 엔터티를 생성하고 저장합니다.
     * OpenVidu를 사용해 회의 세션을 생성하며 해당 세션의 ID를 반환합니다.
     * 사용자가 이미 기존 연결을 보유하고 있는 경우 예외를 발생시킵니다.
     *
     * @param requestUser        회의를 소유할 사용자.
     * @param title        회의 제목.
     * @param description  회의 설명.
     * @param accessCode   회의 액세스 코드.
     * @return 새로 생성된 OpenVidu 세션의 세션 ID.
     * @throws ConnectionAlreadyExistException 사용자가 이미 기존 연결을 보유하고 있는 경우.
     * @throws RuntimeException OpenVidu 서버 통신이나 OpenVidu Java 클라이언트 오류가 발생한 경우.
     */
    @Transactional
    public String initializeConference(User requestUser,
                                       String title,
                                       String description,
                                       String accessCode,
                                       Long groupId,
                                       List<String> tagNameList,
                                       MultipartFile thumbnail) {
        // 이미 User가 Connection을 가지고 있으면 throw
        userConferenceRepository.findByUser(requestUser).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + requestUser.getId() + ", conferenceId : " + conference.getId());
                });

        Conference.ConferenceBuilder conferenceBuilder = Conference.builder();
        Conference conference;
        String thumbnailUrl = null;

        if (thumbnail != null) {
            thumbnailUrl = s3Util.uploadFile(thumbnail);
        } else {
            thumbnailUrl = "https://code-maestro.s3.ap-northeast-2.amazonaws.com/default_thumbnail.png";
        }

        // 그룹 회의인 경우
        if(groupId != null) {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new NotFoundException("Group not Found"));

            // 회의 기본정보 설정
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd (E) HH시", Locale.KOREAN);
            String date = now.format(formatter);
            String groupTitle = date + " " + group.getName() + " 회의";
            String groupDescription = date + " " + group.getName() + "의 회의입니다.";

            conferenceBuilder.moderator(requestUser)
                             .title(groupTitle)
                             .description(groupDescription)
                             .thumbnailUrl(thumbnailUrl)
                             .group(group);

            // Conference 저장
            conference = conferenceBuilder.build();
            conferenceRepository.save(conference);

            // Group_Conference_History 저장
            GroupConferenceHistory history = GroupConferenceHistory.builder()
                    .group(group)
                    .title(groupTitle)
                    .description(groupDescription)
                    .thumbnailUrl(conference.getThumbnailUrl())
                    .moderatorId(requestUser.getId())
                    .moderatorName(requestUser.getNickname())
                    .startTime(now)
                    .build();

            groupConferenceHistoryRepository.save(history);

            // 그룹 회원들에게 알림 전송
            List<GroupMember> groupMembers = group.getMembers();
            for(GroupMember member : groupMembers) {
                if(!member.getUser().getId().equals(requestUser.getId())) { // 회의 생성자 제외하고 알림
                    notificationService.sendGroupConferenceNotification(member.getUser().getId(), groupId, group.getName());
                }
            }
        }
        // 일반 회의인 경우
        else {
            conferenceBuilder.moderator(requestUser)
                             .title(title)
                             .description(description)
                             .thumbnailUrl(thumbnailUrl)
                             .accessCode(accessCode);

            conference = conferenceBuilder.build();
            conferenceRepository.save(conference);
        }

        // 태그 저장
        List<ConferenceTag> conferenceTagList = ConferenceTag.fromTagNameList(conference, tagNameList);
        conferenceTagRepository.saveAll(conferenceTagList);

        // 세션 생성
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
     * @param requestUser 회의에 연결하려는 사용자
     * @param conferenceId 사용자가 연결하려는 회의의 ID
     * @return 지정된 회의 세션에서 사용자를 위한 생성된 Connection 객체
     * @throws CannotFindSessionException 회의 세션 또는 회의를 찾을 수 없는 경우
     * @throws ConnectionAlreadyExistException 사용자가 이미 회의에 연결된 경우
     * @throws RuntimeException OpenVidu와 상호작용 중 오류가 발생한 경우
     */
    @Transactional
    public ConferenceConnectResponse issueToken(User requestUser, String conferenceId, String accessCode) {
        Session session = openVidu.getActiveSession(conferenceId);

        /* 유효성 검증 */
        if (session == null) {
            throw new CannotFindSessionException("Session을 찾을 수 없습니다. : sessionId : " + conferenceId);
        }

        userConferenceRepository.findByUser(requestUser).ifPresent(
                conference -> {
                    throw new ConnectionAlreadyExistException("유저가 이미 Connection을 가지고 있습니다. : userId : " + requestUser.getId() + ", conferenceId : " + conferenceId);
                });

        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId))
                .orElseThrow(() -> new CannotFindSessionException("conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));

        if (!openViduUtil.isAccessCodeCorrect(accessCode, conference)) {
            throw new InvaildAccessCodeException("방 번호 : " + conferenceId + " 비밀번호 : " + conference.getAccessCode() + " 입력된 비밀번호 : " + accessCode);
        }

        /* OpenVidu Connection Token 발급 */
        ConnectionDataVo connectionVo =
                ConnectionDataVo.builder()
                        .userId(requestUser.getId().toString())
                        .nickname(requestUser.getNickname())
                        .profileImageUrl(requestUser.getProfileImageUrl())
                        .description(requestUser.getDescription())
                        .build();

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .role(OpenViduRole.PUBLISHER)
                .data(connectionVo.toJson())
                .build();

        ConnectionProperties screenShareConnectionProperties = new ConnectionProperties.Builder()
                .role(OpenViduRole.PUBLISHER)
                .build();

        Connection connection;
        Connection screenShareConnection;
        try {
            connection = session.createConnection(properties);
            screenShareConnection = session.createConnection(screenShareConnectionProperties);

            return new ConferenceConnectResponse(connection.getToken(),
                    screenShareConnection.getToken(),
                    Objects.equals(requestUser.getId(), conference.getModerator().getId()));
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        }
    }

    public Conference getConference(String conferenceId) {
        return conferenceRepository.findById(Long.valueOf(conferenceId)).orElseThrow(() -> new CannotFindSessionException("Conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));
    }

    public List<Conference> getAllConferences() {
        return conferenceRepository.findAll();
    }

    public int getParticipantNum(String conferenceId) {
        return (int) conferenceRepository.countConferenceById(Long.valueOf(conferenceId));
    }

    public boolean checkAccessCode(String conferenceId, String accessCode) {
        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId))
                .orElseThrow(() -> new CannotFindSessionException("conference를 찾을 수 없습니다. : conferenceId : " + conferenceId));

        return openViduUtil.isAccessCodeCorrect(accessCode, conference);
    }

    public List<User> getParticipants(String conferenceId) {
        Long conferenceIdLong = Long.valueOf(conferenceId);
        return userConferenceRepository.findByConference_Id(conferenceIdLong).stream()
                .map(UserConference::getUser)
                .collect(Collectors.toList());
    }

    public void updateConference(String conferenceId, String title, String description, String accessCode, MultipartFile thumbnailFile) {
        Conference conference = conferenceRepository.findById(Long.valueOf(conferenceId))
                .orElseThrow(() -> new CannotFindSessionException("Conference를 찾을 수 없습니다 : conferenceId : " + conferenceId));

        // 이미지 S3 업로드 및 삭제
        String thumbnailUrl = null;
        if (thumbnailFile != null) {
            thumbnailUrl = s3Util.uploadFile(thumbnailFile);
//            s3Util.deleteFile(conference.getThumbnailUrl());
        }
        conference.setTitle(title);
        conference.setDescription(description);
        conference.setAccessCode(accessCode);
        conference.setThumbnailUrl(thumbnailUrl);

        conferenceRepository.save(conference);
    }

    @Transactional
    public void changeModerator(String conferenceId, User requestUser, Long targetUserId) {
        User newModeartorUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User를 찾을 수 없습니다. : userId : " + targetUserId));

        String targetUserConnectionId = userConferenceRepository.findByUser(newModeartorUser)
                .orElseThrow(() -> new CannotFindConnectionException(targetUserId, "Connection을 찾을 수 없습니다."))
                .getConnectionId();

        Conference conference = conferenceRepository.findByModerator(requestUser)
                .orElseThrow(() -> new CannotFindSessionException("Conference를 찾을 수 없습니다. : moderatorId : " + requestUser.getId()));

        Session session = openVidu.getActiveSession(conferenceId);
        Connection targetConnection = session.getConnection(targetUserConnectionId);

        conference.setModerator(newModeartorUser);
        conferenceRepository.save(conference);

        openViduUtil.sendSignal(
                conferenceId,
                Collections.singletonList(targetConnection),
                OpenviduSignalType.MODERATOR_CHANGED,
                null
        );
    }

    public void kick(String conferenceId, User requestUser, Long targetUserId) {
        // 요청자가 권한이 있는지 확인
        if (!conferenceRepository.existsByIdAndModerator(Long.valueOf(conferenceId), requestUser)) {
            throw new BadRequestException("권한이 없습니다. userId : " + requestUser.getId());
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("대상 유저를 찾을 수 없습니다. user Id : " + targetUserId));

        String targetUserConnectionId = userConferenceRepository.findByUser(targetUser)
                .orElseThrow(() -> new CannotFindConnectionException(targetUserId, "유저가 컨퍼런스에 연결되있지 않습니다. : userId: " + targetUserId + " conferenceId :  " + conferenceId))
                .getConnectionId();

        Session session = openVidu.getActiveSession(conferenceId);
        Connection targetConnection = session.getConnection(targetUserConnectionId);

        try {
            session.forceDisconnect(targetConnection);
        } catch (OpenViduHttpException e) {
            log.error("OpenVidu Session 생성 중 OpenVidu Server와 통신 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        } catch (OpenViduJavaClientException e) {
            log.error("OpenVidu Java Client 오류.");
            log.error(e.getMessage());
            throw new RuntimeException("Openvidu 관련 동작 오류");
        }
    }

    public void unpublishVideo(String conferenceId, User requestUser, Long targetUserId) {
        // 요청자가 권한이 있는지 확인
        if (!conferenceRepository.existsByIdAndModerator(Long.valueOf(conferenceId), requestUser)) {
            throw new BadRequestException("권한이 없습니다. userId : " + requestUser.getId());
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("대상 유저를 찾을 수 없습니다. user Id : " + targetUserId));

        String targetUserConnectionId = userConferenceRepository.findByUser(targetUser)
                .orElseThrow(() -> new CannotFindConnectionException(targetUserId, "유저가 컨퍼런스에 연결되있지 않습니다. : userId: " + targetUserId + " conferenceId :  " + conferenceId))
                .getConnectionId();

        //
        Session session = openVidu.getActiveSession(conferenceId);
        Connection targetConnection = session.getConnection(targetUserConnectionId);

        openViduUtil.sendSignal(
                conferenceId,
                Collections.singletonList(targetConnection),
                OpenviduSignalType.UNPUBLISH_VIDEO,
                null
        );
    }

    public void unpublishAudio(String conferenceId, User requestUser, Long targetUserId) {
        // 요청자가 권한이 있는지 확인
        if (!conferenceRepository.existsByIdAndModerator(Long.valueOf(conferenceId), requestUser)) {
            throw new BadRequestException("권한이 없습니다. userId : " + requestUser.getId());
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("대상 유저를 찾을 수 없습니다. user Id : " + targetUserId));

        String targetUserConnectionId = userConferenceRepository.findByUser(targetUser)
                .orElseThrow(() -> new CannotFindConnectionException(targetUserId, "유저가 컨퍼런스에 연결되있지 않습니다. : userId: " + targetUserId + " conferenceId :  " + conferenceId))
                .getConnectionId();

        //
        Session session = openVidu.getActiveSession(conferenceId);
        Connection targetConnection = session.getConnection(targetUserConnectionId);

        openViduUtil.sendSignal(
                conferenceId,
                Collections.singletonList(targetConnection),
                OpenviduSignalType.UNPUBLISH_AUDIO,
                null
        );
    }
}
