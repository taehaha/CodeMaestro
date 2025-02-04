package com.ssafy.codemaestro.global.entity;

import com.ssafy.codemaestro.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_confernece")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    Conference conference;

    @ManyToOne(fetch = FetchType.LAZY)
    User user;

    String connectionId;
}
