package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganizerId(Long organizerId);

    boolean existsByTitleIgnoreCase(String title);
}
