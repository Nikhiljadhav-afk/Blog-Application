package com.blog.service;

import com.blog.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(Long userId);

    RefreshToken verifyExpiration(String token);
    
    

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(Long userId);

    void deleteByToken(String token);
    
}
