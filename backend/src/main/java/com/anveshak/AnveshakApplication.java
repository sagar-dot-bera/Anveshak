package com.anveshak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AnveshakApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnveshakApplication.class, args);
    }
}
