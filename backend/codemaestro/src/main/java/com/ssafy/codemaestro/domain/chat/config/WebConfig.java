package com.ssafy.codemaestro.domain.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
CORS 설정 클래스
    WebMvcConfigurer 인터페이스 구현을 통한 MVC패턴 커스터마이징
    기타방법 1: @CrossOrigin 어노테이션 사용
    기타방법 2: SecurityConfig에서 설정
    -> 전역 설정: 모든 컨트롤러에 한번에 적용 / 유지보수: 한 곳에서 CORS 정책을 관리 / 확장성: CORS 외에도 다른 MVC 설정들을 추가하기 쉬움
    등을 고려하려 인터페이스 구현으로 결정
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 백엔드 서버 엔드포인트(URL 경로) 지정
                .allowedOrigins("http://localhost:3000") // 요청 보내는 클라이언트 도메인 지정 - 여기서는 리액트서버
                .allowedOrigins("http://localhost:5173") // 요청 보내는 클라이언트 도메인 지정 - 여기서는 리액트서버
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // 인증된 요청을 허용 (쿠키, Authorization 헤더 등)
    }
}