package com.ssafy.codemaestro.global.util;

import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private SecretKey secretKey;

    private JwtParser parser; // JWT Token 파싱에 사용되는 Parser

    public JwtUtil(@Value("${spring.jwt.secret}")String secret) {
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
        this.parser = Jwts.parser().verifyWith(secretKey).build();
    }

    public String getCategory(String token) {
        return parser.parseClaimsJws(token).getBody().get("category", String.class);
    }

    public String getId(String token) {
        return parser.parseSignedClaims(token).
                getPayload().get("id", String.class);
    }

    public Boolean isExpired(String token) {
        return parser.parseSignedClaims(token).getPayload().getExpiration().before(new Date());
    }

    public String createToken(String category, String id, Long expiresMs) {
        return Jwts.builder()
                .claim("category", category)
                .claim("id", id)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiresMs))
                .signWith(secretKey)
                .compact();
    }

    public Cookie createJwtCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setAttribute("SameSite","None");
        return cookie;
    }
}
