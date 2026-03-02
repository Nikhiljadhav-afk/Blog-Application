package com.blog.service;

import java.util.List;

public interface LikeService {

    void likePost(Long postId);

    void unlikePost(Long postId);

    long getLikeCount(Long postId);

    List<Long> getLikedPostIdsByCurrentUser();
}
