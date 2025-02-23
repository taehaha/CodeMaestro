package com.ssafy.codemaestro.global.exception;

import lombok.Getter;

@Getter
public class NicknameGenerationException extends RuntimeException {
    public NicknameGenerationException(String message) {
        super(message);
    }
}
