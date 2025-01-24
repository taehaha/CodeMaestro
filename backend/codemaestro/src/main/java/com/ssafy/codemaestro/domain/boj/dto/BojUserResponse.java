package com.ssafy.codemaestro.domain.boj.dto;

import lombok.*;

@Getter
@Builder
public class BojUserResponse {
    private String handle;
    private String tier;
}