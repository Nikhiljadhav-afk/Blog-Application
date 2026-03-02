package com.blog.controller;

import com.blog.dto.request.UserProfileUpdateRequest;
import com.blog.dto.response.UserResponse;
import com.blog.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // =========================
    // ADMIN APIs
    // =========================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/upgrade-author")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> upgradeToAuthor(@PathVariable Long id) {
        userService.upgradeToAuthor(id);
        return ResponseEntity.ok("User upgraded to AUTHOR successfully");
    }

    // =========================
    // AUTH USER APIs
    // =========================

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    // NEW — update profile
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateProfile(@RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(request);
        return ResponseEntity.ok("Profile updated successfully");
    }

    // NEW — upload avatar
    @PostMapping("/upload-avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadAvatar(file));
    }

    // =========================
    // PUBLIC APIs
    // =========================

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserResponse> getPublicUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }
}
