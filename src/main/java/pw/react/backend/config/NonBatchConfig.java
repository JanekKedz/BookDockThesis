package pw.react.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.services.UserMainService;
import pw.react.backend.services.UserService;

@Profile("!batch")
public class NonBatchConfig {

    @Bean
    public UserService userService(UserRepository userRepository) {
        return new UserMainService(userRepository);
    }

}
