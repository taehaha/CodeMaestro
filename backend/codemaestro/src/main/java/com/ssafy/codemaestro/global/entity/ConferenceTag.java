package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conference_tag")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConferenceTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_id")
    private Conference conference;

    @Column(nullable = false)
    private String tagName;
}
