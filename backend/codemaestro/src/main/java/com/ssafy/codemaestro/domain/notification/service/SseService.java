package com.ssafy.codemaestro.domain.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

//@Service
//@Slf4j
//public class SseService {
//    // userId 별로 1개의 스트림이 생성 된다.
//    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
//
//    // 유저별 미수신 알림 데이터를 저장하는 Map
//    private final Map<Long, Queue<Object>> lostDataMap = new ConcurrentHashMap<>();
//
//    // SSE 스트림 연결
//// SSE 스트림 연결
//    public SseEmitter subscribe(Long userId) {
//        log.info("=== Starting SSE subscription for userId: {} ===", userId);
//
//        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
//        emitters.put(userId, emitter);
//        log.info("Created new SSE emitter for userId: {}", userId);
//
//        emitter.onCompletion(() -> {
//            log.info("SSE connection completed for userId: {}", userId);
//            emitters.remove(userId);
//            lostDataMap.putIfAbsent(userId, new LinkedList<>());
//        });
//
//        emitter.onTimeout(() -> {
//            log.info("SSE connection timed out for userId: {}", userId);
//            emitters.remove(userId);
//            lostDataMap.putIfAbsent(userId, new LinkedList<>());
//        });
//
//        try {
//            // lostDataMap 상태 확인
//            log.info("Current lostDataMap size: {}", lostDataMap.size());
//            log.info("lostDataMap contains key {}: {}", userId, lostDataMap.containsKey(userId));
//
//            Queue<Object> lostData = lostDataMap.get(userId);
//
//            if(lostData == null) {
//                log.info("No lost data queue exists for userId: {}", userId);
//            } else {
//                log.info("Lost data queue found for userId: {}, size: {}", userId, lostData.size());
//                if(!lostData.isEmpty()) {
//                    log.info("Lost data contents for userId {}:", userId);
//                    lostData.forEach(data -> log.info("Data item: {}", data));
//                } else {
//                    log.info("Lost data queue is empty for userId: {}", userId);
//                }
//            }
//
//            // 미수신 데이터 전송 시도
//            if(lostData != null && !lostData.isEmpty()) {
//                log.info("Attempting to send {} lost data items to userId: {}", lostData.size(), userId);
//                while(!lostData.isEmpty()) {
//                    Object data = lostData.poll();
//                    log.info("Sending lost data item: {}", data);
//                    emitter.send(SseEmitter.event()
//                            .name("lost-data")
//                            .data(data));
//                    log.info("Successfully sent lost data item to userId: {}", userId);
//                }
//            }
//
//            log.info("Sending connection confirmation to userId: {}", userId);
//            emitter.send(SseEmitter.event()
//                    .name("connect")
//                    .data("Connected!"));
//            log.info("Successfully sent connection confirmation to userId: {}", userId);
//
//        } catch (IOException e) {
//            log.error("Error during SSE subscription for userId: {}", userId, e);
//            emitters.remove(userId);
//        }
//
//        log.info("=== Completed SSE subscription setup for userId: {} ===", userId);
//        return emitter;
//    }
//
//
////    public SseEmitter subscribe(Long userId) {
////        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);  // 클라이언트와의 연결 유지
////        emitters.put(userId, emitter);
////
////        emitter.onCompletion(() -> { // 연결 종료 시
////            emitters.remove(userId); // 스트림 삭제
////            lostDataMap.putIfAbsent(userId, new LinkedList<>()); // 미수신 데이터 큐 생성
////        });
////        emitter.onTimeout(() -> { // 타임아웃 시
////            emitters.remove(userId); // 삭제
////            lostDataMap.putIfAbsent(userId, new LinkedList<>()); // 미수신 데이터 큐 생성
////        });
////
////        // 연결
////        try {
////            // 디버깅: 현재 저장된 미수신 데이터 출력
////            log.info("=== Lost Data for userId {}: ===", userId);
////            Queue<Object> lostData = lostDataMap.get(userId);
////            if(lostData != null) {
////                lostData.forEach(data ->
////                        log.info("Lost Data item: {}", data)
////                );
////            }
////            log.info("=== End of Lost Data ===");
////
////            // 미수신 데이터 전송
////            if(lostData != null && !lostData.isEmpty()) {
////                while(!lostData.isEmpty()) {
////                    Object data = lostData.poll();
////                    emitter.send(SseEmitter.event()
////                            .name("lost-data")
////                            .data(data));
////                }
////            }
////
////            emitter.send(SseEmitter.event()
////                    .name("connect")
////                    .data("Connected!"));
////        } catch (IOException e) {
////            emitters.remove(userId);
////        }
////
////        return emitter;
////    }
//
//    // SSE 스트림으로 알림 전송
//    // userId : 유저별 연결 스트림 찾기
//    // eventType : 알림 종류(친구 요청, 그룹 참가 요청, 회의 참가 요청 등)
//    // data : 알림에 보낼 DTO
//    public void sendNotification(Long userId, String eventType, Object data) throws IOException {
//        SseEmitter emitter = emitters.get(userId);
//        if (emitter != null) {
//            try {
//                emitter.send(SseEmitter.event()
//                        .name(eventType)
//                        .data(data));
//
//
//
//            } catch(IOException e) {
//                // 전송 실패 시 미수신 데이터로 저장하기
//                Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());
//                lostData.offer(data);
//                // 로그만 남기고 예외는 throw하지 않음
//                log.debug("Failed to send notification to user {}, saved to lost data", userId);
//            }
//        } else {
//            // 연결된 emitter가 없을 시 미수신 데이터로 저장하기
//            Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());
//            lostData.offer(data);
//            log.debug("User {} is offline, notification saved to lost data", userId);
//        }
//    }
//
//    // 미수신 데이터 조회
//    public Queue<Object> getLostData(Long userId) {
//        return lostDataMap.getOrDefault(userId, new LinkedList<>());
//    }
//
//
//    // 구독 해제
//    public void unsubscribe(Long userId) {
//        emitters.remove(userId);
//    }
//}

@Service
@Slf4j
public class SseService {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<Long, Queue<Object>> lostDataMap = new ConcurrentHashMap<>();

    // 구독
    public SseEmitter subscribe(Long userId) {
        log.info("=== Starting SSE subscription for userId: {} ===", userId);

        // 1. 먼저 미수신 데이터 큐를 초기화/확인
        Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());

        // 2. 이전 연결이 있다면 정리
        removeEmitterIfExists(userId);

        // 3. 새로운 emitter 생성
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        // 4. 이벤트 핸들러 설정
        emitter.onCompletion(() -> {
            log.info("SSE connection completed for userId: {}", userId);
            emitters.remove(userId);
        });

        emitter.onTimeout(() -> {
            log.info("SSE connection timed out for userId: {}", userId);
            emitters.remove(userId);
        });

        try {
            // 5. 미수신 데이터 전송 시도
            if (!lostData.isEmpty()) {
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

        log.info("=== Completed SSE subscription setup for userId: {} ===", userId);
        return emitter;
    }

    public void sendNotification(Long userId, String eventType, Object data) {
        SseEmitter emitter = emitters.get(userId);

        if (emitter != null) {
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
        } else {
            saveToLostData(userId, data);
            log.debug("User {} is offline, notification saved to lost data", userId);
        }
    }

    private void saveToLostData(Long userId, Object data) {
        Queue<Object> lostData = lostDataMap.computeIfAbsent(userId, k -> new LinkedList<>());
        lostData.offer(data);
        log.debug("Saved notification to lost data for user {}", userId);
    }

    private void removeEmitterIfExists(Long userId) {
        SseEmitter existingEmitter = emitters.remove(userId);
        if (existingEmitter != null) {
            try {
                existingEmitter.complete();
                log.info("Removed existing emitter for userId: {}", userId);
            } catch (Exception e) {
                log.warn("Error while removing existing emitter for userId: {}", userId, e);
            }
        }
    }

    public void unsubscribe(Long userId) {
        removeEmitterIfExists(userId);
    }

    public Queue<Object> getLostData(Long userId) {
        return lostDataMap.getOrDefault(userId, new LinkedList<>());
    }


    private void logEmittersStatus() {
        log.info("현재 SSE 연결 상태 =========================");
        log.info("총 연결 수: {}", emitters.size());

        emitters.forEach((userId, emitter) -> {
            try {
                // ping 테스트로 연결 상태 확인
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data("connection test"));
                log.info("userId: {} - 연결 활성화", userId);
            } catch (IOException e) {
                log.info("userId: {} - 연결 끊김", userId);
                emitters.remove(userId);
            }
        });
        log.info("==========================================");
    }

    public Map<Long, SseEmitter> getEmitters() {
        return emitters;
    }
}