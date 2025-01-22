package com.ssafy.domain.chat.repository;

import com.ssafy.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

/*
상속 구조
CrudRepository  // 기본 CRUD 작업
    ↑
PagingAndSortingRepository  // 페이징과 정렬 기능 추가
    ↑
JpaRepository  // JPA 특화 기능 추가

----------------
CrudRepository 기본 제공 메서드

save()              // 저장
saveAll()           // 여러 엔티티 저장
findById()          // ID로 조회
existsById()        // ID 존재 확인
findAll()           // 전체 조회
findAllById()       // 여러 ID로 조회
count()             // 개수 조회
deleteById()        // ID로 삭제
delete()            // 엔티티 삭제
deleteAllById()     // 여러 ID로 삭제
deleteAll()         // 전체 삭제
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}