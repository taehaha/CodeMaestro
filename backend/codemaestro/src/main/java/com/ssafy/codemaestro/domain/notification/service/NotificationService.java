package com.ssafy.codemaestro.domain.notification.service;

import com.ssafy.codemaestro.domain.board.dto.CommentResponseDto;
import com.ssafy.codemaestro.domain.friend.dto.FriendRequestDto;
import com.ssafy.codemaestro.domain.friend.dto.FriendResponseDto;
import com.ssafy.codemaestro.domain.group.dto.GroupJoinRequestDto;
import com.ssafy.codemaestro.domain.group.dto.GroupJoinResponseDto;
import com.ssafy.codemaestro.global.entity.Comment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Queue;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SseService sseService;

    public void sendFriendRequestNotification(Long userId, FriendResponseDto notification) {
        try {
            sseService.sendNotification(userId, "friendRequest", notification);
        } catch (Exception e) {
            log.error("Failed to send friend request notification to user {}", userId, e);
            // 필요한 경우 재시도 로직 또는 대체 알림 방법 구현
        }
    }

    public void sendGroupJoinRequestNotification(Long userId, GroupJoinResponseDto notification) {
        try {
            sseService.sendNotification(userId, "groupRequest", notification);
        } catch (Exception e) {
            log.error("Failed to send group request notification to user {}", userId, e);
            // 필요한 경우 재시도 로직 또는 대체 알림 방법 구현
        }
    }

    // 댓글 생성시 알림
    public void sendCommentNotification(Long boardWriter, CommentResponseDto notification) {
        try {
            sseService.sendNotification(boardWriter, "comment", notification);
        } catch (Exception e) {
            log.error("댓글 생성 후 알림 전송 실패 userId: {}", boardWriter, e);
        }
    }
}

