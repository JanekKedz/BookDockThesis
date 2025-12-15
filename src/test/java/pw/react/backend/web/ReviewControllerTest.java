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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    private long testSailorId;
    private long testDockOwnerId;
    private long testPortId;
    private long testDockingSpotId;

    private Map<String, Object> createApiPayload(String key, Object value) {
        Map<String, Object> payload = new HashMap<>();
        payload.put(key, value);
        return payload;
    }

    @BeforeEach
    void setup() throws Exception {
        // Create a user who will write the review (Sailor)
        UserDto sailorDto = new UserDto(null, "reviewer.test@email.com", "John", "Sailor", "111222333", "johnsailor", Role.SAILOR, "password", false);
        MvcResult sailorResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", sailorDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testSailorId = objectMapper.readTree(sailorResult.getResponse().getContentAsString()).get("id").asLong();

        // Create a user who owns the dock
        UserDto ownerDto = new UserDto(null, "owner.review.test@email.com", "Peter", "Owner", "444555666", "peterowner", Role.DOCK_OWNER, "password", false);
        MvcResult ownerResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", ownerDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testDockOwnerId = objectMapper.readTree(ownerResult.getResponse().getContentAsString()).get("id").asLong();

        // Create a port owned by the dock owner
        PortDto portDto = new PortDto(null, "Test Port for Reviews", "Test City", "Desc", null, this.testDockOwnerId, 00.00, 00.00);
        MvcResult portResult = mockMvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", portDto))))
                .andExpect(status().isCreated())
                .andReturn();
        this.testPortId = objectMapper.readTree(portResult.getResponse().getContentAsString()).get("id").asLong();

        // Create a docking spot to be reviewed
        DockingSpotDto spotDto = new DockingSpotDto(null, "Test Spot for Reviews", "Test Location", "Desc", this.testDockOwnerId, this.testPortId, "image.jpg", 10f, 20f, 30f, true);
        MvcResult spotResult = mockMvc.perform(post("/docking-spots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("docking-spots", spotDto))))
                .andExpect(status().isCreated())
                .andReturn();
        this.testDockingSpotId = objectMapper.readTree(spotResult.getResponse().getContentAsString()).get("id").asLong();
    }

    private MvcResult createTestReview(int rating, String comment) throws Exception {
        ReviewDto reviewDto = new ReviewDto(null, this.testSailorId, this.testDockingSpotId, rating, comment, LocalDate.now());
        return mockMvc.perform(post("/docks/" + this.testDockingSpotId + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDto)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    @Test
    public void createReviewTest() throws Exception {
        ReviewDto reviewDto = new ReviewDto(null, this.testSailorId, this.testDockingSpotId, 5, "Great spot!", LocalDate.now());

        mockMvc.perform(post("/docks/" + this.testDockingSpotId + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDto)))
                .andExpect(status().isCreated());
    }

    @Test
    public void createExistingReviewTest() throws Exception {
        createTestReview(4, "First review");

        ReviewDto duplicateReviewDto = new ReviewDto(null, this.testSailorId, this.testDockingSpotId, 2, "Second try", LocalDate.now());

        mockMvc.perform(post("/docks/" + this.testDockingSpotId + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateReviewDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getReviewByIdTest() throws Exception {
        MvcResult creationResult = createTestReview(5, "Excellent!");
        long reviewId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/docks/" + this.testDockingSpotId + "/reviews/" + reviewId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reviewId))
                .andExpect(jsonPath("$.rating").value(5));
    }

    @Test
    public void getNonExistingReviewByIdTest() throws Exception {
        long nonExistentReviewId = 9999L;
        mockMvc.perform(get("/docks/" + this.testDockingSpotId + "/reviews/" + nonExistentReviewId))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateReviewTest() throws Exception {
        MvcResult creationResult = createTestReview(3, "It was okay.");
        long reviewId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        ReviewDto updatedDto = new ReviewDto(null, null, null, 5, "Actually, it was fantastic!", null);

        mockMvc.perform(put("/docks/" + this.testDockingSpotId + "/reviews/" + reviewId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk());
    }

    @Test
    public void updateNonExistingReviewTest() throws Exception {
        long nonExistentReviewId = 9999L;
        ReviewDto updatedDto = new ReviewDto(null, null, null, 1, "This should fail.", null);

        mockMvc.perform(put("/docks/" + this.testDockingSpotId + "/reviews/" + nonExistentReviewId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void deleteReviewTest() throws Exception {
        MvcResult creationResult = createTestReview(1, "To be deleted.");
        long reviewId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/docks/" + this.testDockingSpotId + "/reviews/" + reviewId))
                .andExpect(status().isOk());
    }

    @Test
    public void deleteNonExistingReviewTest() throws Exception {
        long nonExistentReviewId = 9999L;
        mockMvc.perform(delete("/docks/" + this.testDockingSpotId + "/reviews/" + nonExistentReviewId))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getAllReviewsTest() throws Exception {
        createTestReview(5, "First review");
        createTestReview(4, "Second review from another user"); // Needs another user to be realistic, but works for now

        mockMvc.perform(get("/docks/" + this.testDockingSpotId + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void getAllReviewsEmptyTest() throws Exception {
        // No reviews are created for the testDockingSpotId in this specific test
        mockMvc.perform(get("/docks/" + this.testDockingSpotId + "/reviews"))
                .andExpect(status().isOk());
    }
}
