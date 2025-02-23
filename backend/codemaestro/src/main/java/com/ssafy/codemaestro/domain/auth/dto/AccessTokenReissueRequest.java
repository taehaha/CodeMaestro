package com.ssafy.codemaestro.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccessTokenReissueRequest {
    String refreshToken;
}
