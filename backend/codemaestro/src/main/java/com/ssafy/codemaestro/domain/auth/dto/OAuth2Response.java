package com.ssafy.codemaestro.domain.auth.dto;

public interface OAuth2Response {
    // 제공자 (naver, google 등...)
    String getProvider();

    // 제공자가 발급해주는 아이디
    String getProviderId();

    // 사용자 이름
    String getName();

    // 사용자 썸네일
    String getProfileImageUrl();
}
