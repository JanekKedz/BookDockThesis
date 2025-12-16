package pw.react.backend.Auth;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import pw.react.backend.controller.auth.AuthController;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.models.user.Role;
import pw.react.backend.models.user.User;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    UserRepository userRepository;

    @MockBean
    PasswordEncoder passwordEncoder;

    @Test
    void login_returns400_when_missing_email_or_password() throws Exception {
        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"admin@abc.pl"}
                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_returns401_when_user_not_found() throws Exception {
        when(userRepository.findByEmail("nope@abc.pl")).thenReturn(Optional.empty());

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"nope@abc.pl","password":"x"}
                """))
                .andExpect(status().isUnauthorized());

        verify(userRepository).findByEmail("nope@abc.pl");
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void login_returns401_when_password_invalid() throws Exception {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("editor@abc.pl");
        user.setPassword("HASHED");
        user.setDeleted(false);

        when(userRepository.findByEmail("editor@abc.pl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "HASHED")).thenReturn(false);

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"editor@abc.pl","password":"bad"}
                """))
                .andExpect(status().isUnauthorized());

        verify(passwordEncoder).matches("bad", "HASHED");
    }

    @Test
    void login_returns401_when_user_deleted() throws Exception {
        User user = new User();
        user.setUserId(2L);
        user.setEmail("banned@abc.pl");
        user.setPassword("HASHED");
        user.setDeleted(true);

        when(userRepository.findByEmail("banned@abc.pl")).thenReturn(Optional.of(user));

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"banned@abc.pl","password":"anything"}
                """))
                .andExpect(status().isUnauthorized());

        // should not check password if deleted
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void login_returns200_and_safe_payload_when_ok() throws Exception {
        User user = new User();
        user.setUserId(7L);
        user.setEmail("admin@abc.pl");
        user.setUsername("admin");
        user.setName("Admin");
        user.setSurname("X");
        user.setPhoneNumber("123");
        user.setRole(Role.ADMIN);
        user.setPassword("HASHED");
        user.setDeleted(false);

        when(userRepository.findByEmail("admin@abc.pl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "HASHED")).thenReturn(true);

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"admin@abc.pl","password":"pass"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.email").value("admin@abc.pl"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                // no password in response
                .andExpect(jsonPath("$.password").doesNotExist());

        verify(passwordEncoder).matches("pass", "HASHED");
    }
}
