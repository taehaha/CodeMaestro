package com.ssafy.codemaestro.global.exception;

import com.ssafy.codemaestro.global.dto.ErrorResponse;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindConnectionException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.exception.openvidu.ConnectionAlreadyExistException;
import com.ssafy.codemaestro.global.exception.openvidu.InvaildAccessCodeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 전역적으로 예외를 처리할 수 있게해주는 어노테이션
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex) {
        log.error("Not found error: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AlreadyRequestExistExceptions.class)
    public ResponseEntity<ErrorResponse> alreadyRequestExistException(AlreadyRequestExistExceptions ex) {
        log.error("Already Reqeusts Exists: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        log.error("Unauthorized error: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPasswordException(InvalidPasswordException ex) {
        log.error("Invalid password error: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException ex) {
        log.error("Bad request error: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        log.error("Unexpected error: ", ex);
        return new ResponseEntity<>(
                new ErrorResponse("An unexpected error occurred"),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    /* OpenVidu Session이나 Connection을 찾을 수 없을 때 실행되는 Handler */
    @ExceptionHandler({CannotFindSessionException.class, CannotFindConnectionException.class})
    public ResponseEntity<ErrorResponse> handleCannotFindException(Exception ex) {
        log.error("Cannot find error: " +
                "message : " + ex.getMessage());
        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ConnectionAlreadyExistException.class)
    public ResponseEntity<ErrorResponse> handleConnectionAlreadyExistException(Exception ex) {
        log.error("Connection already exist error: " +
                "message : " + ex.getMessage());
        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage()),
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(InvaildAccessCodeException.class)
    public ResponseEntity<ErrorResponse> handleInvaildAccessCodeException(Exception ex) {
        log.error("Invaild access code error: " +
                "message : " + ex.getMessage());
        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage()),
                HttpStatus.FORBIDDEN
        );
    }
}