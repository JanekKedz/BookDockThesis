package pw.react.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import pw.react.backend.openapi.OpenApiConfig;

import javax.sql.DataSource;
import java.util.*;

import static java.util.stream.Collectors.toSet;

@Configuration
@Import({
        NonBatchConfig.class, OpenApiConfig.class
})
public class MainConfig {

    private static final Logger log = LoggerFactory.getLogger(MainConfig.class);
    private static final Map<String, String> envPropertiesMap = System.getenv();

    private final String corsUrls;
    private final String corsMappings;

    public MainConfig(@Value("${cors.urls}") String corsUrls,
                      @Value("${cors.mappings}") String corsMappings) {
        this.corsUrls = corsUrls;
        this.corsMappings = corsMappings;
    }

    @PostConstruct
    protected void init() {
        log.debug("************** Environment variables **************");
        envPropertiesMap.forEach((key, value) -> log.debug("[{}] : [{}]", key, value));
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    public HttpService httpService(RestTemplate restTemplate) {
        return new HttpBaseService(restTemplate);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                final Set<String> mappings = getCorsMappings();
                final String[] allowedOrigins = getCorsUrls();

                if (mappings.isEmpty()) {
                    registry.addMapping("/**")
                            .allowedOrigins(allowedOrigins)
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                            .allowedHeaders("*")
                            .allowCredentials(true);
                } else {
                    for (String mapping : mappings) {
                        registry.addMapping(mapping)
                                .allowedOrigins(allowedOrigins)
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .allowCredentials(true);
                    }
                }
            }
        };
    }

    private String[] getCorsUrls() {
        return Optional.ofNullable(corsUrls)
                .map(value -> value.split(","))
                .orElse(new String[0]);
    }

    private Set<String> getCorsMappings() {
        return Optional.ofNullable(corsMappings)
                .map(value -> Arrays.stream(value.split(",")).collect(toSet()))
                .orElseGet(HashSet::new);
    }

    @Bean
    public String poolName(DataSource dataSource) {
        return dataSource.getClass().getSimpleName();
    }
}
