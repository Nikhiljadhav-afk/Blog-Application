package com.blog.dto.request;

import lombok.Data;

@Data
public class PostRequest {

    private String title;
    private String content;
    private String imageUrl;
    private boolean published; // match the Post entity
    private Long categoryId;   // optional if category selection is supported
}
