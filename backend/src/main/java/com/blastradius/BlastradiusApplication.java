package com.blastradius;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// UserDetailsServiceAutoConfiguration excluded: SecurityConfig defines its own
// filter chain (API-key based, no form login/basic auth), so Spring Boot's
// default in-memory user with a random generated password is dead weight.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BlastradiusApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlastradiusApplication.class, args);
    }
}
