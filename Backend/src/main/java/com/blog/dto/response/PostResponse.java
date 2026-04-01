package com.blog.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private boolean published;

    private Long authorId;
    private String authorName;

    private Long categoryId;
    private String categoryName;

    private int commentCount;
}
