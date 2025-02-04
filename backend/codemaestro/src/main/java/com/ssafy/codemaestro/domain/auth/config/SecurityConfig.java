package com.ssafy.codemaestro.domain.auth.config;

import com.ssafy.codemaestro.domain.auth.filter.CustomLogoutFilter;
import com.ssafy.codemaestro.domain.auth.filter.JwtFilter;
import com.ssafy.codemaestro.domain.auth.filter.LoginFilter;
import com.ssafy.codemaestro.domain.auth.handler.CustomSuccessHandler;
import com.ssafy.codemaestro.domain.auth.repository.RefreshRepository;
import com.ssafy.codemaestro.domain.auth.service.CustomOauth2UserService;
import com.ssafy.codemaestro.global.util.JwtUtil;
import com.ssafy.codemaestro.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 로그인에 사용되는 URL. Filter로 넘겨짐
    @Value("${spring.jwt.login.local.uri}")
    private String LOGIN_URI;

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshRepository refreshRepository;

    // OAuth2 관련
    private final CustomSuccessHandler customSuccessHandler;

    @Autowired
    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil, UserRepository userRepository, RefreshRepository refreshRepository, CustomSuccessHandler customSuccessHandler) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.refreshRepository = refreshRepository;
        this.customSuccessHandler = customSuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomOauth2UserService customOauth2UserService) throws Exception {
        //Security 관련 CORS 설정
        http.cors(cors -> cors
                .configurationSource(new CorsConfigurationSource() {

                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration config = new CorsConfiguration();

                        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5176"));
                        config.setAllowedOriginPatterns(Collections.singletonList("*"));
                        config.setAllowedMethods(Collections.singletonList("*"));
                        config.setAllowCredentials(true);
                        config.setAllowedHeaders(Collections.singletonList("*"));
                        config.setMaxAge(3600L);

                        config.setExposedHeaders(List.of("access", "Set-Cookie"));

                        return config;
                    }
                })
        );

        http
                .csrf(auth -> auth.disable())
                .formLogin(auth -> auth.disable())
                .httpBasic(auth -> auth.disable())
                .logout(auth -> auth.disable());

        // 라우팅 관리
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/signin", "/auth/signup", "/" ).permitAll()
                .requestMatchers("/oauth2/authorization/**", "/auth/oauth2/**").permitAll()
                .requestMatchers("/reissue", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/exist/**").permitAll()
                .requestMatchers("/unsubscribe/**").permitAll() // 로그아웃시, SSE 구독 해제
                .anyRequest().authenticated()
        );

        // 세션 비활성화
        http
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));


        // JWT 관련 Filter 추가
        http
                .addFilterBefore(new JwtFilter(jwtUtil, userRepository), LoginFilter.class) // 로그인된 유저 확인 필터
                .addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil, refreshRepository, LOGIN_URI), UsernamePasswordAuthenticationFilter.class) // 로그인 과정 필터
                .addFilterBefore(new CustomLogoutFilter(jwtUtil, refreshRepository), LogoutFilter.class);

        // Oauth2 Client 관련 설정
        http
                .oauth2Login(oauth2 -> oauth2
                        .redirectionEndpoint(endpoint -> endpoint.baseUri("/auth/oauth2/code/*"))
                        .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                                .userService(customOauth2UserService))
                        .successHandler(customSuccessHandler)
                )
                .exceptionHandling().authenticationEntryPoint(customAuthenticationEntryPoint()); // 로그인 상태가 아니면 401 반환

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    private AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        };
    }
}
