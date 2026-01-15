package com.volunteer.volunteer_app_backend.config;

import com.volunteer.volunteer_app_backend.model.Report;
import com.volunteer.volunteer_app_backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReportInitializer implements CommandLineRunner {

    private final ReportRepository reportRepository;

    @Override
    public void run(String... args) {
        if (reportRepository.count() == 0) {
            Report report = new Report();
            report.setName("Занятость волонтёров");
            report.setDescription("Отчет показывает количество задач, назначенных каждому волонтёру.");
            report.setBirtTemplate("reports/volunteer-occupancy.rptdesign");
            reportRepository.save(report);
        }
    }
}