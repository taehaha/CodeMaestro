package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conference")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    User moderator;

    // null : 일반 회의
    // not null : 그룹 회의
    @ManyToOne(fetch = FetchType.LAZY)
    Group group;

    @Builder.Default
    @Column(nullable = false)
    String thumbnailUrl = "http://thisisdefault:1234/";

    @Column(nullable = false)
    String title;

    @Column(nullable = true)
    String description;

    @Column(nullable = true)
    String accessCode;

    @CreationTimestamp
    LocalDateTime createdAt;

    // 컨퍼런스 - 태그 양방향 관계 설정
    @OneToMany(mappedBy = "conference", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConferenceTag> tags = new ArrayList<>();

    // 양방향 관계 설정 시, 주의해야 할 데이터 적합성 유지를 위한 편의 메서드
    private void addTag(ConferenceTag tag) {
        this.tags.add(tag);
        tag.setConference(this);
    }
    private void removeTag(ConferenceTag tag) {
        this.tags.remove(tag);
        tag.setConference(null);
    }

}
