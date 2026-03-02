package com.blog.service.impl;

import com.blog.dto.request.PostRequest;
import com.blog.dto.response.PostResponse;
import com.blog.entity.Post;
import com.blog.entity.User;
import com.blog.repository.PostRepository;
import com.blog.repository.UserRepository;
import com.blog.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.blog.entity.Category;
import com.blog.repository.CategoryRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    


    private PostResponse mapToResponse(Post post) {

        int commentCount = (post.getComments() == null)
                ? 0
                : post.getComments().size();

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .published(post.isPublished())
                .authorId(post.getUser().getId())
                .authorName(post.getUser().getName())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .commentCount(commentCount)  // <-- NEW FIELD ADDED
                .build();
    }


    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public PostResponse createPost(PostRequest request) {
        User author = getCurrentUser();

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .published(request.isPublished())
                .createdAt(LocalDateTime.now())
                .user(author)
                .category(category)
                .build();

        return mapToResponse(postRepository.save(post));
    }

    @Override
    public PostResponse updatePost(Long postId, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User currentUser = getCurrentUser();

        if (!post.getUser().getId().equals(currentUser.getId())
                && currentUser.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("You are not authorized to edit this post");
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setCategory(category);
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setPublished(request.isPublished());
        post.setCreatedAt(post.getCreatedAt()); // keep original createdAt
        post.setCreatedAt(LocalDateTime.now()); // update timestamp

        return mapToResponse(postRepository.save(post));
    }

    @Override
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User currentUser = getCurrentUser();

        if (!post.getUser().getId().equals(currentUser.getId())
                && currentUser.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Override
    public PostResponse getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToResponse(post);
    }

    @Override
    public List<PostResponse> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PostResponse> getPostsByAuthor(Long authorId) {
        return postRepository.findByUserId(authorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    
    @Override
    public Page<PostResponse> getPosts(Boolean published, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage;

        if (published != null && categoryId != null) {
            postsPage = postRepository.findByPublishedAndCategoryId(published, categoryId, pageable);
        } else if (published != null) {
            postsPage = postRepository.findByPublished(published, pageable);
        } else if (categoryId != null) {
            postsPage = postRepository.findByCategoryId(categoryId, pageable);
        } else {
            postsPage = postRepository.findAll(pageable);
        }

        return postsPage.map(this::mapToResponse); // map entity to PostResponse DTO
    }

}
