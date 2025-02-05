package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;

@Entity
public class GroupConferenceCandidateLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    Group group;

    @ManyToOne
    User candidate;
}
