package com.ssafy.codemaestro.global.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_conference")
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

    @ManyToOne(fetch = FetchType.EAGER)
    User user;

    String connectionId;

    @Override
    public String toString() {
        return "UserConference{" +
                "id=" + id +
                ", conference=" + conference +
                ", user=" + user +
                ", connectionId='" + connectionId + '\'' +
                '}';
    }
}
