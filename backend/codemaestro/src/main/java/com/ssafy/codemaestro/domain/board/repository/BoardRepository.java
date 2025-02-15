package com.ssafy.codemaestro.domain.board.repository;

import com.ssafy.codemaestro.global.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface BoardRepository extends JpaRepository<Board, Long> {
    @Query("SELECT b " +
            "FROM Board b " +
            "JOIN FETCH b.writer")
    List<Board> findAllWithWriter();
}