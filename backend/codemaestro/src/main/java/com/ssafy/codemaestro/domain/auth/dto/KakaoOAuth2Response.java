package com.ssafy.codemaestro.domain.auth.dto;

import java.util.Iterator;
import java.util.Map;

public class KakaoOAuth2Response implements OAuth2Response {
    private final Map<String, Object> attribute;
    /*
    데이터 예시
    oAuth2User = Name: [3880395088], Granted Authorities: [[OAUTH2_USER, SCOPE_profile_nickname]], User Attributes: [{id=3880395088, connected_at=2025-01-16T03:59:33Z, properties={nickname=김태영}, kakao_account={profile_nickname_needs_agreement=false, profile={nickname=김태영, is_default_nickname=false}}}]
    키 : id, 값 : 3880395088
    키 : connected_at, 값 : 2025-01-16T03:59:33Z
    키 : properties, 값 : {nickname=김태영}
    키 : kakao_account, 값 : {profile_nickname_needs_agreement=false, profile={nickname=김태영, is_default_nickname=false}}
     */

    public KakaoOAuth2Response(Map<String, Object> attribute) {
//        this.attribute = (Map<String, Object>) attribute.get("kakao_account");
        this.attribute = attribute;
    }

    @Override
    public String getProvider() {
        Iterator<String> keys = attribute.keySet().iterator();
        while( keys.hasNext() ){
            String key = keys.next();
            String value = String.valueOf(attribute.get(key));
            System.out.println("키 : "+key+", 값 : "+value);
        }
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return attribute.get("id").toString();
    }

    @Override
    public String getName() {
        Map<String, Object> kakao_account = (Map<String, Object>) attribute.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakao_account.get("profile");

        return profile.get("nickname").toString();
    }

    @Override
    public String getProfileImageUrl() {
        Map<String, Object> kakao_account = (Map<String, Object>) attribute.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakao_account.get("profile");

        String profileImageUrl = (String) profile.get("profile_image_url");

        if (profileImageUrl == null) {
            return null;
        } else {
            return profileImageUrl;
        }
    }
}
