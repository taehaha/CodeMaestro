package com.ssafy.codemaestro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CodemaestroApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodemaestroApplication.class, args);
    }

}
