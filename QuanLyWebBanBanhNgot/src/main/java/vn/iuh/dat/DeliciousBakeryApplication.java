package vn.iuh.dat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DeliciousBakeryApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliciousBakeryApplication.class, args);
    }

}
