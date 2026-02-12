package com.uniconnect.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // Check if Cloudinary URL is set (preferred method)
        String cloudinaryUrl = System.getenv("CLOUDINARY_URL");
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            return new Cloudinary(cloudinaryUrl);
        }
        
        // Fall back to individual properties
        if (cloudName != null && !cloudName.isEmpty() &&
            apiKey != null && !apiKey.isEmpty() &&
            apiSecret != null && !apiSecret.isEmpty()) {
            return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
            ));
        }
        
        // Return null if not configured - will fall back to local storage
        return null;
    }
}
