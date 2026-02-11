package com.uniconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve uploads directory to absolute path based on CWD
        // This ensures files are served consistently regardless of how the app is started
        String uploadsAbsPath = new File("uploads").getAbsolutePath().replace("\\", "/");
        if (!uploadsAbsPath.endsWith("/")) {
            uploadsAbsPath += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsAbsPath)
                .setCachePeriod(3600);

        System.out.println("[WebConfig] Serving /uploads/** from: " + uploadsAbsPath);
    }
}
