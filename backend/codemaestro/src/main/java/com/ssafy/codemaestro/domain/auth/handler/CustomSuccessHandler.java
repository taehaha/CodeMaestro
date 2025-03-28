package com.ssafy.codemaestro.domain.auth.handler;

import com.ssafy.codemaestro.domain.auth.entty.CustomOAuth2UserDetails;
import com.ssafy.codemaestro.global.entity.RefreshEntity;
import com.ssafy.codemaestro.domain.auth.repository.RefreshRepository;
import com.ssafy.codemaestro.global.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

/**
 * OAuth 성공시 실행되는 Handler
 */
@Component
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Value("${codemaestro.front.url}")
    private String FRONTEND_URL;

    @Value("${spring.jwt.expire-ms.refresh-token}")
    private Long REFRESH_TOKEN_VALIDITY_MS;

    private final JwtUtil jwtUtil;
    private final RefreshRepository refreshRepository;

    @Autowired
    public CustomSuccessHandler(JwtUtil jwtUtil, RefreshRepository refreshRepository) {
        this.jwtUtil = jwtUtil;
        this.refreshRepository = refreshRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2UserDetails customUserDetails = (CustomOAuth2UserDetails) authentication.getPrincipal();

        String userId = customUserDetails.getName();

//        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
//        GrantedAuthority authority = iterator.next();
//        String role = authority.getAuthority();

        String refresh = jwtUtil.createRefreshToken(userId);

        addRefreshEntity(userId, refresh, REFRESH_TOKEN_VALIDITY_MS);

        response.setStatus(HttpServletResponse.SC_OK);

        //TODO: 리다이렉트할 위치
        response.sendRedirect(FRONTEND_URL + "/oauth2/signin?refresh=" + refresh);
    }

    private void addRefreshEntity(String userId, String refreshToken, Long expireMs) {
        Date date = new Date(System.currentTimeMillis() + expireMs);

        RefreshEntity refreshEntity = new RefreshEntity();
        refreshEntity.setEmail(userId);
        refreshEntity.setRefreshToken(refreshToken);
        refreshEntity.setExpiration(date.toString());

        refreshRepository.save(refreshEntity);
    }
}
