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
import java.nio.file.Paths;

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

        config.setBIRTHome(
                Paths.get("birt-runtime", "ReportEngine")
                        .toAbsolutePath()
                        .toString()
        );

        config.setLogConfig(
                Paths.get("birt-logs").toAbsolutePath().toString(),
                java.util.logging.Level.ALL
        );

        try {
            Platform.startup(config);

            IReportEngineFactory factory =
                    (IReportEngineFactory) Platform.createFactoryObject(
                            IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY
                    );

            this.reportEngine = factory.createReportEngine(config);
        } catch (BirtException e) {
            throw new IllegalStateException("Не удалось инициализировать BIRT", e);
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
        ReportDesignHandle reportDesign =
                (ReportDesignHandle) design.getDesignHandle();

        OdaDataSourceHandle ds =
                (OdaDataSourceHandle) reportDesign.findDataSource("VolunteerDB");

        if (ds == null) {
            throw new IllegalStateException("Datasource VolunteerDB not found");
        }

        try {
            ds.setProperty("odaDriverClass", "org.postgresql.Driver");
            ds.setProperty("odaURL", datasourceUrl);
            ds.setProperty("odaUser", datasourceUsername);
            ds.setProperty("odaPassword", datasourcePassword);

            ds.setProperty("odaAutoCommit", "true");
        } catch (SemanticException e) {
            throw new IllegalStateException(e);
        }
    }
}