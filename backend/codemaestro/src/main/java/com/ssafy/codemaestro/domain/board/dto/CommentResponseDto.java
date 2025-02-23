package com.ssafy.codemaestro.domain.board.dto;

import com.ssafy.codemaestro.global.entity.Comment;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@Builder
public class CommentResponseDto {

    private Long commentId;
    private String content;
    private Long writerId;
    private String writerNickname;
    private String writerProfileImageUrl;
    private Long boardId;
    private LocalDateTime createdAt;

    public static CommentResponseDto from(Comment comment) {
        return CommentResponseDto.builder()
                .commentId(comment.getId())
                .content(comment.getContent())
                .writerId(comment.getWriter().getId())
                .writerNickname(comment.getWriter().getNickname())
                .writerProfileImageUrl(comment.getWriter().getProfileImageUrl())
                .boardId(comment.getBoard().getId())
                .createdAt(comment.getCreatedAt())
                .build();
    }

}
