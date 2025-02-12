package com.ssafy.codemaestro.domain.boj.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.codemaestro.domain.boj.dto.BojUserDto;
import com.ssafy.codemaestro.domain.boj.dto.BojUserResponse;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.entity.BojUser;
import com.ssafy.codemaestro.domain.boj.repository.BojUserRepository;
import com.ssafy.codemaestro.global.entity.User;
import com.ssafy.codemaestro.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BojService {

    private final WebClient solvedAcWebClient;
    private final BojUserRepository bojUserRepository;
    private final UserRepository userRepository;

    private static final String SOLVED_AC_API_URL = "https://solved.ac/api/v3";
    private static final Duration CACHE_DURATION = Duration.ofHours(1); // 캐시 갱신 주기 : 1시간

    // 티어 정보 조회
    // 캐시된 데이터가 있고 유효기간이 지나지 않았다면 DB 정보 조회
    // 없거나 만료되었다면 백준API 호출
    @Transactional
    public BojUserResponse getTierInfo(Long userId, String bojId) {
        BojUser bojUser = bojUserRepository.findByHandle(bojId) // DB 정보 조회
                .filter(user -> user.getLastUpdated().plus(CACHE_DURATION).isAfter(LocalDateTime.now())) // 유효기간 확인
                .orElseGet(() -> updateBojUserInfo(userId, bojId)); // 필요한 경우에만 실행(지연실행)

        return convertToResponse(bojUser); // 엔티티 -> DTO 변환
    }

    // 티어 정보 수정 및 등록
    private BojUser updateBojUserInfo(Long userId, String bojId) {
        BojUserDto userInfo = fetchUserInfoFromSolvedAc(bojId);
        int tier = userInfo.getTier();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not Found"));

        BojUser bojUser = bojUserRepository.findByHandle(bojId)
                //  DB에 사용자가 있는 경우
                .map(existingUser -> {
                    existingUser.updateTierInfo(tier);
                    return existingUser;
                })
                // DB에 사용자가 없는 경우
                .orElseGet(() -> BojUser.builder()
                        .user(user)
                        .handle(bojId)
                        .tier(tier)
                        .lastUpdated(LocalDateTime.now())
                        .build());

        return bojUserRepository.save(bojUser);
    }

    // solved.ac.API 티어 받아오기
    public BojUserDto fetchUserInfoFromSolvedAc(String bojId) {
        return solvedAcWebClient.get()
                .uri(SOLVED_AC_API_URL + "/user/show?handle={bojId}", bojId)
                .retrieve() // HTTP 응답 받기
                .bodyToMono(String.class)  // 응답 -> String으로 반환
                .map(response -> {
                    // ObjectMapper를 사용하여 응답을 BojUserDto로 변환
                    // 변환 실패시 RuntimeException 발생
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        return mapper.readValue(response, BojUserDto.class);
                    } catch (JsonProcessingException e) {
                        System.out.println("JSON 파싱 에러: " + e.getMessage());
                        throw new RuntimeException("JSON 파싱 실패", e);
                    }
                })
                .block(); // 비동기 처리가 완료될 때까지 대기
    }

    // 엔티티 -> DTO 변환
    private BojUserResponse convertToResponse(BojUser bojUser) {
        return BojUserResponse.builder()
                .handle(bojUser.getHandle())
                .tier(bojUser.getTier())
                .build();
    }
}