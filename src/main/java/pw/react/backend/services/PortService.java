package pw.react.backend.services;

import org.springframework.stereotype.Service;
import pw.react.backend.models.docks.Port;
import pw.react.backend.repositories.PortRepository;
import pw.react.backend.web.PortDto;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PortService {

    private final PortRepository portRepository;

    public PortService(PortRepository portRepository) {
        this.portRepository = portRepository;
    }

    public Port createPort(PortDto portDto) {
        Port port = mapToEntity(portDto);
        return portRepository.save(port);
    }

    public Port updatePort(Long id, PortDto portDto) {
        Optional<Port> existingPort = portRepository.findById(id);
        if (existingPort.isPresent()) {
            Port port = existingPort.get();
            port.setName(portDto.getName());
            port.setLocation(portDto.getLocation());
            port.setDescription(portDto.getDescription());
            port.setLatitude(portDto.getLatitude());
            port.setLongitude(portDto.getLongitude());
            return portRepository.save(port);
        } else {
            throw new IllegalArgumentException("Port with id " + id + " not found.");
        }
    }

    public Port getPortById(Long id) {
        return portRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Port with id " + id + " not found."));
    }

    public List<Port> getAllPorts() {
        return portRepository.findAll();
    }

    public void deletePort(Long id) {
        if (portRepository.existsById(id)) {
            portRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Port with id " + id + " not found.");
        }
    }

    private Port mapToEntity(PortDto portDto) {
        Port port = new Port();
        port.setName(portDto.getName());
        port.setLocation(portDto.getLocation());
        port.setDescription(portDto.getDescription());
        port.setOwnerId(portDto.getOwnerId());
        port.setImageIds(portDto.getImageIds()); // This is crucial
        port.setLatitude(portDto.getLatitude());
        port.setLongitude(portDto.getLongitude());
        return port;
    }
    public Port approvePort(Long id) {
        Port port = getPortById(id);
        port.setApproved(true);
        return portRepository.save(port);
    }

    public List<Port> getPortsByOwnerId(Long ownerId) {
        return portRepository.findByOwnerId(ownerId);
    }
}