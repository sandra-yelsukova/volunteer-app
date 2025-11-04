package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Project findByTitle(String title);
}
