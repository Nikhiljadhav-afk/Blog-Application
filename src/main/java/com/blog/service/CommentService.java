package com.blog.service;

import com.blog.dto.request.CommentRequest;
import com.blog.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(CommentRequest request);

    CommentResponse updateComment(Long commentId, CommentRequest request);

    void deleteComment(Long commentId);

    List<CommentResponse> getCommentsByPost(Long postId);
}
