package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_conference_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupConferenceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_id")
    private Conference conference;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int duration;

    @OneToMany(mappedBy = "groupConferenceHistory", cascade = CascadeType.ALL)
    private List<GroupConferenceMemberHistory> memberHistories = new ArrayList<>();

    // 양방향 관계 설정 시, 주의해야 할 데이터 적합성 유지를 위한 편의 메서드
    public void addMemberHistory(GroupConferenceMemberHistory memberHistory) {
        this.memberHistories.add(memberHistory);
        memberHistory.setGroupConferenceHistory(this);
    }

    public void removeMemberHistory(GroupConferenceMemberHistory memberHistory) {
        this.memberHistories.remove(memberHistory);
        memberHistory.setGroupConferenceHistory(null);
    }
}
