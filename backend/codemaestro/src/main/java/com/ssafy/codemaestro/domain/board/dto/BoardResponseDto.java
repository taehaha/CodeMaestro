package com.ssafy.codemaestro.domain.board.dto;

import com.ssafy.codemaestro.global.entity.Board;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class BoardResponseDto {

    private Long boardId;
    private String title;
    private String content;
    private Long writerId;
    private String writerNickname;
    private String writerProfileImageUrl;
    private LocalDateTime createdAt;

    public static BoardResponseDto from(Board board) {
        return BoardResponseDto.builder()
                .boardId(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writerId(board.getWriter().getId())
                .writerNickname(board.getWriter().getNickname())
                .writerProfileImageUrl(board.getWriter().getProfileImageUrl())
                .createdAt(board.getCreatedAt())
                .build();
    }
}
