package pw.react.backend.component;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordHashPrinter implements CommandLineRunner {
    @Override
    public void run(String... args) {
        var enc = new BCryptPasswordEncoder();
        System.out.println("HASH([password]) = copy the following: " + enc.encode("1234"));
        System.out.println("HASH([password]) = copy the following: " + enc.encode("1234"));
    }
}
