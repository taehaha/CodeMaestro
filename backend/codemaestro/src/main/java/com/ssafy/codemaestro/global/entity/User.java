package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")
@Getter
@Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String nickname;
    private String profileImageUrl;
    private String profileBackgroundImageUrl;

    @Enumerated(EnumType.STRING)
    private LoginProvider loginProvider;

    private String loginId;
    private String description;
//    private LocalDateTime created;
}