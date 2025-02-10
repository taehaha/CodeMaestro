package com.ssafy.codemaestro.global.exception.openvidu;

public class CannotFindConnectionException extends RuntimeException {
    Long userId;
    public CannotFindConnectionException(Long userId, String message) {
        super(message);
        this.userId = userId;
    }
}
