package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.Project;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.repository.ProjectRepository;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    public Project create(Project project) {

        if (project.getTitle() != null) {
            project.setTitle(project.getTitle().trim());
        }

        project.setCreatedAt(Instant.now());

        attachOrganizerIfPresent(project);

        return projectRepository.save(project);
    }

    public Project update(Long id, Project updated) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Project not found"
                        )
                );

        if (updated.getTitle() != null) {
            existing.setTitle(updated.getTitle());
        }

        if (updated.getShortDescription() != null) {
            existing.setShortDescription(updated.getShortDescription());
        }

        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }

        if (updated.getOrganizer() != null) {
            attachOrganizer(updated);
            existing.setOrganizer(updated.getOrganizer());
        }

        return projectRepository.save(existing);
    }

    public void delete(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private void attachOrganizerIfPresent(Project project) {
        User org = project.getOrganizer();
        if (org == null || org.getId() == null) return;

        User managedOrganizer = userRepository.findById(org.getId())
                .orElseThrow(() -> new IllegalArgumentException("Organizer not found: " + org.getId()));

        project.setOrganizer(managedOrganizer);
    }

    private void attachOrganizer(Project project) {
        if (project.getOrganizer() == null || project.getOrganizer().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Organizer.id is required"
            );
        }

        User organizer = userRepository.findById(project.getOrganizer().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Organizer not found: " + project.getOrganizer().getId()
                ));

        project.setOrganizer(organizer);
    }

    public List<User> getAllParticipantsByOrganizer(Long organizerId) {
        if (organizerId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "organizerId is required"
            );
        }

        return projectRepository.findAllParticipantsByOrganizerId(organizerId);
    }
}
