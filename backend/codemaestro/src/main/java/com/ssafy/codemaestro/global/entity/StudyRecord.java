package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @LastModifiedBy
    private LocalDateTime updatedAt;
}
