package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    @Builder.Default
    @Column(nullable = false)
    String thumbnailUrl = "http://thisisdefault:1234/";

    @Column(nullable = false)
    String title;

    @Column(nullable = true)
    String description;

    @Column(nullable = true)
    String accessCode;

    //TODO: 자유 태그로 바꾸기
    @Column(nullable = false)
    ProgrammingLanguage programmingLanguage;

    @CreationTimestamp
    LocalDateTime createdAt;
}
