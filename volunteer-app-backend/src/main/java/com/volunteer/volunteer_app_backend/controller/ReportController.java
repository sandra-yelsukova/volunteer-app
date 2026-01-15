package com.volunteer.volunteer_app_backend.controller;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.service.BirtReportService;
import com.volunteer.volunteer_app_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long id, @RequestParam String format) {
        Report report = reportService.getById(id);
        byte[] reportBytes = birtReportService.renderReport(report.getBirtTemplate(), format);
        MediaType mediaType = getExportMediaType(format);
        String extension = format.equals("pdf") ? "pdf" : "xls";
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + id + "." + extension)
                .body(reportBytes);
    }

    private MediaType getExportMediaType(String format) {
        if ("pdf".equals(format)) {
            return MediaType.APPLICATION_PDF;
        }
        if ("xls".equals(format)) {
            return MediaType.parseMediaType("application/vnd.ms-excel");
        }
        throw new IllegalArgumentException("Неподдерживаемый формат: " + format);
    }
}