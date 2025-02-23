package com.ssafy.codemaestro.domain.group.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupLeaveRequestDto {
    private Long groupId;
    private Long userId;
}
