package com.ssafy.codemaestro.domain.chat.controller;

import com.ssafy.codemaestro.domain.chat.dto.ChatDto;
import com.ssafy.codemaestro.domain.chat.dto.ChatRoomDto;
import com.ssafy.codemaestro.domain.chat.service.ChatRoomService;
import com.ssafy.codemaestro.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
채팅방 API
 */
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성 (의존성 주입)
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 채팅방 생성
    @PostMapping
    public ResponseEntity<ChatRoomDto> createRoom(@RequestBody ChatRoomDto request) {
        ChatRoomDto room = chatRoomService.createRoom(
                request.getName(),
                request.getCreatedBy()
        );

        // 채팅방 생성 후, 전체 채팅방 목록을 실시간으로 브로드캐스트
        List<ChatRoomDto> updateRooms = chatRoomService.getRoomList();
        messagingTemplate.convertAndSend("/sub/rooms", updateRooms);

        return ResponseEntity.ok(room);
    }

    // 채팅방 목록 조회
    @GetMapping
    public ResponseEntity<List<ChatRoomDto>> getRoomList() {
        List<ChatRoomDto> rooms = chatRoomService.getRoomList();
        return ResponseEntity.ok(rooms);
    }

    // 특정 채팅방 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomDto> getRoom(@PathVariable Long roomId) {
        ChatRoomDto room = chatRoomService.getRoom(roomId);
        return ResponseEntity.ok(room);
    }

    // 채팅 히스토리 조회
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatDto>> getChatHistory(@PathVariable Long roomId) {
        List<ChatDto> chatHistory = chatService.getChatHistory(roomId);
        return ResponseEntity.ok(chatHistory);
    }
}