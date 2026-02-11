package com.uniconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:4173",
                    "http://localhost:5173",
                    "http://localhost:4174",
                    "https://klh-uni-connect.vercel.app",
                    "https://klh-uniconnect.onrender.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

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
