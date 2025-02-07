package com.ssafy.codemaestro.domain.board.service;

import com.ssafy.codemaestro.domain.board.dto.BoardRequestDto;
import com.ssafy.codemaestro.domain.board.dto.BoardResponseDto;
import com.ssafy.codemaestro.domain.board.repository.BoardRepository;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.Board;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // 게시글 전체 조회
    public List<BoardResponseDto> getAllBoards() {
        List<Board> boards = boardRepository.findAll();
        List<BoardResponseDto> boardDtoList = new ArrayList<>();

        for (Board board : boards) {
            BoardResponseDto dto = BoardResponseDto.from(board);
            boardDtoList.add(dto);
        }

        return boardDtoList;
    }

    // 게시글 상세 조회
    public BoardResponseDto getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Board not found"));
        return BoardResponseDto.from(board);
    }

    // 게시글 생성
    public BoardResponseDto createBoard(BoardRequestDto requestDto) {
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        Board board = new Board();
        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());
        board.setWriter(user);

        return BoardResponseDto.from(boardRepository.save(board));
    }

    // 게시글 수정
    public BoardResponseDto updateBoard(Long id, BoardRequestDto requestDto) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Board not found"));

        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());

        return BoardResponseDto.from(boardRepository.save(board));
    }

    // 게시글 삭제
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Board not found"));
        boardRepository.delete(board);
    }
}