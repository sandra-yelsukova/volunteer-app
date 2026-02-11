package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.dto.CreateTaskCommentRequest;
import com.volunteer.volunteer_app_backend.dto.TaskCommentResponse;
import com.volunteer.volunteer_app_backend.dto.UpdateTaskCommentRequest;
import com.volunteer.volunteer_app_backend.service.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    @GetMapping
    public List<TaskCommentResponse> getTaskComments(@PathVariable Long taskId) {
        return taskCommentService.getByTaskId(taskId);
    }

    @PostMapping
    public TaskCommentResponse createComment(@PathVariable Long taskId, @RequestBody CreateTaskCommentRequest request) {
        return taskCommentService.create(taskId, request);
    }

    @PatchMapping("/{commentId}")
    public TaskCommentResponse updateComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @RequestBody UpdateTaskCommentRequest request
    ) {
        return taskCommentService.update(taskId, commentId, request);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long taskId, @PathVariable Long commentId) {
        taskCommentService.delete(taskId, commentId);
    }
}