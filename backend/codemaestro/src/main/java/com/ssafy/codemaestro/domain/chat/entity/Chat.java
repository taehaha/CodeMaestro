package com.ssafy.codemaestro.domain.chat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor // 기본 생성자 자동 생성
public class Chat {
    @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // 다대일 관계(채팅방 1개당 여러개의 채팅메세지 저장 가능), 지연 로딩
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false, columnDefinition = "TEXT") // 긴 텍스트를 위한 컬럼 타입
    private String message;

    @Column(updatable = false) // 수정 불가능한 컬럼
    private LocalDateTime sentAt;

    @PrePersist // 엔티티 저장 전 자동 호출
    protected void onCreate() {
        sentAt = LocalDateTime.now(); // 저장 시점의 시간을 자동으로 설정
    }
}