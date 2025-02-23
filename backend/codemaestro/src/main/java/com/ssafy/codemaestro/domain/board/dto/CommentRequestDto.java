package com.ssafy.codemaestro.domain.board.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Builder
public class CommentRequestDto {
    private String content;
    private Long userId;
    private Long boardId;
}
