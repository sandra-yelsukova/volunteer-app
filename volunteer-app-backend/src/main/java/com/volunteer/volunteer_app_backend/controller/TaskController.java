package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.Task;
import com.volunteer.volunteer_app_backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<Task> getAll() {
        return taskService.getAll();
    }

    @GetMapping("/by-project/{projectId}")
    public List<Task> getByProject(@PathVariable Long projectId) {
        return taskService.getByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public Task getById(@PathVariable Long id) {
        return taskService.getById(id);
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        return taskService.create(task);
    }

    @PatchMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task task) {
        return taskService.update(id, task);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @GetMapping("/by-organizer/{organizerId}")
    public List<Task> getByOrganizer(@PathVariable Long organizerId) {
        return taskService.getByOrganizerId(organizerId);
    }

    @GetMapping("/by-participant/{userId}")
    public List<Task> getByParticipant(@PathVariable Long userId) {
        return taskService.getByParticipantId(userId);
    }
}
