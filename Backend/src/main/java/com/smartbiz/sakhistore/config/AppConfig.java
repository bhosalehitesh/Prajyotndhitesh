package com.smartbiz.sakhistore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
	@Bean
	public RestTemplate restTemplate() {
	    HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
	    factory.setConnectTimeout(5000); // 5 sec
	    factory.setReadTimeout(5000);    // 5 sec
	    return new RestTemplate(factory);
	}

}
