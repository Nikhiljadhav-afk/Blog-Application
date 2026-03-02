package com.blog.service.impl;

import com.blog.entity.Like;
import com.blog.entity.Post;
import com.blog.entity.User;
import com.blog.repository.LikeRepository;
import com.blog.repository.PostRepository;
import com.blog.repository.UserRepository;
import com.blog.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void likePost(Long postId) {

        User user = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        likeRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(like -> {
                    throw new RuntimeException("Post already liked");
                });

        Like like = Like.builder()
                .user(user)
                .post(post)
                .build();

        likeRepository.save(like);
    }

    @Override
    public void unlikePost(Long postId) {

        User user = getCurrentUser();

        Like like = likeRepository.findByUserIdAndPostId(user.getId(), postId)
                .orElseThrow(() -> new RuntimeException("Like not found"));

        likeRepository.delete(like);
    }

    @Override
    public long getLikeCount(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    @Override
    public List<Long> getLikedPostIdsByCurrentUser() {

        User user = getCurrentUser();

        return likeRepository.findByUserId(user.getId())
                .stream()
                .map(like -> like.getPost().getId())
                .toList();
    }
}
