package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class ConferenceInitRequest {
    String title;
    String description;
    String accessCode;
    Long groupId;
    List<String> tagNameList;
    MultipartFile thumbnail;

    @Override
    public String toString() {
        return "ConferenceInitRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", accessCode='" + accessCode + '\'' +
                ", groupId=" + groupId +
                ", tagNameList=" + tagNameList +
                ", thumbnaiil=" + thumbnail.getOriginalFilename() +
                '}';
    }
}
