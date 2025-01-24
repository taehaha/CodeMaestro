package com.ssafy.codemaestro.domain.auth.filter;

import com.ssafy.codemaestro.domain.auth.entity.RefreshEntity;
import com.ssafy.codemaestro.domain.auth.repository.RefreshRepository;
import com.ssafy.codemaestro.domain.auth.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Date;
import java.util.Enumeration;

/**
 * Security의 formLogin 비활성화로 인해 UsernamePasswordAuthenticationToken이 비활성화 된 것을 강제로 다시 활성화 시켜줌.
 */
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshRepository refreshRepository;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil, RefreshRepository refreshRepository, String loginUrl) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.refreshRepository = refreshRepository;

        setFilterProcessesUrl(loginUrl); // 로그인 요청 경로
    }

    /**
     * username과 password를 추출한 뒤 검증 단계로 넘겨주는 함수
     * @param request
     * @param response
     * @return
     * @throws AuthenticationException
     */
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String username = obtainUsername(request);
        String password = obtainPassword(request);

        Enumeration<String> s = request.getHeaderNames();
        while (s.hasMoreElements()) {
            System.out.println(s.nextElement());
        }

        System.out.println("attemptAuthentication: " + username);
        System.out.println("attemptAuthentication: " + password);

        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password, null);

        return authenticationManager.authenticate(authRequest);
    }

    /**
     * 로그인 성공시 실행되는 함수
     * @param request
     * @param response
     * @param chain
     * @param authResult
     * @throws IOException
     * @throws ServletException
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        //유저 정보
        String id = authResult.getName();

//        Collection<? extends GrantedAuthority> authorities = authResult.getAuthorities();
//        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
//        GrantedAuthority auth = iterator.next();

        //토큰 생성
        String access = jwtUtil.createToken("access", id, 600000L);
        String refresh = jwtUtil.createToken("refresh", id,  86400000L);

        addRefreshEntity(id, refresh, 86400000L);

        //응답 설정
        response.setHeader("access", access);
        response.addCookie(jwtUtil.createJwtCookie("refresh", refresh));
        response.setStatus(HttpStatus.OK.value());
    }

    /**
     * 로그인 실패시 성공되는 함수
     * @param request
     * @param response
     * @param failed
     * @throws IOException
     * @throws ServletException
     */
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        response.setStatus(401);
    }

    private void addRefreshEntity(String email, String refreshToken, Long expireMs) {
        Date date = new Date(System.currentTimeMillis() + expireMs);

        RefreshEntity refreshEntity = new RefreshEntity();
        refreshEntity.setEmail(email);
        refreshEntity.setRefreshToken(refreshToken);
        refreshEntity.setExpiration(date.toString());

        refreshRepository.save(refreshEntity);
    }
}
