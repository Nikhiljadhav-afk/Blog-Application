package com.blog.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.blog.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Find posts by published status and category
    Page<Post> findByPublishedAndCategoryId(Boolean published, Long categoryId, Pageable pageable);

    // Find posts by published status only
    Page<Post> findByPublished(Boolean published, Pageable pageable);

    // Find posts by category only
    Page<Post> findByCategoryId(Long categoryId, Pageable pageable);
    
    List<Post> findByUserId(Long userId);

}
