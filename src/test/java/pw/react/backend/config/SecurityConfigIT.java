package pw.react.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pw.react.backend.BackendApplication;
import pw.react.backend.dao.UserRepository;
import pw.react.backend.models.docks.Port;
import pw.react.backend.services.PortService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc // keep filters ON (this is the point of the security test)
class SecurityConfigIT {

    @Autowired MockMvc mvc;

    @MockBean PortService portService;
    @MockBean UserRepository userRepository;
    @MockBean PasswordEncoder passwordEncoder;

    @Test
    void get_endpoint_is_not_blocked() throws Exception {
        when(portService.getPortsByOwnerId(1L)).thenReturn(java.util.List.of());

        mvc.perform(get("/ports/owners/1"))
                .andExpect(status().isOk()); // should NOT be 401/403
    }

    @Test
    void post_does_not_require_csrf_token() throws Exception {
        // If CSRF were enabled, this would be 403 without csrf().
        // We don't need the controller to succeed; we just need "not 403".
        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest()); // controller returns 400 for missing fields
    }

    @Test
    void any_request_is_permitted_even_if_user_repo_returns_empty() throws Exception {
        when(userRepository.findByEmail("x@x.pl")).thenReturn(Optional.empty());

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {"email":"x@x.pl","password":"nope"}
                """))
                .andExpect(status().isUnauthorized()); // controller logic, not security blocking
    }
}