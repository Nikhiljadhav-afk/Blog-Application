package com.blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Author of the comment
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Post to which comment belongs
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    // Optional parent comment for nested replies
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Comment parent;

    // List of replies to this comment
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Comment> replies;
}
