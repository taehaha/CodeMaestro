package com.ssafy.codemaestro.domain.notification.service;

import com.ssafy.codemaestro.domain.friend.dto.FriendRequestDto;
import com.ssafy.codemaestro.domain.group.dto.GroupJoinRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SseService sseService;  // SseService 의존성 주입

    // 친구 요청 알림
    public void sendFriendRequestNotification(Long userId, FriendRequestDto notification) {
        try {
            sseService.sendNotification(userId, "friendRequest", notification);
        } catch (IOException e) {
            log.error("Failed to send friend request notification", e);
        }
    }

    // 그룹 가입 요청 알림
    public void sendGroupJoinRequestNotification(Long userId, GroupJoinRequestDto notification) {
        try {
            sseService.sendNotification(userId, "GroupRequest", notification);
        } catch (IOException e) {
            log.error("Failed to send group request notification", e);
        }
    }


// 회의 초대 알림
//    public void sendMeetingInviteNotification(String userId, MeetingInviteDto notification) {
//        try {
//            sseService.sendNotification(userId, "meetingInvite", notification);
//        } catch (IOException e) {
//            log.error("Failed to send meeting invite notification", e);
//        }
//    }
}

