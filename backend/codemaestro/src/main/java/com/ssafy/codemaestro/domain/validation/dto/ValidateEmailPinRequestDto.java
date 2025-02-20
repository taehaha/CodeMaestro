package com.ssafy.codemaestro.domain.validation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidateEmailPinRequestDto {
    String email;
    String pin;
}
