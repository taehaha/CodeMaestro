package com.ssafy.codemaestro.domain.boj.controller;

import com.ssafy.codemaestro.domain.boj.dto.BojUserResponse;
import com.ssafy.codemaestro.domain.boj.service.BojService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/boj")
@RequiredArgsConstructor
public class BojController {

    private final BojService bojService;

    @GetMapping("/tier/{bojId}")
    public ResponseEntity<BojUserResponse> getUserTierInfo(@PathVariable String bojId) {
        return ResponseEntity.ok(bojService.getTierInfo(bojId));
    }
}
