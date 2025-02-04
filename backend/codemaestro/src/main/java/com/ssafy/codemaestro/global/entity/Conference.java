package com.ssafy.codemaestro.global.entity;

import com.ssafy.codemaestro.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
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
    User owner;

    @Builder.Default
    @Column(nullable = false)
    String thumbnailUrl = "http://thisisdefault:1234/";

    @Column(nullable = false)
    String title;

    @Column(nullable = true)
    String description;

    @Column(nullable = true)
    String accessCode;

    @Column(nullable = false)
    ProgrammingLanguage programmingLanguage;

    @CreationTimestamp
    LocalDateTime createdAt;
}
