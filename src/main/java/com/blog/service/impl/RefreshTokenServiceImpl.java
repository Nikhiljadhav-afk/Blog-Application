package com.blog.service.impl;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.entity.RefreshToken;
import com.blog.entity.User;
import com.blog.exception.TokenRefreshException;
import com.blog.repository.RefreshTokenRepository;
import com.blog.repository.UserRepository;
import com.blog.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional   // 🔥 VERY IMPORTANT
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${app.jwt.refresh-expiration-ms}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return refreshTokenRepository.findByUserId(userId)
                .map(existingToken -> {
                    // ✅ UPDATE existing token
                    existingToken.setToken(UUID.randomUUID().toString());
                    existingToken.setExpiryDate(
                            Instant.now().plusMillis(refreshTokenDurationMs)
                    );
                    return refreshTokenRepository.save(existingToken);
                })
                .orElseGet(() -> {
                    // ✅ CREATE only if not exists
                    RefreshToken refreshToken = RefreshToken.builder()
                            .user(user)
                            .token(UUID.randomUUID().toString())
                            .expiryDate(
                                    Instant.now().plusMillis(refreshTokenDurationMs)
                            )
                            .build();
                    return refreshTokenRepository.save(refreshToken);
                });
    }


    @Override
    public RefreshToken verifyExpiration(String token) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() ->
                        new TokenRefreshException(token, "Refresh token not found")
                );

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(token,
                    "Refresh token was expired. Please login again");
        }

        return refreshToken;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    // ✅ REQUIRED by AuthServiceImpl
    @Override
    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // ✅ REQUIRED by future logout / refresh flows
    @Override
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }
}
