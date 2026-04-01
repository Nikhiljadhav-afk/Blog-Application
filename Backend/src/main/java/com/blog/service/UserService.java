package com.blog.service;

import com.blog.dto.request.UserProfileUpdateRequest;
import com.blog.dto.response.UserResponse;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserResponse getUserById(Long id);

    List<UserResponse> getAllUsers();
    UserResponse getCurrentUser();
    void upgradeToAuthor(Long userId);

    
    UserResponse getCurrentUserProfile(); // /api/users/me

    UserResponse getUserProfileById(Long id); // /api/users/{id}
    
    void updateProfile(UserProfileUpdateRequest request);
    String uploadAvatar(MultipartFile file);
}



