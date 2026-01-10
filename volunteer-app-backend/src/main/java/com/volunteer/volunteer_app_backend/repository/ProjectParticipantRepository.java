package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.ProjectParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectParticipantRepository
        extends JpaRepository<ProjectParticipant, Long> {

    boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);

    Optional<ProjectParticipant> findByProject_IdAndUser_Id(Long projectId, Long userId);

    List<ProjectParticipant> findAllByProject_Id(Long projectId);

    void deleteByProject_Id(Long projectId);
}
