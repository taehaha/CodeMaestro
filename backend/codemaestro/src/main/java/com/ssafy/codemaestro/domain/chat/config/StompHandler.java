package com.ssafy.codemaestro.domain.chat.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.Objects;

/*
 WebSocket STOMP 프로토콜의 메시지 처리를 인터셉트하는 핸들러
    각 이벤트마다 로그를 남겨 모니터링 가능
    CONNECT/CONNECTED는 전체 메시지를 로깅
    나머지는 sessionId만 로깅하여 로그 크기 최적화
 */
@Component
@Slf4j
public class StompHandler implements ChannelInterceptor {

    /*
    메시지가 전송된 후에 실행되는 콜백 메서드
        message: 전송된 메시지
        channel: 메시지가 전송된 채널
        sent: 전송 성공 여부
     */
    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message); // STOMP헤더 정보 추출
        String sessionId = accessor.getSessionId(); // 각 연결의 고유 식별자 획득

        switch (Objects.requireNonNull(accessor.getCommand())) { // 다양한 STOMP 커맨드 처리
            case CONNECT -> log.info("CONNECT: " + message); // 연결 시도
            case CONNECTED -> log.info("CONNECTED: " + message);
            case DISCONNECT -> log.info("DISCONNECT: " + message);
            case SUBSCRIBE -> log.info("SUBSCRIBE: " + message);
            case UNSUBSCRIBE -> log.info("UNSUBSCRIBE: " + sessionId);
            case SEND -> log.info("SEND: " + sessionId);
            case MESSAGE -> log.info("MESSAGE: " + sessionId); // 메세지 전송
            case ERROR -> log.info("ERROR: " + sessionId); // 메세지 수신
            default -> log.info("UNKNOWN: " + sessionId);
        }
    }
}