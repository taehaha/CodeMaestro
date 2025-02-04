package com.ssafy.codemaestro.domain.chat.repository;

import com.ssafy.codemaestro.global.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    /* 
    메서드의 JPA 쿼리 생성 동작 과정 : 메서드 이름 파싱 -> JPQL 생성
        find: 조회 쿼리를 생성
        ByChatRoomId: WHERE 절에서 chatRoomId 필드를 조건으로 사용
        OrderBySentAtAsc: 결과를 sentAt 필드 기준으로 오름차순 정렬
     */
    List<Chat> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);
}