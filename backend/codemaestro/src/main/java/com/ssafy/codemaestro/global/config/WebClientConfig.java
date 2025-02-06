package com.ssafy.codemaestro.global.config;

import io.netty.handler.codec.base64.Base64Encoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;

@Slf4j
@Configuration
public class WebClientConfig {
    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openVidu.username}")
    private String OPENVIDU_USERNAME;

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
        String authorization = OPENVIDU_USERNAME + ":" + OPENVIDU_SECRET;
        String encodedAuthorization = encoder.encodeToString(authorization.getBytes());

        return WebClient.builder()
                .baseUrl(OPENVIDU_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic ", encodedAuthorization)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .filters(exchangeFilterFunctions -> exchangeFilterFunctions.add(this::logRequest))
                .build();
    }

    // Request의 헤더 로그를 찍어주는 함수
    private Mono<ClientResponse> logRequest(ClientRequest request, ExchangeFunction next) {
        log.info("Request URI {}", request.url());
        request.headers().forEach((name, values) -> log.info("Header '{}' : {}", name, values));
        return next.exchange(request);
    }
}