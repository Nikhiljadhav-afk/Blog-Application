package com.blog.config;

import com.blog.entity.Role;
import com.blog.entity.User;
import com.blog.repository.RoleRepository;
import com.blog.repository.UserRepository;
import com.blog.util.AppConstants;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            // ---------- Create Roles ----------
            Role adminRole = roleRepository
                    .findByName(AppConstants.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(
                            Role.builder().name(AppConstants.ROLE_ADMIN).build()
                    ));

            Role authorRole = roleRepository
                    .findByName(AppConstants.ROLE_AUTHOR)
                    .orElseGet(() -> roleRepository.save(
                            Role.builder().name(AppConstants.ROLE_AUTHOR).build()
                    ));

            Role userRole = roleRepository
                    .findByName(AppConstants.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(
                            Role.builder().name(AppConstants.ROLE_USER).build()
                    ));

            // ---------- Create Admin User ----------
            if (!userRepository.existsByEmail("admin@blog.com")) {

                // FIX: Ensure admin gets ROLE_ADMIN
                User admin = User.builder()
                        .name("Super Admin")
                        .email("admin@blog.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .roles(Set.of(adminRole))   // Important fix
                        .build();

                userRepository.save(admin);
            }
        };
    }
}
