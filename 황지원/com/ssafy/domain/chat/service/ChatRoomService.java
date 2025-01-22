package com.ssafy.domain.chat.service;

import com.ssafy.domain.chat.dto.ChatRoomDto;
import com.ssafy.domain.chat.entity.ChatRoom;
import com.ssafy.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    // 채팅방 생성
    @Transactional // 해당 메소드를 하나의 트랜잭션으로 감싸서 관리,  예외 발생시 자동으로 롤백
    public ChatRoomDto createRoom(String name, String createdBy) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setName(name);
        chatRoom.setCreatedBy(createdBy);

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        return ChatRoomDto.from(savedRoom);
    }

    // 채팅방 목록 조회
    /*
    Stream API
    - 역할 :  컬렉션의 데이터를 선언적으로 처리(리스트 데이터 처리 용이)
    - 직접 for문을 써서 "어떻게" 처리할지 일일이 명시하지 않고 "무엇을" 하고 싶은지만 명시하면 Stream API가 알아서 처리해준다는 뜻
    - 장점: 선언적 프로그래밍 / 병렬 처리 용이 / 코드 가독성 향상 / 지연 연산(최종 연산 호출전까지 중간 연산 지연)
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜젝션
    public List<ChatRoomDto> getRoomList() {
        return chatRoomRepository.findAll().stream()
                .map(ChatRoomDto::from) // 메소드 레퍼런스(람다식과 동일)
                .collect(Collectors.toList());
    }

    // 특정 채팅방 조회
    @Transactional(readOnly = true)
    public ChatRoomDto getRoom(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return ChatRoomDto.from(chatRoom);
    }
}