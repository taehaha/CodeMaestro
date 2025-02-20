package com.ssafy.codemaestro.global.util;

import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import com.ssafy.codemaestro.global.exception.NicknameGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@Slf4j
@RequiredArgsConstructor
public class NicknameGeneratorUtil {

    private final UserRepository userRepository;
    private static final int MAX_ATTEMPTS = 10;

    // 형용사 리스트
    private static final List<String> ADJECTIVES = Arrays.asList(
            "행복한", "즐거운", "귀여운", "멋진", "신나는", "따듯한", "차분한", "활기찬"
    );

    // 명사 리스트
    private static final List<String> NOUNS = Arrays.asList(
            "개발자", "알고리즘", "자바", "파이썬", "C++", "마스터", "버그잡이", "마니아"
    );

    /**
     * 유니크한 랜덤 닉네임을 생성. 최대 10번 시도
     * @return 생성된 닉네임
     * @throws NicknameGenerationException
     */
    public String generateUniqueNickname() {
        int attemps = 0;
        String nickname;

        do {
            if(attemps >= MAX_ATTEMPTS) {
                log.error("닉네임 생성 최대 시도 횟수({}) 초과", MAX_ATTEMPTS);
                throw new NicknameGenerationException("Nickname created fail");
            }

            nickname = generateRandomNickname();
            attemps++;
        } while (userRepository.existsByNickname(nickname)); // 랜덤생성 후 중복확인

        return nickname;
    }

    /**
     * 단순 랜덤 닉네임을 생성
     * @return 생성된 닉네임
     */
    private String generateRandomNickname() {
        Random random = new Random();

        String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(random.nextInt(NOUNS.size()));
        String number = String.format("%04d", random.nextInt(9000) + 1000); // 1000~9999 숫자 랜덤 생성

        return adjective + noun + number;
    }
}
