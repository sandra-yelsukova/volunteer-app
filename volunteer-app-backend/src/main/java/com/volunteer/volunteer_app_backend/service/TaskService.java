package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.Project;
import com.volunteer.volunteer_app_backend.model.Task;
import com.volunteer.volunteer_app_backend.repository.ProjectRepository;
import com.volunteer.volunteer_app_backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.volunteer.volunteer_app_backend.model.TaskAssigneeType;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.model.VolunteerGroup;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import com.volunteer.volunteer_app_backend.repository.VolunteerGroupRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final VolunteerGroupRepository volunteerGroupRepository;

    public List<Task> getAll() {
        return taskRepository.findAll();
    }

    public Task getById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    public Task create(Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (task.getProject() == null || task.getProject().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "project.id is required");
        }

        task.setTitle(task.getTitle().trim());
        attachProject(task);

        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        applyAssignee(task);

        return taskRepository.save(task);
    }

    public Task update(Long id, Task updated) {
        Task existing = getById(id);

        if (updated.getTitle() != null) {
            existing.setTitle(updated.getTitle().trim());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }
        if (updated.getTaskType() != null) {
            existing.setTaskType(updated.getTaskType());
        }
        if (updated.getPriority() != null) {
            existing.setPriority(updated.getPriority());
        }
        if (updated.getStatus() != null) {
            existing.setStatus(updated.getStatus());
        }

        if (updated.getProject() != null && updated.getProject().getId() != null) {
            existing.setProject(updated.getProject());
            attachProject(existing);
        }

        existing.setUpdatedAt(LocalDateTime.now());

        if (updated.getAssigneeType() != null) {
            existing.setAssigneeType(updated.getAssigneeType());
            existing.setAssigneeUser(updated.getAssigneeUser());
            existing.setAssigneeGroup(updated.getAssigneeGroup());

            applyAssignee(existing);
        }

        return taskRepository.save(existing);
    }

    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        taskRepository.deleteById(id);
    }

    private void attachProject(Task task) {
        Long projectId = task.getProject().getId();
        Project managed = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project not found: " + projectId));
        task.setProject(managed);
    }

    private void applyAssignee(Task task) {
        TaskAssigneeType type = task.getAssigneeType();

        if (type == null) {
            return;
        }

        switch (type) {
            case USER -> {
                if (task.getAssigneeUser() == null || task.getAssigneeUser().getId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "assigneeUser.id is required for USER");
                }
                Long userId = task.getAssigneeUser().getId();
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + userId));

                task.setAssigneeUser(user);
                task.setAssigneeGroup(null);
            }
            case GROUP -> {
                if (task.getAssigneeGroup() == null || task.getAssigneeGroup().getId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "assigneeGroup.id is required for GROUP");
                }
                Long groupId = task.getAssigneeGroup().getId();
                VolunteerGroup group = volunteerGroupRepository.findById(groupId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group not found: " + groupId));

                task.setAssigneeGroup(group);
                task.setAssigneeUser(null);
            }
            case NONE -> {
                task.setAssigneeUser(null);
                task.setAssigneeGroup(null);
                task.setAssigneeType(null);
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown assigneeType");
        }
    }
}
