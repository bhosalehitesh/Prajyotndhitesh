package com.smartbiz.sakhistore.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI sakhiStoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sakhi Store API")
                        .description("Customer and Authentication APIs")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Sakhi Storer")
                                .email("bhumikamkshirsagar@gmail.com")));
    }
}
