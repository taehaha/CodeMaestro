package com.ssafy.codemaestro.global.config;

import io.netty.handler.codec.base64.Base64Encoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;

@Configuration
public class WebClientConfig {
    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    @Bean
    public WebClient solvedAcWebClient() {
        return WebClient.builder()
                .baseUrl("https://solved.ac/api/v3")
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE) // 응답 요청 형식
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Bean
    public WebClient openviduWebClient() {
        Base64.Encoder encoder = Base64.getEncoder();

        String encodedOpenviduSecret = encoder.encodeToString(OPENVIDU_SECRET.getBytes());
        return WebClient.builder()
                .baseUrl(OPENVIDU_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic ", encodedOpenviduSecret)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

    }
}

