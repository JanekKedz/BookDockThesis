package services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pw.react.backend.models.docks.Port;
import pw.react.backend.repositories.PortRepository;
import pw.react.backend.services.PortService;
import pw.react.backend.web.PortDto;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortServiceTest {

    @Mock
    PortRepository portRepository;

    @InjectMocks
    PortService portService;

    @Test
    void getPortsByOwnerId_delegates_to_repository() {
        when(portRepository.findByOwnerId(7L)).thenReturn(List.of(new Port(), new Port()));

        List<Port> out = portService.getPortsByOwnerId(7L);

        assertThat(out).hasSize(2);
        verify(portRepository).findByOwnerId(7L);
        verifyNoMoreInteractions(portRepository);
    }

    @Test
    void updatePort_throws_when_not_found() {
        when(portRepository.findById(123L)).thenReturn(Optional.empty());

        PortDto dto = new PortDto();
        dto.setName("X");

        assertThatThrownBy(() -> portService.updatePort(123L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Port with id 123 not found");

        verify(portRepository).findById(123L);
        verify(portRepository, never()).save(any());
    }

    @Test
    void deletePort_throws_when_not_found() {
        when(portRepository.existsById(55L)).thenReturn(false);

        assertThatThrownBy(() -> portService.deletePort(55L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Port with id 55 not found");

        verify(portRepository).existsById(55L);
        verify(portRepository, never()).deleteById(any());
    }
}