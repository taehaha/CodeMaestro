package com.ssafy.domain.boj.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class BojServerException extends RuntimeException {
    public BojServerException(String message) {
        super(message);
    }
}