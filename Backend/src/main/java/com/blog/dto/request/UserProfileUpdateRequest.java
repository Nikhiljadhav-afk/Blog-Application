package com.blog.dto.request;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {

    private String bio;
    private String websiteUrl;
    private String twitterUrl;
    private String linkedinUrl;
}
