package com.ssafy.codemaestro.global.entity;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, unique = true)
    private String handle;  // 백준 아이디

    @Column(nullable = false)
    private int tier;    // 백준 티어

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    public void updateTierInfo(int tier) {
        this.tier = tier;
        this.lastUpdated = LocalDateTime.now();
    }
}