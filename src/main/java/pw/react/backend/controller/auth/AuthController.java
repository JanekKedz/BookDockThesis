package pw.react.backend.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.models.user.User;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing email or password"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.isDeleted()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        // return safe user payload (no password)
        Map<String, Object> out = new HashMap<>();
        out.put("id", user.getUserId());
        out.put("email", user.getEmail());
        out.put("username", user.getUsername());
        out.put("name", user.getName());
        out.put("surname", user.getSurname());
        out.put("phoneNumber", user.getPhoneNumber());
        out.put("role", user.getRole() != null ? user.getRole().name() : null);

        return ResponseEntity.ok(out);
    }
}
