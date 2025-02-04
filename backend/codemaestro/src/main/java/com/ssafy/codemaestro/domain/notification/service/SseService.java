package com.ssafy.codemaestro.domain.notification.service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
@Service
@Slf4j
public class SseService {
    @Getter
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<Long, Queue<Object>> lostDataMap = new ConcurrentHashMap<>();

    // 구독
    public SseEmitter subscribe(Long userId) {
        log.info("-- SSE Service 연결 시작 userId: {} --", userId);

        // 1. 먼저 미수신 데이터 큐를 초기화/확인
        Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());

        // 2. 이전 연결이 있다면 정리
        removeEmitterIfExists(userId);

        // 3. 새로운 emitter 생성
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        // 4. 이벤트 핸들러 설정
        emitter.onCompletion(() -> {
            log.info("SSE oncompletion 실행으로 emiiter 제거됨: {}", userId);
            removeEmitterIfExists(userId);
        });

        emitter.onTimeout(() -> {
            log.info("SSE timeout 실행으로 emiiter 제거됨: {}", userId);
            removeEmitterIfExists(userId);
        });

        try {
            // 5. 미수신 데이터 전송 시도
            if (!lostData.isEmpty()) { // 미수신 데이터가 있다면,
                List<Object> dataToSend = new ArrayList<>(lostData);
                lostData.clear(); // 큐 비우기

                for (Object data : dataToSend) {
                    try {
                        log.info("Sending lost data item to userId {}: {}", userId, data);
                        emitter.send(SseEmitter.event()
                                .name("lost-data")
                                .data(data));
                    } catch (IOException e) {
                        log.error("Failed to send lost data item to userId: {}", userId, e);
                        lostData.offer(data); // 실패한 데이터 다시 큐에 넣기
                    }
                }
            }

            // 6. 연결 확인 메시지 전송
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("Connected!"));

        } catch (IOException e) {
            log.error("Error during SSE subscription for userId: {}", userId, e);
            emitters.remove(userId);
            throw new RuntimeException("Failed to establish SSE connection", e);
        }

        log.info("-- SSE Service 연결 완료 for userId: {} --", userId);
        return emitter;
    }

    public void sendNotification(Long userId, String eventType, Object data) {
        SseEmitter emitter = emitters.get(userId);

        if (emitter != null) { // 연결된 emitter가 있으면 즉시 전송
            try {
                emitter.send(SseEmitter.event()
                        .name(eventType)
                        .data(data));
                log.debug("Successfully sent notification to user {}", userId);

            } catch (IOException e) {
                log.error("Failed to send notification to user {}", userId, e);
                saveToLostData(userId, data);
                emitters.remove(userId); // 문제가 있는 연결 제거
            }
        } else { // 연결된 emitters가 없는 경우 -> 미수신 데이터로 저장되어야 함.
            saveToLostData(userId, data);
            log.debug("User {} is offline, notification saved to lost data : {} ", userId, data);

        }
    }

    private void saveToLostData(Long userId, Object data) {
        Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());
        lostData.offer(data);
        log.debug("lost data : {} ", data);
    }

    public void removeEmitterIfExists(Long userId) {
        SseEmitter existingEmitter = emitters.remove(userId);
        if (existingEmitter != null) {
            try {
                existingEmitter.complete();
                log.info("emitter  연결 종료 for userId: {}", userId);
            } catch (Exception e) {
                log.warn("Error while removing existing emitter for userId: {}", userId, e);
            }
        }
    }

    public Queue<Object> getLostData(Long userId) {
        return lostDataMap.getOrDefault(userId, new LinkedList<>());
    }
}