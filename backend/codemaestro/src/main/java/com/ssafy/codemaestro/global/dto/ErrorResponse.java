package com.ssafy.codemaestro.global.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class ErrorResponse {
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}