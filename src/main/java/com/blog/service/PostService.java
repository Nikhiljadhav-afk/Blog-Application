package com.blog.service;

import com.blog.dto.request.PostRequest;
import com.blog.dto.response.PostResponse;

import org.springframework.data.domain.Page;

import java.util.List;

public interface PostService {

    PostResponse createPost(PostRequest request);

    PostResponse updatePost(Long postId, PostRequest request);

    void deletePost(Long postId);

    PostResponse getPostById(Long postId);

    List<PostResponse> getAllPosts();

    List<PostResponse> getPostsByAuthor(Long authorId);
    
    Page<PostResponse> getPosts(Boolean published, Long categoryId, int page, int size);

    
    
    
}
