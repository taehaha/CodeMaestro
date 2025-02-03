package com.ssafy.codemaestro.domain.notification.service;

import com.ssafy.codemaestro.domain.friend.dto.FriendRequestDto;
import com.ssafy.codemaestro.domain.group.dto.GroupJoinRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Queue;

//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class NotificationService {
//
//    private final SseService sseService;  // SseService 의존성 주입
//
//    // 친구 요청 알림
//    public void sendFriendRequestNotification(Long userId, FriendRequestDto notification) {
//        try {
//            sseService.sendNotification(userId, "friendRequest", notification);
//        } catch (IOException e) {
//            log.error("Failed to send friend request notification", e);
//        }
//    }
//
//    // 그룹 가입 요청 알림
//    public void sendGroupJoinRequestNotification(Long userId, GroupJoinRequestDto notification) {
//        try {
//            sseService.sendNotification(userId, "GroupRequest", notification);
//        } catch (IOException e) {
//            log.error("Failed to send group request notification", e);
//        }
//    }
//
//
//// 회의 초대 알림
////    public void sendMeetingInviteNotification(String userId, MeetingInviteDto notification) {
////        try {
////            sseService.sendNotification(userId, "meetingInvite", notification);
////        } catch (IOException e) {
////            log.error("Failed to send meeting invite notification", e);
////        }
////    }
//}

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseService sseService;

    public void sendFriendRequestNotification(Long userId, FriendRequestDto notification) {
        try {
            sseService.sendNotification(userId, "friendRequest", notification);
        } catch (Exception e) {
            log.error("Failed to send friend request notification to user {}", userId, e);
            // 필요한 경우 재시도 로직 또는 대체 알림 방법 구현
        }
    }

    public void sendGroupJoinRequestNotification(Long userId, GroupJoinRequestDto notification) {
        try {
            sseService.sendNotification(userId, "groupRequest", notification);
        } catch (Exception e) {
            log.error("Failed to send group request notification to user {}", userId, e);
            // 필요한 경우 재시도 로직 또는 대체 알림 방법 구현
        }
    }

    // 미수신 알림 수동 재전송 메서드
    public void resendLostNotifications(Long userId) {
        Queue<Object> lostData = sseService.getLostData(userId);
        if (!lostData.isEmpty()) {
            log.info("Attempting to resend {} lost notifications to user {}", lostData.size(), userId);
            // 재전송 로직 구현
        }
    }
}

