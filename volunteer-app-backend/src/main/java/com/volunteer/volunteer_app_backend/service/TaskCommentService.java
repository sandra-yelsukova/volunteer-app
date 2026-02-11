package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.dto.CreateTaskCommentRequest;
import com.volunteer.volunteer_app_backend.dto.TaskCommentResponse;
import com.volunteer.volunteer_app_backend.dto.UpdateTaskCommentRequest;
import com.volunteer.volunteer_app_backend.model.Task;
import com.volunteer.volunteer_app_backend.model.TaskComment;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.repository.TaskCommentRepository;
import com.volunteer.volunteer_app_backend.repository.TaskRepository;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskCommentResponse> getByTaskId(Long taskId) {
        ensureTaskExists(taskId);

        return taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskCommentResponse create(Long taskId, CreateTaskCommentRequest request) {
        if (request.getAuthorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "authorId is required");
        }

        String text = normalizeText(request.getText());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + request.getAuthorId()));

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setText(text);
        comment.setCreatedAt(LocalDateTime.now());

        return toResponse(taskCommentRepository.save(comment));
    }

    public TaskCommentResponse update(Long taskId, Long commentId, UpdateTaskCommentRequest request) {
        TaskComment comment = getComment(taskId, commentId);
        comment.setText(normalizeText(request.getText()));

        return toResponse(taskCommentRepository.save(comment));
    }

    public void delete(Long taskId, Long commentId) {
        TaskComment comment = getComment(taskId, commentId);
        taskCommentRepository.delete(comment);
    }

    private TaskComment getComment(Long taskId, Long commentId) {
        ensureTaskExists(taskId);

        return taskCommentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    private void ensureTaskExists(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
    }

    private String normalizeText(String source) {
        String text = source == null ? "" : source.trim();
        if (text.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }
        return text;
    }

    private TaskCommentResponse toResponse(TaskComment comment) {
        return TaskCommentResponse.builder()
                .id(comment.getId())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .author(TaskCommentResponse.AuthorResponse.builder()
                        .id(comment.getAuthor().getId())
                        .name(comment.getAuthor().getName())
                        .surname(comment.getAuthor().getSurname())
                        .build())
                .build();
    }
}