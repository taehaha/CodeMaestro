package com.ssafy.codemaestro.domain.chat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/*
 WebSocket 설정 클래스

 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor  // final 필드에 대한 생성자 자동 생성 (의존성 주입)
public class WebSocketBrokerConfig implements WebSocketMessageBrokerConfigurer {

    final StompHandler stompHandler;

    // STOMP 엔드포인트 등록
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }

    // 메세지 브로커 설정
    /*
    메세지 브로커란? 발신자(publisher)로부터 메시지를 받아서 수신자(subscriber)에게 전달하는 중간 매개체
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트 ->  서버로 메시지를 보낼 때의 경로를 설정
        // @MessageMapping 메서드로 전달
        registry.setApplicationDestinationPrefixes("/pub");
        // 서버 -> 클라이언트로 메시지를 보낼 때 사용할 수 있는 경로들을 설정
        // 1. /sub - 특정 채팅방이나 개인간 메시지(여기서는 특정 채팅방 모두)
        // 2. /topic - 모든 구독자에게 브로드캐스트
        // 3. /queue - 특정 사용자에게만 전달
        registry.enableSimpleBroker("/sub", "/topic", "/queue");
    }

    // 인바운드 채널 설정
    // 인바운드란? 클라이언트 → 서버 방향으로 들어오는 메시지를 의미(단순 메세지, 접속 요청 등의 모든 요청)
    // 현재 StompHandler에서는 postSend(메세지 전송 후 로깅만 구현)
    // 인증, 에러처리 등 추가 가능
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompHandler);
    }
}