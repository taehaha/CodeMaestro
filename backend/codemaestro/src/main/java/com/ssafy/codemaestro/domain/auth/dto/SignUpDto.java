package com.ssafy.codemaestro.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SignUpDto {
    private String email;
    private String password;
    private String nickname;
    private String description;

    @Override
    public String toString() {
        return "JoinDto [email=" + email + ", password=" + password + ", nickname=" + nickname;
    }
}
