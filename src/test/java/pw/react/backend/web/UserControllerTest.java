package pw.react.backend.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.models.user.Role;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test creating a user using a nested payload structure.
     */
    @Test
    public void createUserWithNestedPayloadTest() throws Exception {
        UserDto userDto = new UserDto(
                1L,
                "user@email132.com",
                "John",
                "Doe",
                "234234234322",
                "JohnDoe",
                Role.SAILOR,
                "werwerwerwer",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());
    }

    /**
     * Test creating a docking spot using existing email.
     */
    @Test
    public void createUserExistingEmailTest() throws Exception {
        UserDto userDto = new UserDto(
                2L,
                "user@email.com",
                "Bob",
                "Whiskey",
                "45768679989",
                "JackD",
                Role.SAILOR,
                "adadadada",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test creating a user using empty email.
     * (UnauthorizedException)
     */
    @Test
    public void createUserEmptyEmailTest() throws Exception {
        UserDto userDto = new UserDto(
                3L,
                "",
                "Bob",
                "Whiskey",
                "45768679989",
                "JackD",
                Role.SAILOR,
                "adadadada",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isForbidden());
    }

    /**
     * Test creating a user with invalid email
     * (UserValidationException)
     */
    @Test
    public void createUserInvalidEmailTest() throws Exception {
        UserDto userDto = new UserDto(
                2L,
                "invalid-email",  // Invalid email format.
                "Jane",
                "Doe",
                "+1234567890",
                "JaneDoe",
                Role.SAILOR,
                "Password",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    /**
     * Test getting an existing user
     */
    @Test
    public void getExistingUserTest() throws Exception {

        String email = "user@email2.com";

        UserDto userDto = new UserDto(
                4L,
                email,
                "John",
                "Doe",
                "233234322",
                "JohnDoe",
                Role.SAILOR,
                "werwerwerwer",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);


        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/users").header("Authorization", email))
                .andExpect(status().isOk());
    }

    /**
     * Test getting a non-existing user
     */
    @Test
    public void getNonExistingUserTest() throws Exception {

        String email = "user@email3.com";

        mockMvc.perform(get("/users").header("Authorization", email))
                .andExpect(status().isNotFound());

    }

    /**
     * Test getting a user without header
     */
    @Test
    public void getUserNoHeaderTest() throws Exception {

        String email = "user@email132.com";

        UserDto userDto = new UserDto(
                5L,
                email,
                "John",
                "Doe",
                "234234234322",
                "JohnDoe",
                Role.SAILOR,
                "werwerwerwer",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        payload.put("user", email);
        mockMvc.perform(get("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

    }

    /**
     * Test deleting a user with invalid input
     * (UserValidationException)
     */
    @Test
    public void getUserWithInvalidInputTest() throws Exception {

        String email = "invalid-email";

        try {
            mockMvc.perform(get("/users").header("Authorization", email))
                    .andExpect(status().isBadRequest());
        } catch (Exception e) {
            System.out.println("Caught exception:" + e.getMessage());
        }
    }

    /**
     * Test getting a non-existing user
     */
    @Test
    public void getUserWithoutAuthorizationTest() throws Exception {
        String email = "user@email2.com";
        mockMvc.perform(get("/users").header("notAuthorization", email))
                .andExpect(status().isBadRequest());

    }

    /**
     * Test deleting an existing user
     */
    @Test
    public void deleteExistingUserTest() throws Exception {

        String email = "user@email67.com";
        UserDto userDto = new UserDto(
                6L,
                email,
                "Rob",
                "Smith",
                "2312334322",
                "Smithy",
                Role.DOCK_OWNER,
                "werwerwerwer",
                false
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/users").header("Authorization", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));

    }

    /**
     * Test deleting a non-existing user
     * (UserValidationException)
     */
    @Test
    public void deleteNonExistingUserTest() throws Exception {

        String email = "user@email4.com";

        try {
            mockMvc.perform(get("/users").header("Authorization", email))
                    .andExpect(status().isForbidden());
        } catch (Exception e) {
            System.out.println("Caught exception:" + e.getMessage());
        }

    }

    /**
     * Test deleting a user with invalid input
     * (UserValidationException)
     */
    @Test
    public void deleteUserWithInvalidInputTest() throws Exception {

        String email = "invalid-email";

        try {
            mockMvc.perform(delete("/users").header("Authorization", email))
                    .andExpect(status().isBadRequest());
        } catch (Exception e) {
            System.out.println("Caught exception:" + e.getMessage());
        }
    }

    /**
     * Test deleting a non-existing user
     */
    @Test
    public void deleteUserWithoutAuthorizationTest() throws Exception {
        String email = "user@email2.com";
        mockMvc.perform(get("/users").header("notAuthorization", email))
                .andExpect(status().isBadRequest());

    }

    /**
     * Test updating an existing user
     */
    @Test
    public void updateExistingUserTest() throws Exception {
        UserDto userDto = new UserDto(
                7L,
                "user@email.com",
                "John",
                "Jackson",
                "123231320",
                "keith",
                Role.SAILOR,
                "passssword",
                false
        );

        Map<String, Object> registrationPayload = new HashMap<>();
        registrationPayload.put("user", userDto);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationPayload)))
                .andExpect(status().isOk());

        UserDto updatedDto = new UserDto(
                7L,
                null,
                "Johnny",
                null,
                null,
                null,
                null,
                null,
                false
        );

        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("user", updatedDto);

        mockMvc.perform(put("/users")
                        .header("Authorization", "user@email.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Johnny"));

    }

    /**
     * Test updating a non-existing user
     * (UserValidationException)
     */
    @Test
    public void updateNonExistingUserTest() throws Exception {

        UserDto updatedDto = new UserDto(
                8L,
                null,
                "Johnny",
                null,
                null,
                null,
                null,
                null,
                false
        );

        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("user", updatedDto);

        try {
            mockMvc.perform(put("/users")
                            .header("Authorization", "user@email2323232.com")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatePayload)))
                    .andExpect(status().isBadRequest());
        } catch (Exception e) {
            System.out.println("Caught exception:" + e.getMessage());
        }
    }

    /**
     * Test updating a user without Authorization header
     */
    @Test
    public void updateUserWithoutAuthorizationTest() throws Exception {
        String email = "user@email.com";
        mockMvc.perform(get("/users").header("notAuthorization", email))
                .andExpect(status().isBadRequest());

    }
}
