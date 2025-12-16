package pw.react.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pw.react.backend.controller.PortController;
import pw.react.backend.models.docks.Port;
import pw.react.backend.services.PortService;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(PortController.class)
@AutoConfigureMockMvc(addFilters = false)
class PortControllerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    PortService portService;

    @Test
    void getPortsByOwnerId_returns_only_owner_ports() throws Exception {
        Long ownerId = 10L;

        Port p1 = new Port();
        p1.setId(1L);
        p1.setOwnerId(ownerId);
        p1.setName("Port A");

        Port p2 = new Port();
        p2.setId(2L);
        p2.setOwnerId(ownerId);
        p2.setName("Port B");

        when(portService.getPortsByOwnerId(ownerId)).thenReturn(List.of(p1, p2));

        mvc.perform(get("/ports/owners/{ownerId}", ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Port A"))
                .andExpect(jsonPath("$[1].name").value("Port B"));

        verify(portService).getPortsByOwnerId(ownerId);
    }

    @Test
    void createPort_returns_201() throws Exception {
        Port created = new Port();
        created.setId(99L);
        created.setName("New Port");

        // controller delegates to service.createPort(PortDto)
        when(portService.createPort(any())).thenReturn(created);

        mvc.perform(post("/ports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "name": "New Port",
                      "location": "Gdansk",
                      "description": "desc",
                      "ownerId": 10,
                      "latitude": 54.35,
                      "longitude": 18.65,
                      "imageIds": []
                    }
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.name").value("New Port"));

        verify(portService).createPort(any());
    }

    @Test
    void approvePort_returns_200() throws Exception {
        Port approved = new Port();
        approved.setId(5L);
        approved.setApproved(true);

        when(portService.approvePort(5L)).thenReturn(approved);

        mvc.perform(put("/ports/{id}/approve", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.approved").value(true));

        verify(portService).approvePort(5L);
    }

    @Test
    void deletePort_returns_204() throws Exception {
        doNothing().when(portService).deletePort(3L);

        mvc.perform(delete("/ports/{id}", 3))
                .andExpect(status().isNoContent());

        verify(portService).deletePort(3L);
    }
}