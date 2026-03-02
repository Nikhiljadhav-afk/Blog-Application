package com.blog.controller;

import com.blog.dto.request.LoginRequest;
import com.blog.dto.request.RegisterRequest;
import com.blog.dto.response.JwtAuthResponse;
import com.blog.entity.RefreshToken;
import com.blog.entity.Role;
import com.blog.entity.User;
import com.blog.repository.RoleRepository;
import com.blog.repository.UserRepository;
import com.blog.config.JwtTokenProvider;
import com.blog.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .bio(registerRequest.getBio())
                .avatarUrl(registerRequest.getAvatarUrl())
                .websiteUrl(registerRequest.getWebsiteUrl())
                .twitterUrl(registerRequest.getTwitterUrl())
                .linkedinUrl(registerRequest.getLinkedinUrl())
                .build();

        Set<Role> roles = new HashSet<>();

        // FIX #1 — If frontend sends empty list, use default role
        if (registerRequest.getRoles() != null && registerRequest.getRoles().length > 0) {

            // FIX #2 — Prevent registering with invalid roles
            for (String roleName : registerRequest.getRoles()) {

                Role role = roleRepository.findByName("ROLE_" + roleName.toUpperCase())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

                roles.add(role);
            }

        } else {

            // Default ROLE_USER
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            roles.add(userRole);
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = jwtTokenProvider.generateToken(authentication);

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(
                JwtAuthResponse.builder()
                        .token(jwt)
                        .refreshToken(refreshToken.getToken())
                        .userId(user.getId())
                        .roles(
                                user.getRoles()
                                        .stream()
                                        .map(Role::getName)
                                        .collect(Collectors.toSet())
                        )
                        .build()
        );
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthResponse> refreshToken(
            @RequestBody Map<String, String> request) {

        String refreshToken = request.get("refreshToken");

        RefreshToken token =
                refreshTokenService.verifyExpiration(refreshToken);

        User user = token.getUser();

        String newJwt =
                jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        return ResponseEntity.ok(
                JwtAuthResponse.builder()
                        .token(newJwt)
                        .refreshToken(refreshToken)
                        .userId(user.getId())
                        .roles(
                                user.getRoles()
                                        .stream()
                                        .map(Role::getName)
                                        .collect(Collectors.toSet())
                        )
                        .build()
        );
    }

    // =========================
    // LOGOUT
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody Map<String, String> request) {

        String refreshToken = request.get("refreshToken");

        refreshTokenService.deleteByToken(refreshToken);

        return ResponseEntity.ok("Logged out successfully");
    }

}
