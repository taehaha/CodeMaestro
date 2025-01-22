package com.ssafy.domain.chat.service;

import com.ssafy.domain.chat.dto.ChatDto;
import com.ssafy.domain.chat.entity.Chat;
import com.ssafy.domain.chat.entity.ChatRoom;
import com.ssafy.domain.chat.repository.ChatRepository;
import com.ssafy.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatRoomRepository chatRoomRepository;

    // 채팅 메세지 저장
    @Transactional
    public ChatDto saveChat(Long roomId, String sender, String message) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Chat chat = new Chat();
        chat.setChatRoom(chatRoom);
        chat.setSender(sender);
        chat.setMessage(message);

        Chat savedChat = chatRepository.save(chat);
        return ChatDto.from(savedChat);
    }

    // 특정 채팅방의 대화 내역을 조회
    // (채팅방 ID로 모든 채팅 내역을 시간 순으로 조회)
    @Transactional(readOnly = true)
    public List<ChatDto> getChatHistory(Long roomId) {
        return chatRepository.findByChatRoomIdOrderBySentAtAsc(roomId).stream()
                .map(ChatDto::from)
                .collect(Collectors.toList());
    }
}