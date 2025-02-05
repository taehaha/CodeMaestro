package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class GroupConferenceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    Group group;

    LocalDateTime startTime;
    LocalDateTime endTime;

    int duration;

    @OneToMany(mappedBy = "groupConferenceLog")
    List<GroupConferenceCandidateLog> candidates;
}
