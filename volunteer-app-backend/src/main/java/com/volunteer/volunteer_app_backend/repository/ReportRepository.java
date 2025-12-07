package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserId(Long userId);
    List<Report> findByProjectId(Long projectId);
}
