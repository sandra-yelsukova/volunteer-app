package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.service.BirtReportService;
import com.volunteer.volunteer_app_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final BirtReportService birtReportService;

    @GetMapping
    public List<Report> getAll() {
        return reportService.getAll();
    }

    @GetMapping("/{id}/render")
    public ResponseEntity<byte[]> render(@PathVariable Long id) {
        Report report = reportService.getById(id);
        byte[] reportHtml = birtReportService.renderReport(report.getBirtTemplate());
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(reportHtml);
    }
}