package pw.react.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.models.docks.Port;
import pw.react.backend.services.PortService;
import pw.react.backend.web.PortDto;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/ports")
public class PortController {

    private final PortService portService;

    public PortController(PortService portService) {
        this.portService = portService;
    }

    @PostMapping
    public ResponseEntity<Port> createPort(@RequestBody PortDto portDto) {
        Port createdPort = portService.createPort(portDto);
        return new ResponseEntity<>(createdPort, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Port> approvePort(@PathVariable Long id) {
        Port approvedPort = portService.approvePort(id);
        return ResponseEntity.ok(approvedPort);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Port> updatePort(@PathVariable Long id, @RequestBody PortDto portDto) {
        Port updatedPort = portService.updatePort(id, portDto);
        return ResponseEntity.ok(updatedPort);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Port> getPortById(@PathVariable Long id) {
        Port port = portService.getPortById(id);
        return ResponseEntity.ok(port);
    }

    @GetMapping
    public ResponseEntity<List<Port>> getAllPorts() {
        return ResponseEntity.ok(portService.getAllPorts());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePort(@PathVariable Long id) {
        portService.deletePort(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/owners/{ownerId}")
    public ResponseEntity<List<Port>> getPortsByOwnerId(@PathVariable Long ownerId) {
//        List<Port> ports = portService.getPortsByOwnerId(ownerId);
        log.info("GET /ports/owners/{}", ownerId);
        List<Port> ports = portService.getPortsByOwnerId(ownerId);
        log.info("Ports returned: {}", ports.size());
        return ResponseEntity.ok(ports);
    }
}