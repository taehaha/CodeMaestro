package com.ssafy.domain.boj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "boj_users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BojUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String handle;  // 백준 아이디

    @Column(nullable = false)
    private String tier;    // 백준 티어

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    public void updateTierInfo(String tier) {
        this.tier = tier;
        this.lastUpdated = LocalDateTime.now();
    }
}