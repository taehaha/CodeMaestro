package com.ssafy.codemaestro.domain.openvidu.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ConferenceUpdateRequest {
    String title;
    String description;
    String accessCode;
    MultipartFile thumbnailFile;
}