package com.ssafy.codemaestro.global.exception.openvidu;

public class ConnectionAlreadyExistException extends RuntimeException {
    public ConnectionAlreadyExistException(String message) {
        super(message);
    }
}
