package com.ssafy.codemaestro.domain.board.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class BoardRequestDto {
    private String title;
    private String content;
    private Long userId;
}
