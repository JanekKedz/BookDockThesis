package pw.react.backend.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.models.user.Role;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long testDockOwnerId;

    private Map<String, Object> createApiPayload(String key, Object value) {
        Map<String, Object> payload = new HashMap<>();
        payload.put(key, value);
        return payload;
    }

    @BeforeEach
    void setup() throws Exception {
        UserDto ownerDto = new UserDto(null, "owner.port.test@email.com", "Port", "Owner", "555666777", "portowner", Role.DOCK_OWNER, "password", false);
        MvcResult ownerResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", ownerDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testDockOwnerId = objectMapper.readTree(ownerResult.getResponse().getContentAsString()).get("id").asLong();
    }

    private MvcResult createTestPort(String name) throws Exception {
        PortDto portDto = new PortDto(null, name, "Gizycko", "Description", null, testDockOwnerId, 00.00, 00.00);
        return mockMvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", portDto))))
                .andExpect(status().isCreated())
                .andReturn();
    }

    @Test
    public void createPortTest() throws Exception {
        PortDto portDto = new PortDto(null, "New Port 1", "Gizycko", "Description", null, testDockOwnerId, 00.00, 00.00);
        mockMvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", portDto))))
                .andExpect(status().isCreated());
    }

    @Test
    public void createExistingPortTest() throws Exception {
        createTestPort("Existing Port");

        PortDto duplicateDto = new PortDto(null, "Existing Port", "Gizycko", "Description", null, testDockOwnerId, 00.00, 00.00);

        mockMvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", duplicateDto))))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getPortByIdTest() throws Exception {
        MvcResult creationResult = createTestPort("Port to Get");
        long portId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/ports/" + portId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(portId));
    }

    @Test
    public void getNonExistingPortByIdTest() throws Exception {
        long nonExistentId = 9999L;
        mockMvc.perform(get("/ports/" + nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void updatePortTest() throws Exception {
        MvcResult creationResult = createTestPort("Initial Port Name");
        long portId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        PortDto updatedDto = new PortDto(null, "Updated Port Name", "Updated City", null, null, null, 00.00, 00.00);

        mockMvc.perform(put("/ports/" + portId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", updatedDto))))
                .andExpect(status().isOk());
    }

    @Test
    public void updateNonExistingPortTest() throws Exception {
        long nonExistentId = 9999L;
        PortDto portDto = new PortDto(null, "Non-existent", "City", null, null, null, 00.00, 00.00);

        mockMvc.perform(put("/ports/" + nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", portDto))))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deletePortTest() throws Exception {
        MvcResult creationResult = createTestPort("To Be Deleted");
        long portId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/ports/" + portId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/ports/" + portId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteNonExistingPortTest() throws Exception {
        long nonExistentId = 9999L;
        mockMvc.perform(delete("/ports/" + nonExistentId))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getAllPortsTest() throws Exception {
        createTestPort("Port 1");
        createTestPort("Port 2");

        mockMvc.perform(get("/ports").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void getAllPortsEmptyTest() throws Exception {
        // No ports are created in this specific test, so the list should be empty.
        mockMvc.perform(get("/ports").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}
