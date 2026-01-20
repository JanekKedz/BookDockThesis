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
import pw.react.backend.models.GuideCategory;
import pw.react.backend.models.GuideStatus;
import pw.react.backend.models.user.Role;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GuideControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    private long testAuthorId;

    private Map<String, Object> createApiPayload(String key, Object value) {
        Map<String, Object> payload = new HashMap<>();
        payload.put(key, value);
        return payload;
    }

    @BeforeEach
    void setup() throws Exception {
        UserDto authorDto = new UserDto(null, "author.guide.test@email.com", "Guide", "Writer", "777888999", "guidewriter", Role.DOCK_OWNER, "password", false);
        MvcResult authorResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", authorDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testAuthorId = objectMapper.readTree(authorResult.getResponse().getContentAsString()).get("id").asLong();
    }

    private MvcResult createTestGuide(String title, GuideStatus status) throws Exception {
        GuideDto guideDto = new GuideDto(
                null, title, "Content for " + title, testAuthorId,
                LocalDateTime.now(), new ArrayList<>(), new ArrayList<>(),
                status, GuideCategory.GUIDE
        );
        return mockMvc.perform(post("/guides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guideDto)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    @Test
    public void createGuideTest() throws Exception {
        GuideDto guideDto = new GuideDto(
                null, "New Guide Title", "Content here", testAuthorId,
                LocalDateTime.now(), new ArrayList<>(), new ArrayList<>(),
                GuideStatus.PUBLISHED, GuideCategory.GUIDE
        );

        mockMvc.perform(post("/guides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guideDto)))
                .andExpect(status().isCreated());
    }

    @Test
    public void createExistingGuideTest() throws Exception {
        createTestGuide("Existing Title", GuideStatus.PUBLISHED);

        GuideDto duplicateDto = new GuideDto(
                null, "Existing Title", "Content here", testAuthorId,
                LocalDateTime.now(), new ArrayList<>(), new ArrayList<>(),
                GuideStatus.PUBLISHED, GuideCategory.GUIDE
        );

        mockMvc.perform(post("/guides")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getGuideByIdTest() throws Exception {
        MvcResult creationResult = createTestGuide("Guide To Get", GuideStatus.PUBLISHED);
        long guideId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/guides/" + guideId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(guideId));
    }

    @Test
    public void getNonExistingGuideByIdTest() throws Exception {
        long nonExistentId = 9999L;
        mockMvc.perform(get("/guides/" + nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void updateGuideTest() throws Exception {
        MvcResult creationResult = createTestGuide("Initial Title", GuideStatus.DRAFT);
        long guideId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        GuideDto updatedDto = new GuideDto(
                null, "Updated Title", "Updated Content", null,
                null, new ArrayList<>(), new ArrayList<>(),
                GuideStatus.PUBLISHED, null
        );

        mockMvc.perform(put("/guides/" + guideId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    public void updateNonExistingGuideTest() throws Exception {
        long nonExistentId = 9999L;
        GuideDto guideDto = new GuideDto(
                null, "title", "content", null, null,
                new ArrayList<>(), new ArrayList<>(), GuideStatus.PUBLISHED, GuideCategory.GUIDE
        );

        mockMvc.perform(put("/guides/" + nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guideDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void deleteGuideTest() throws Exception {
        MvcResult creationResult = createTestGuide("To Be Deleted", GuideStatus.PUBLISHED);
        long guideId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/guides/" + guideId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/guides/" + guideId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteNonExistingGuideTest() throws Exception {
        long nonExistentId = 9999L;
        mockMvc.perform(delete("/guides/" + nonExistentId))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getAllGuidesTest() throws Exception {
        createTestGuide("Guide 1", GuideStatus.PUBLISHED);
        createTestGuide("Guide 2", GuideStatus.DRAFT);

        mockMvc.perform(get("/guides").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void getAllGuidesEmptyTest() throws Exception {
        mockMvc.perform(get("/guides").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void getGuidesByAuthorTest() throws Exception {
        createTestGuide("Author's Guide", GuideStatus.PUBLISHED);

        mockMvc.perform(get("/guides/author/" + testAuthorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].authorId").value(testAuthorId));
    }

    @Test
    public void getGuidesByAuthorEmptyTest() throws Exception {
        long otherAuthorId = 9999L;
        mockMvc.perform(get("/guides/author/" + otherAuthorId))
                .andExpect(status().isOk());
    }

    @Test
    public void getApprovedGuidesTest() throws Exception {
        createTestGuide("Published Guide", GuideStatus.PUBLISHED);
        createTestGuide("Draft Guide", GuideStatus.DRAFT);

        mockMvc.perform(get("/guides/approved").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void getApprovedGuidesEmptyTest() throws Exception {
        createTestGuide("Draft Guide", GuideStatus.DRAFT);

        mockMvc.perform(get("/guides/approved").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
