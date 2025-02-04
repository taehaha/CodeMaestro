package com.ssafy.codemaestro.global.exception;

import com.ssafy.codemaestro.global.dto.ErrorResponse;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindConnectionException;
import com.ssafy.codemaestro.global.exception.openvidu.CannotFindSessionException;
import com.ssafy.codemaestro.global.exception.openvidu.ConnectionAlreadyExistException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {



    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex) {
        log.error("Not found error: ", ex);
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        log.error("Unauthorized error: ", ex);
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
}
