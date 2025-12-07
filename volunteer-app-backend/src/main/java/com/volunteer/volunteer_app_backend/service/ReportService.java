package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByUser(Long userId) {
        return reportRepository.findByUserId(userId);
    }

    public List<Report> getReportsByProject(Long projectId) {
        return reportRepository.findByProjectId(projectId);
    }

    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public Report updateReport(Long id, Report updatedReport) {
        return reportRepository.findById(id)
                .map(report -> {
                    report.setHoursWorked(updatedReport.getHoursWorked());
                    report.setTasksCompleted(updatedReport.getTasksCompleted());
                    report.setUser(updatedReport.getUser());
                    report.setProject(updatedReport.getProject());
                    return reportRepository.save(report);
                })
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
