package com.ssafy.domain.boj.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.domain.boj.dto.BojUserDto;
import com.ssafy.domain.boj.dto.BojUserResponse;
import com.ssafy.domain.boj.entity.BojUser;
import com.ssafy.domain.boj.error.BojNotFoundException;
import com.ssafy.domain.boj.error.BojServerException;
import com.ssafy.domain.boj.repository.BojUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BojService {

    private final WebClient webClient;
    private final BojUserRepository bojUserRepository;

    private static final String SOLVED_AC_API_URL = "https://solved.ac/api/v3";
    private static final Duration CACHE_DURATION = Duration.ofHours(1); // 1시간마다 갱신

    @Transactional
    public BojUserResponse getTierInfo(String bojId) {
        // 캐시된 데이터 확인
        BojUser bojUser = bojUserRepository.findByHandle(bojId)
                .filter(user -> user.getLastUpdated().plus(CACHE_DURATION).isAfter(LocalDateTime.now()))
                .orElseGet(() -> updateBojUserInfo(bojId));

        return convertToResponse(bojUser);
    }

    private BojUser updateBojUserInfo(String bojId) {
        BojUserDto userInfo = fetchUserInfoFromSolvedAc(bojId);
        String tier = convertTierToString(userInfo.getTier());

        BojUser bojUser = bojUserRepository.findByHandle(bojId)
                .map(user -> {
                    user.updateTierInfo(tier);
                    return user;
                })
                .orElseGet(() -> BojUser.builder()
                        .handle(bojId)
                        .tier(tier)
                        .lastUpdated(LocalDateTime.now())
                        .build());

        return bojUserRepository.save(bojUser);
    }

    /*
    public BojUserDto fetchUserInfoFromSolvedAc(String bojId) {
    System.out.println("fetchUserInfoFromSolvedAc 메서드 시작");
    return webClient.get()
            .uri(SOLVED_AC_API_URL+"/user/show?handle={bojId}", bojId)
            .retrieve()
            .onStatus(status -> status.is4xxClientError(),
                    error -> Mono.error(new BojNotFoundException("사용자를 찾을 수 없습니다: " + bojId)))
            .onStatus(status -> status.is5xxServerError(),
                    error -> Mono.error(new BojServerException("solved.ac 서버 오류")))
            .bodyToMono(BojUserDto.class)
            .block();
}
     */

    public BojUserDto fetchUserInfoFromSolvedAc(String bojId) {
        System.out.println("fetchUserInfoFromSolvedAc 메서드 시작");
        return webClient.get()
                .uri(SOLVED_AC_API_URL + "/user/show?handle={bojId}", bojId)
                .retrieve()
                .bodyToMono(String.class)  // 먼저 String으로 응답을 받아서 확인
                .doOnNext(response -> {
                    System.out.println("API 응답: " + response);
                })
                .map(response -> {
                    // ObjectMapper를 사용하여 응답을 BojUserDto로 변환
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        return mapper.readValue(response, BojUserDto.class);
                    } catch (JsonProcessingException e) {
                        System.out.println("JSON 파싱 에러: " + e.getMessage());
                        throw new RuntimeException("JSON 파싱 실패", e);
                    }
                })
                .doOnNext(dto -> {
                    System.out.println("변환된 DTO - handle: " + dto.getHandle());
                    System.out.println("변환된 DTO - tier: " + dto.getTier());
                })
                .block();
    }

    private BojUserResponse convertToResponse(BojUser bojUser) {
        return BojUserResponse.builder()
                .handle(bojUser.getHandle())
                .tier(bojUser.getTier())
                .build();
    }

    private String convertTierToString(int tier) {
        String[] tiers = {
                "Unrated",
                "Bronze V", "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
                "Silver V", "Silver IV", "Silver III", "Silver II", "Silver I",
                "Gold V", "Gold IV", "Gold III", "Gold II", "Gold I",
                "Platinum V", "Platinum IV", "Platinum III", "Platinum II", "Platinum I",
                "Diamond V", "Diamond IV", "Diamond III", "Diamond II", "Diamond I",
                "Ruby V", "Ruby IV", "Ruby III", "Ruby II", "Ruby I",
                "Master"
        };
        return tiers[tier];
    }
}