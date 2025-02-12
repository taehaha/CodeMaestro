package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConferenceInitRequest {
    String title;
    String description;
    String accessCode;
    Long groupId;

    @Override
    public String toString() {
        return "ConferenceInitRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", accessCode='" + accessCode + '\'' +
                ", groupId=" + groupId +
                '}';
    }
}
