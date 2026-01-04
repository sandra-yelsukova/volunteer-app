package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.Project;
import com.volunteer.volunteer_app_backend.model.ProjectParticipant;
import com.volunteer.volunteer_app_backend.model.User;
import com.volunteer.volunteer_app_backend.repository.ProjectParticipantRepository;
import com.volunteer.volunteer_app_backend.repository.ProjectRepository;
import com.volunteer.volunteer_app_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectParticipantService {

    private final ProjectParticipantRepository participantRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public void addParticipant(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Project not found"
                ));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        if (participantRepository.existsByProject_IdAndUser_Id(projectId, userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User already joined this project"
            );
        }

        ProjectParticipant participant = new ProjectParticipant();
        participant.setProject(project);
        participant.setUser(user);

        participantRepository.save(participant);
    }

    public void removeParticipant(Long projectId, Long userId) {
        ProjectParticipant participant = participantRepository
                .findByProject_IdAndUser_Id(projectId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User is not a participant of this project"
                ));

        participantRepository.delete(participant);
    }

    public List<User> getParticipants(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        return participantRepository.findAllByProject_Id(projectId)
                .stream()
                .map(ProjectParticipant::getUser)
                .toList();
    }
}
