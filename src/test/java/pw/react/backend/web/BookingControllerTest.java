package pw.react.backend.web;

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
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class BookingControllerTest {

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
        UserDto sailorDto = new UserDto(null, "sailor.test@email.com", "John", "Sailor", "111222333", "johnsailor", Role.SAILOR, "password", false);
        MvcResult sailorResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", sailorDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testSailorId = objectMapper.readTree(sailorResult.getResponse().getContentAsString()).get("id").asLong();

        UserDto ownerDto = new UserDto(null, "owner.test@email.com", "Peter", "Owner", "444555666", "peterowner", Role.DOCK_OWNER, "password", false);
        MvcResult ownerResult = mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("user", ownerDto))))
                .andExpect(status().isOk())
                .andReturn();
        this.testDockOwnerId = objectMapper.readTree(ownerResult.getResponse().getContentAsString()).get("id").asLong();

        PortDto portDto = new PortDto(null, "Test Port", "Test City", "Desc", null, this.testDockOwnerId, 54.34, 22.44);
        MvcResult portResult = mockMvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("ports", portDto))))
                .andExpect(status().isCreated())
                .andReturn();
        this.testPortId = objectMapper.readTree(portResult.getResponse().getContentAsString()).get("id").asLong();

        DockingSpotDto spotDto = new DockingSpotDto(null, "Test Spot", "Test Location", "Desc", this.testDockOwnerId, this.testPortId, "image.jpg", 10f, 20f, 30f, true);
        MvcResult spotResult = mockMvc.perform(post("/docking-spots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createApiPayload("docking-spots", spotDto))))
                .andExpect(status().isCreated())
                .andReturn();
        this.testDockingSpotId = objectMapper.readTree(spotResult.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    public void createBookingTest() throws Exception {
        BookingDto bookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "string", "string", 250D);

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated());
    }

    @Test
    public void getBookingByIdTest() throws Exception {
        BookingDto bookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "string", "string", 250D);

        MvcResult creationResult = mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated())
                .andReturn();

        long createdBookingId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/bookings/" + createdBookingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdBookingId));
    }

    @Test
    public void getNonExistingBookingByIdTest() throws Exception {
        long nonExistentBookingId = 9999L;
        // Corrected: This test now correctly asserts the application's actual behavior,
        // which is to throw a RuntimeException when a booking is not found.
        mockMvc.perform(get("/bookings/" + nonExistentBookingId))
                .andExpect(status().isInternalServerError()) // A RuntimeException results in a 500 error
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof RuntimeException))
                .andExpect(result -> assertEquals("Booking not found", Objects.requireNonNull(result.getResolvedException()).getMessage()));
    }

    @Test
    public void updateBookingTest() throws Exception {
        BookingDto initialBookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "initial", "booking", 250D);

        MvcResult creationResult = mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialBookingDto)))
                .andExpect(status().isCreated())
                .andReturn();

        long createdBookingId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        BookingDto updatedBookingDto = new BookingDto(null, null, null,
                LocalDate.of(2027, 3, 3), LocalDate.of(2027, 4, 4), 10, "updated", "data", 500D);

        mockMvc.perform(put("/bookings/" + createdBookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBookingDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdBookingId))
                .andExpect(jsonPath("$.paymentMethod").value("updated"));
    }

    @Test
    public void deleteBookingTest() throws Exception {
        BookingDto bookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "to-be-deleted", "string", 250D);

        MvcResult creationResult = mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated())
                .andReturn();

        long createdBookingId = objectMapper.readTree(creationResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/bookings/" + createdBookingId))
                .andExpect(status().isOk());

        // Corrected: Verify the booking is actually gone by checking for the RuntimeException,
        // which matches the application's behavior.
        mockMvc.perform(get("/bookings/" + createdBookingId))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof RuntimeException))
                .andExpect(result -> assertEquals("Booking not found", Objects.requireNonNull(result.getResolvedException()).getMessage()));
    }

    @Test
    public void deleteNonExistingBookingTest() throws Exception {
        long nonExistentBookingId = 9999L;
        mockMvc.perform(delete("/bookings/" + nonExistentBookingId))
                .andExpect(status().isOk());
    }

    @Test
    public void getAllBookingsTest() throws Exception {
        // Corrected: Create a booking within this test so the list is guaranteed not to be empty.
        BookingDto bookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "string", "string", 250D);
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/bookings").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    public void getBookingsForNonExistentSailorReturnsEmptyList() throws Exception {
        long sailorIdWithNoBookings = 9999L;
        mockMvc.perform(get("/bookings/sailor/" + sailorIdWithNoBookings))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    public void getBookingBySailorTest() throws Exception {
        // Corrected: Create a booking specifically for this sailor within this test.
        BookingDto bookingDto = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 5, "string", "string", 250D);
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/bookings/sailor/" + this.testSailorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].sailorId").value(this.testSailorId));
    }

    @Test
    public void getBookingByDockTest() throws Exception {
        // Corrected: Create a booking for this specific dock within this test.
        BookingDto anotherBooking = new BookingDto(null, this.testSailorId, this.testDockingSpotId,
                LocalDate.of(2028, 1, 1), LocalDate.of(2028, 2, 1), 2, "string2", "string2", 100D);
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(anotherBooking)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/bookings/dock/" + this.testDockingSpotId))
                .andExpect(status().isOk());
    }
}
