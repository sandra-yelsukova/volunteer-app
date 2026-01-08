package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.Project;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.service.ProjectService;
import com.volunteer.volunteer_app_backend.service.ProjectParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectParticipantService participantService;

    @GetMapping
    public List<Project> getAll() {
        return projectService.getAll();
    }

    @GetMapping("/{id}")
    public Project getById(@PathVariable Long id) {
        return projectService.getById(id);
    }

    @PostMapping
    public Project create(@RequestBody Project project) {
        return projectService.create(project);
    }

    @PatchMapping("/{id}")
    public Project update(@PathVariable Long id, @RequestBody Project updated) {
        return projectService.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }

    @PostMapping("/{projectId}/participants/{userId}")
    public void addParticipant(@PathVariable Long projectId,
                               @PathVariable Long userId) {
        participantService.addParticipant(projectId, userId);
    }

    @DeleteMapping("/{projectId}/participants/{userId}")
    public void removeParticipant(@PathVariable Long projectId,
                                  @PathVariable Long userId) {
        participantService.removeParticipant(projectId, userId);
    }

    @GetMapping("/{projectId}/participants")
    public List<User> getParticipants(@PathVariable Long projectId) {
        return participantService.getParticipants(projectId);
    }

    @GetMapping("/participants/by-organizer/{organizerId}")
    public List<User> getAllParticipantsByOrganizer(@PathVariable Long organizerId) {
        return projectService.getAllParticipantsByOrganizer(organizerId);
    }
}
