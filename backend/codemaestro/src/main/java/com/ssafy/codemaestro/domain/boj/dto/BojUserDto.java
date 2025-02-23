package com.ssafy.codemaestro.domain.boj.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BojUserDto {
    private String handle;
    private int tier;
}