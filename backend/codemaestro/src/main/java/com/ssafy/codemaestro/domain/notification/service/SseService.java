package com.ssafy.codemaestro.domain.notification.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {
    // userId 별로 1개의 스트림이 생성 된다.
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    // SSE 스트림 연결
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);  // 클라이언트와의 연결 유지
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));  // 연결 종료 시 삭제
        emitter.onTimeout(() -> emitters.remove(userId));     // 타임아웃 시 삭제

        // 연결 즉시 테스트 이벤트 전송
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("Connected!"));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    // SSE 스트림으로 알림 전송
    // userId : 유저별 연결 스트림 찾기
    // eventType : 알림 종류(친구 요청, 그룹 참가 요청, 회의 참가 요청 등)
    // data : 알림에 보낼 DTO
    public void sendNotification(Long userId, String eventType, Object data) throws IOException {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            emitter.send(SseEmitter.event()
                    .name(eventType)
                    .data(data));
        } else {
            throw new IllegalArgumentException("No emitter found for userId: " + userId);
        }
    }

    // 구독 해제
    public void unsubscribe(Long userId) {
        emitters.remove(userId);
    }
}
