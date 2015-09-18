package com.softql.apicem.service;

import com.softql.apicem.domain.User;
import com.softql.apicem.repository.UserRepository;

import javax.inject.Inject;
import javax.inject.Named;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;

@Named
public class DataImporter implements ApplicationListener<ContextRefreshedEvent> {

    private static final Logger log = LoggerFactory
            .getLogger(DataImporter.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private PasswordEncoder passwordEncoder;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (log.isInfoEnabled()) {
            log.info("importing data into database...");
        }

        Long usersCount = userRepository.count();
        if (usersCount == 0) {
            if (log.isDebugEnabled()) {
                log.debug("import users data into database...");
            }
            userRepository.save(new User("admin",
                    passwordEncoder.encode("test123"), "Administrator", "ADMIN"));
            userRepository.save(new User("testuser", passwordEncoder
                    .encode("test123"), "Test User 1", "USER"));

        }

    }

 
}
