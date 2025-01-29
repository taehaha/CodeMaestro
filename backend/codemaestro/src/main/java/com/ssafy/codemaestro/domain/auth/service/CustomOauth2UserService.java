package com.ssafy.codemaestro.domain.auth.service;

import com.ssafy.codemaestro.domain.auth.dto.CustomOAuth2UserDetails;
import com.ssafy.codemaestro.domain.auth.dto.KakaoOAuth2Response;
import com.ssafy.codemaestro.domain.auth.dto.NaverOAuth2Response;
import com.ssafy.codemaestro.domain.auth.dto.OAuth2Response;
import com.ssafy.codemaestro.domain.user.entity.LoginProvider;
import com.ssafy.codemaestro.domain.user.entity.User;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOauth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Autowired
    public CustomOauth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // OAuth2 Authorization 서버 구분
        OAuth2Response oAuth2Response = null;
        if (registrationId.equals("naver")) {
            oAuth2Response = new NaverOAuth2Response(oAuth2User.getAttributes());
        } else if (registrationId.equals("kakao")) {
            oAuth2Response = new KakaoOAuth2Response(oAuth2User.getAttributes());
        } else {
            return null;
        }


        // UserEntity 생성에 사용하는 데이터
        LoginProvider loginProvider = LoginProvider.valueOf(oAuth2Response.getProvider());
        String loginId = oAuth2Response.getProviderId();
        String nickname = oAuth2Response.getName();
        String profileImageUrl = oAuth2Response.getProfileImageUrl();

        // 이미 로그인 해본 User 인지 검증함
        User existData = userRepository.findByLoginIdAndLoginProvider(loginId, loginProvider);

        if (existData == null) { // 한 번도 로그인하지 않은 User일 경우 새로운 컬럼을 추가해줌
            User userEntity = new User();
            userEntity.setLoginProvider(loginProvider);
            userEntity.setLoginId(loginId);
            userEntity.setNickname(nickname);
            userEntity.setProfileImageUrl(profileImageUrl);

            userRepository.save(userEntity);

            return new CustomOAuth2UserDetails(userEntity);
        } else { // 이미 로그인을 해본 User일 경우 처리
//            existData.setUsername(username);
//            existData.setRole("ROLE_USER");

            return new CustomOAuth2UserDetails(existData);
        }
    }
}
