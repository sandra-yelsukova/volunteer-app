package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    @GetMapping("/{id}")
    public Optional<Report> getReportById(@PathVariable Long id) {
        return reportService.getReportById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Report> getReportsByUser(@PathVariable Long userId) {
        return reportService.getReportsByUser(userId);
    }

    @GetMapping("/project/{projectId}")
    public List<Report> getReportsByProject(@PathVariable Long projectId) {
        return reportService.getReportsByProject(projectId);
    }

    @PostMapping
    public Report createReport(@RequestBody Report report) {
        return reportService.createReport(report);
    }

    @PutMapping("/{id}")
    public Report updateReport(@PathVariable Long id, @RequestBody Report updatedReport) {
        return reportService.updateReport(id, updatedReport);
    }

    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
    }
}
