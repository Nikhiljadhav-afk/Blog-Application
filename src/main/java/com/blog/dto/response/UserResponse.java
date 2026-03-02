package com.blog.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Set<String> roles;

    // Profile fields
    private String bio;
    private String avatarUrl;
    private String websiteUrl;
    private String twitterUrl;
    private String linkedinUrl;
}
