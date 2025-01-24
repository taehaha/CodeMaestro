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
    @GetMapping("/api/subscribe/{userId}")
    public SseEmitter subscribe (@PathVariable Long userId) {
        return sseService.subscribe(userId);
    }
}
