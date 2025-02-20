package com.ssafy.codemaestro.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutResponseDto {
    String refreshToken;
}
