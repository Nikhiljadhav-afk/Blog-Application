package com.blog.dto.request;



import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String bio;
    private String avatarUrl;
    private String websiteUrl;
    private String twitterUrl;
    private String linkedinUrl;
    private String[] roles;
}

