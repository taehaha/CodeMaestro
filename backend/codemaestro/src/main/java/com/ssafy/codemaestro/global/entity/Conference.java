package com.ssafy.codemaestro.global.entity;

import com.ssafy.codemaestro.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

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

    String thumbnail;
    String title;
    String description;
    boolean active;
    String accessCode;
    ProgrammingLanguage programmingLanguage;
}
