package com.volunteer.volunteer_app_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskCommentRequest {
    private Long authorId;
    private String text;
}