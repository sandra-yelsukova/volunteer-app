package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    java.util.Optional<TaskComment> findByIdAndTaskId(Long id, Long taskId);

    void deleteByTaskId(Long taskId);
}