package com.ssafy.codemaestro.domain.group.dto;

import lombok.*;

@Getter
@Setter
public class GroupRequestDto {
    private Long userId;
    private String name;
    private String description;
}
