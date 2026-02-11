package com.volunteer.volunteer_app_backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TaskCommentResponse {
    private Long id;
    private String text;
    private LocalDateTime createdAt;
    private AuthorResponse author;

    @Getter
    @Builder
    public static class AuthorResponse {
        private Long id;
        private String name;
        private String surname;
    }
}