package com.ssafy.domain.boj.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class BojNotFoundException extends RuntimeException {
    public BojNotFoundException(String message) {
        super(message);
    }
}
