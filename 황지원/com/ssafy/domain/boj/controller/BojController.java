package com.ssafy.domain.boj.controller;

import com.ssafy.domain.boj.dto.BojUserResponse;
import com.ssafy.domain.boj.service.BojService;
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
