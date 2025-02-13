package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_conference_member_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupConferenceMemberHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_log_id")
    private GroupConferenceHistory groupConferenceHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User participant;

    private LocalDateTime joinTime;

    private LocalDateTime leaveTime;

    private int duration;
}
