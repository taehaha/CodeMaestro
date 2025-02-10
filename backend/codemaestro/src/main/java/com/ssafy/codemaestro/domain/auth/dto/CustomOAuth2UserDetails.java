package com.ssafy.codemaestro.domain.auth.dto;

import com.ssafy.codemaestro.global.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

/**
 * Spring Security에서 OAuth2 로그인을 위한 User 정보를 저장하는 Class.
 */
public class CustomOAuth2UserDetails implements OAuth2User {
    private final User user;

    public CustomOAuth2UserDetails(User user) {
        this.user = user;
    }

    // OAuth2User 용
    @Override
    public String getName() {
        return String.valueOf(user.getId());
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

//        authorities.add(new GrantedAuthority() {
//            @Override
//            public String getAuthority() {
//                return user.getRole();
//            }
//        });
//
//        return authorities;

        return null;
    }
}
