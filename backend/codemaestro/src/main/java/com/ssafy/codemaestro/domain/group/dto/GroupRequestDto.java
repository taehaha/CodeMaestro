package com.ssafy.codemaestro.domain.group.dto;

import lombok.*;

@Getter
@Setter
public class GroupRequestDto {
    private Long userId;
    private String name;
    private String description;

    @Override
    public String toString() {
        return "GroupRequestDto{" +
                "userId=" + userId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
