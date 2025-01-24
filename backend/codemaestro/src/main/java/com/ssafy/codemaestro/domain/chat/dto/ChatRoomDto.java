package com.ssafy.codemaestro.domain.chat.dto;

import com.ssafy.codemaestro.domain.chat.entity.ChatRoom;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomDto {
    private Long id;
    private String name;
    private String createdBy;

    // Entity -> DTO 변환
    public static ChatRoomDto from(ChatRoom chatRoom) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(chatRoom.getId());
        dto.setName(chatRoom.getName());
        dto.setCreatedBy(chatRoom.getCreatedBy());
        return dto;
    }
}