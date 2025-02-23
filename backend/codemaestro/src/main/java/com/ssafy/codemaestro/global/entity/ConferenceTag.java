package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

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

    public static List<ConferenceTag> fromTagNameList(Conference conference, List<String> tagNameList) {
        return tagNameList.stream()
                .map(tagName -> ConferenceTag.builder()
                        .conference(conference)
                        .tagName(tagName)
                        .build())
                .collect(Collectors.toList());
    }

    public static List<String> toTagNameList(List<ConferenceTag> conferenceTagList) {
        return conferenceTagList.stream()
                .map(ConferenceTag::getTagName)
                .collect(Collectors.toList());

    }
}
