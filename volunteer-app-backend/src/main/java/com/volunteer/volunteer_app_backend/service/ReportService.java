package com.volunteer.volunteer_app_backend.service;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public List<Report> getAll() {
        return reportRepository.findAll();
    }
    public Report getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Отчет не найден"));
    }
}