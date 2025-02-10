package com.ssafy.codemaestro.domain.notification.controller;

import com.ssafy.codemaestro.domain.notification.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        log.info("===== SSE 컨트롤러 =====");
        log.info("userId: {} 연결 시도", userId);
        log.info("연결 전 emitters ID ({}개) : {}", sseService.getEmitters().size(), sseService.getEmitters().keySet());

        // 권한 검사
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        SseEmitter emitter = sseService.subscribe(userId);

        log.info("연결 후 emitters ID ({}개) : {}", sseService.getEmitters().size(), sseService.getEmitters().keySet());
        log.info("========================");

        return emitter;
    }

    // 구독 종료
    @GetMapping("/unsubscribe/{userId}")
    public void unsubscribe(@PathVariable Long userId) {
        SseEmitter emitter = sseService.getEmitters().get(userId);
        if (emitter != null) {
            emitter.complete();
            sseService.getEmitters().remove(userId);
        }
    }
}
