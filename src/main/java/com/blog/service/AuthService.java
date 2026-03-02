package com.blog.service;

import com.blog.dto.request.LoginRequest;
import com.blog.dto.request.RegisterRequest;
import com.blog.dto.response.JwtAuthResponse;
import com.blog.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);
    JwtAuthResponse login(LoginRequest request);

}
