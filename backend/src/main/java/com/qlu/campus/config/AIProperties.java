package com.qlu.campus.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI模型配置属性
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AIProperties {

    private DeepSeekConfig deepseek;
    private ZhipuConfig zhipu;
    private String primary = "zhipu";

    @Data
    public static class DeepSeekConfig {
        private String apiKey;
        private String baseUrl = "https://api.deepseek.com";
        private String model = "deepseek-chat";
    }

    @Data
    public static class ZhipuConfig {
        private String apiKey;
        private String baseUrl = "https://open.bigmodel.cn/api/paas/v4";
        private String model = "glm-4-flash";
    }
}
