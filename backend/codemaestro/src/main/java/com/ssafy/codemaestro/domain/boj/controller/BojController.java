package com.ssafy.codemaestro.domain.boj.controller;

import com.ssafy.codemaestro.domain.boj.dto.BojUserResponse;
import com.ssafy.codemaestro.domain.boj.service.BojService;
import com.ssafy.codemaestro.global.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/boj")
@RequiredArgsConstructor
public class BojController {

    private final BojService bojService;

    @GetMapping("/tier")
    public ResponseEntity<BojUserResponse> getUserTierInfo(@RequestParam String bojId,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(bojService.getTierInfo(userId, bojId));
    }
}
