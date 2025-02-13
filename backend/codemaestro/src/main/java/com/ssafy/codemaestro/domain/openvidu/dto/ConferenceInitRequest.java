package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ConferenceInitRequest {
    String title;
    String description;
    String accessCode;
    Long groupId;
    List<String> tagNameList;

    @Override
    public String toString() {
        return "ConferenceInitRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", accessCode='" + accessCode + '\'' +
                ", groupId=" + groupId +
                ", tagNameList=" + tagNameList +
                '}';
    }
}
