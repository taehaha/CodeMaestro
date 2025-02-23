package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_records")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// JPA Entity에 이벤트가 발생할 때마다 특정 로직을 실행하도록 설정
// AuditingEntityListener는 엔티티가 데이터베이스에 저장되거나 수정될 때 자동으로 시간을 기록해주는 JPA의 이벤트 리스너
public class StudyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_member_history_id", unique = true)
    private GroupConferenceMemberHistory conferenceMemberHistory;

    @Column
    private String studyContent;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
