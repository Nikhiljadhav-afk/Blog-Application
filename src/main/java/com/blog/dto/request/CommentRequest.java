package com.blog.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private String content;
    private Long postId;
    private Long parentId; // optional for replies
}
