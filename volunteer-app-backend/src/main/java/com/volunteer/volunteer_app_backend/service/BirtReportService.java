package com.volunteer.volunteer_app_backend.service;

import org.eclipse.birt.core.framework.Platform;
import org.eclipse.birt.core.exception.BirtException;
import org.eclipse.birt.report.engine.api.EngineConfig;
import org.eclipse.birt.report.engine.api.EngineException;
import org.eclipse.birt.report.engine.api.HTMLRenderOption;
import org.eclipse.birt.report.engine.api.IReportEngine;
import org.eclipse.birt.report.engine.api.IReportEngineFactory;
import org.eclipse.birt.report.engine.api.IReportRunnable;
import org.eclipse.birt.report.engine.api.IRunAndRenderTask;
import org.eclipse.birt.report.model.api.OdaDataSourceHandle;
import org.eclipse.birt.report.model.api.ReportDesignHandle;
import org.eclipse.birt.report.model.api.activity.SemanticException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class BirtReportService {

    private final ResourceLoader resourceLoader;
    private final String datasourceUrl;
    private final String datasourceUsername;
    private final String datasourcePassword;
    private IReportEngine reportEngine;

    public BirtReportService(
            ResourceLoader resourceLoader,
            @Value("${spring.datasource.url}") String datasourceUrl,
            @Value("${spring.datasource.username}") String datasourceUsername,
            @Value("${spring.datasource.password}") String datasourcePassword
    ) {
        this.resourceLoader = resourceLoader;
        this.datasourceUrl = datasourceUrl;
        this.datasourceUsername = datasourceUsername;
        this.datasourcePassword = datasourcePassword;
    }

    @PostConstruct
    public void init() {
        EngineConfig config = new EngineConfig();
        try {
            Platform.startup(config);
            IReportEngineFactory factory = (IReportEngineFactory) Platform.createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
            this.reportEngine = factory.createReportEngine(config);
        } catch (BirtException ex) {
            throw new IllegalStateException("Не удалось инициализировать BIRT", ex);
        }
    }

    @PreDestroy
    public void destroy() {
        if (reportEngine != null) {
            reportEngine.destroy();
        }
        Platform.shutdown();
    }

    public byte[] renderReport(String templatePath) {
        try (
                InputStream templateStream = resourceLoader
                        .getResource("classpath:" + templatePath)
                        .getInputStream();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()
        ) {
            IReportRunnable design = reportEngine.openReportDesign(templateStream);
            configureDataSource(design);

            IRunAndRenderTask task = reportEngine.createRunAndRenderTask(design);

            HTMLRenderOption options = new HTMLRenderOption();
            options.setOutputFormat(HTMLRenderOption.OUTPUT_FORMAT_HTML);

            options.setEmbeddable(false);
            options.setEnableInlineStyle(true);
            options.setHtmlPagination(false);

            options.setUrlEncoding("UTF-8");

            options.setOutputStream(outputStream);

            task.setRenderOption(options);
            task.run();
            task.close();

            return outputStream.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Не удалось сформировать отчет", ex);
        }
    }

    private void configureDataSource(IReportRunnable design) {
        ReportDesignHandle reportDesign = (ReportDesignHandle) design.getDesignHandle();
        OdaDataSourceHandle dataSource = (OdaDataSourceHandle) reportDesign.findDataSource("VolunteerDB");
        if (dataSource == null) {
            return;
        }
        try {
            dataSource.setProperty("odaURL", datasourceUrl);
            dataSource.setProperty("odaUser", datasourceUsername);
            dataSource.setProperty("odaPassword", datasourcePassword);
        } catch (SemanticException ex) {
            throw new IllegalStateException("Не удалось настроить источник данных BIRT", ex);
        }
    }
}