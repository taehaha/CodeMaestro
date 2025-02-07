package com.ssafy.codemaestro.domain.board.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Builder
public class BoardRequestDto {
    private String title;
    private String content;
    private Long userId;
}
