package com.ssafy.codemaestro.domain.chat.controller;

import com.ssafy.codemaestro.domain.chat.dto.ChatDto;
import com.ssafy.codemaestro.domain.chat.dto.ChatRoomDto;
import com.ssafy.codemaestro.domain.chat.service.ChatRoomService;
import com.ssafy.codemaestro.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller // 웹소캣 활용 양방향 통신을 위해 RestController로 관리되지 않음
@RequiredArgsConstructor
@Slf4j
public class StompController {

    private final ChatService chatService;
    private final ChatRoomService chatRoomService;

    @MessageMapping("/chat/{chatRoomId}") // WebCSocketBrokerConfig에서 /pub(클->서) 설정한 메세지 송수신 메서드
    @SendTo("/sub/chat/{chatRoomId}") // 메세지 브로드캐스팅 : 해당 채팅방을 구독 중인 모든 클라이언트가 메시지를 수신
    public ChatDto message(
            @DestinationVariable Long chatRoomId, // WebSocket 메시지의 목적지 URL에서 변수를 추출(@PathVariable)
            @Payload ChatDto request) { // WebSocket 메세지 본문 -> 자바 객체로 변환(@RequestBody)
        log.info("chatRoomId: {}, message: {}", chatRoomId, request.getMessage());

        // 채팅 메시지 저장
        ChatDto savedChat = chatService.saveChat(
                chatRoomId,
                request.getSender(),
                request.getMessage()
        );

        return savedChat;
    }

    // 채팅방 목록 업데이트
    @SendTo("/sub/rooms")
    public List<ChatRoomDto> broadcastRoomList() {
        return chatRoomService.getRoomList();
    }
}