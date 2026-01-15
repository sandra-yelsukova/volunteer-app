package com.volunteer.volunteer_app_backend.repository;

import com.volunteer.volunteer_app_backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
}