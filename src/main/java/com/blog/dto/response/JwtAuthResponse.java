package com.blog.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;


@Builder
@Data
public class JwtAuthResponse {

    private String token;
    private String refreshToken;
    private Long userId;
    private Set<String> roles;
}

