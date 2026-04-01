package com.blog.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostSummary {

    private Long id;
    private String title;
    private String imageUrl;
    private boolean published;
}
