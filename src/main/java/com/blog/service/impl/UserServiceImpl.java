package com.blog.service.impl;

import com.blog.dto.request.UserProfileUpdateRequest;
import com.blog.dto.response.UserResponse;
import com.blog.entity.User;
import com.blog.entity.Role;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.RoleRepository;
import com.blog.repository.UserRepository;
import com.blog.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    // ---------------------------
    // PRIVATE METHODS
    // ---------------------------
    private User getCurrentUserEntity() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .websiteUrl(user.getWebsiteUrl())
                .twitterUrl(user.getTwitterUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .build();
    }

    // ---------------------------
    // EXISTING PUBLIC METHODS
    // ---------------------------

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Override
    public UserResponse getCurrentUser() {
        return mapToResponse(getCurrentUserEntity());
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getCurrentUserProfile() {
        return mapToResponse(getCurrentUserEntity());
    }

    @Override
    public UserResponse getUserProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Override
    public void upgradeToAuthor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role authorRole = roleRepository.findByName("ROLE_AUTHOR")
                .orElseThrow(() -> new RuntimeException("ROLE_AUTHOR not found"));

        user.getRoles().add(authorRole);
        userRepository.save(user);
    }

    // ---------------------------
    // NEW METHODS
    // ---------------------------

    @Override
    public void updateProfile(UserProfileUpdateRequest request) {
        User user = getCurrentUserEntity();

        user.setBio(request.getBio());
        user.setWebsiteUrl(request.getWebsiteUrl());
        user.setTwitterUrl(request.getTwitterUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());

        userRepository.save(user);
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        User user = getCurrentUserEntity();

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            String uploadDir = "uploads/avatars/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File destination = new File(uploadDir + filename);

            file.transferTo(destination);

            String imageUrl = "/uploads/avatars/" + filename;
            user.setAvatarUrl(imageUrl);
            userRepository.save(user);

            return imageUrl;

        } catch (IOException e) {
            throw new RuntimeException("Could not upload file");
        }
    }
}
