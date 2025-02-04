package com.ssafy.codemaestro.domain.notification.controller;

import com.ssafy.codemaestro.domain.notification.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final SseService sseService;

    // 구독 처리
    // 보통 사용자가 로그인 시 스트림 구독
    @GetMapping("/subscribe/{userId}")
    public SseEmitter subscribe (@PathVariable Long userId) {
//        return sseService.subscribe(userId);
        // 현재 연결된 모든 emitter 정보를 로그로 출력
        log.info("===== SSE 컨트롤러 =====");
        log.info("userId: {} 연결 시도", userId);
        log.info("연결된 emitters 개수 : {}", sseService.getEmitters().size());

        SseEmitter emitter = sseService.subscribe(userId);

        // 연결 후 상태
        log.info("연결 후 emitters 개수 : {}", sseService.getEmitters().size());
        log.info("========================");

        return emitter;
    }

    // 구독 종료
    @GetMapping("/unsubscribe/{userId}")
    public void unsubscribe(@PathVariable Long userId) {
        log.info("사용자 로그아웃 : emitters 연결 종료 시작 : {} ", userId);
        sseService.removeEmitterIfExists(userId);
    }

}
