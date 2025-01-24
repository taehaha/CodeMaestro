package com.ssafy.codemaestro.domain.chat.dto;

import com.ssafy.codemaestro.domain.chat.entity.Chat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatDto {
    private Long id;
    private Long chatRoomId;
    private String sender;
    private String message;
    private LocalDateTime sentAt;

    /*
    DTO 팩토리 메서드
        - 클라이언트-서버 간 채팅 메시지 데이터 전송
        - 엔티티와 표현 계층의 분리
        - 필요한 데이터만 선택적으로 전송 가능
     */
    public static ChatDto from(Chat chat) {
        ChatDto dto = new ChatDto();
        dto.setId(chat.getId());
        dto.setChatRoomId(chat.getChatRoom().getId());
        dto.setSender(chat.getSender());
        dto.setMessage(chat.getMessage());
        dto.setSentAt(chat.getSentAt());
        return dto;
    }
}