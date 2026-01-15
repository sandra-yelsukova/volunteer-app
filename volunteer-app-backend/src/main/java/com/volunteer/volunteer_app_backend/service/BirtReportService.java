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
    private IReportEngine reportEngine;

    public BirtReportService(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
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
                InputStream templateStream = resourceLoader.getResource("classpath:" + templatePath).getInputStream();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()
        ) {
            IReportRunnable design = reportEngine.openReportDesign(templateStream);
            IRunAndRenderTask task = reportEngine.createRunAndRenderTask(design);
            HTMLRenderOption options = new HTMLRenderOption();
            options.setOutputFormat(HTMLRenderOption.OUTPUT_FORMAT_HTML);
            options.setEmbeddable(true);
            options.setOutputStream(outputStream);
            task.setRenderOption(options);
            task.run();
            task.close();
            return outputStream.toByteArray();
        } catch (IOException | EngineException ex) {
            throw new IllegalStateException("Не удалось сформировать отчет", ex);
        }
    }
}