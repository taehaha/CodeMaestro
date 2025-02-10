package com.ssafy.codemaestro.domain.board.repository;

import com.ssafy.codemaestro.global.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface BoardRepository extends JpaRepository<Board, Long> {
}