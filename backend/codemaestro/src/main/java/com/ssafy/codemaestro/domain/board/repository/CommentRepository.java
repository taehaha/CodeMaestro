package com.ssafy.codemaestro.domain.board.repository;

import com.ssafy.codemaestro.global.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBoardId(Long boardId);
}