package pw.react.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.models.docks.DockingSpots;
import pw.react.backend.services.DockingSpotService;
import pw.react.backend.web.DockingSpotDto;

import org.springframework.format.annotation.DateTimeFormat;


import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/docking-spots")
public class DockingSpotController {

    private final DockingSpotService dockingSpotService;

    public DockingSpotController(DockingSpotService dockingSpotService) {
        this.dockingSpotService = dockingSpotService;
    }

    /**
     * Create a new docking spot.
     *
     * @param dockingSpotDto the data transfer object with docking spot data
     * @return the created DockingSpots entity
     */
    @PostMapping
    public ResponseEntity<DockingSpots> createDockingSpot(@RequestBody DockingSpotDto dockingSpotDto) {
        DockingSpots createdDockingSpot = dockingSpotService.createDockingSpot(dockingSpotDto);
        return new ResponseEntity<>(createdDockingSpot, HttpStatus.CREATED);
    }

    /**
     * Update an existing docking spot by id.
     *
     * @param id the id of the docking spot to update
     * @param dockingSpotDto the DTO with updated docking spot data
     * @return the updated DockingSpots entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<DockingSpots> updateDockingSpot(@PathVariable Long id, @RequestBody DockingSpotDto dockingSpotDto) {
        DockingSpots updatedDockingSpot = dockingSpotService.updateDockingSpot(id, dockingSpotDto);
        return ResponseEntity.ok(updatedDockingSpot);
    }

    /**
     * Retrieve a docking spot by its id.
     *
     * @param id the id of the docking spot
     * @return the found DockingSpots entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<DockingSpots> getDockingSpotById(@PathVariable Long id) {
        DockingSpots dockingSpot = dockingSpotService.getDockingSpotById(id);
        return ResponseEntity.ok(dockingSpot);
    }

    /**
     * Retrieve all docking spots.
     *
     * @return list of all DockingSpots entities
     */
    @GetMapping
    public ResponseEntity<List<DockingSpots>> getAllDockingSpots() {
        List<DockingSpots> dockingSpots = dockingSpotService.getAllDockingSpots();
        return ResponseEntity.ok(dockingSpots);
    }

    /**
     * Get docking spots by port id.
     * * @param portId the id of the port
     * @return list of DockingSpots entities associated with the port
     */
    @GetMapping("/port/{portId}")
    public ResponseEntity<List<DockingSpots>> getDockingSpotsByPortId(
            @PathVariable Long portId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) List<String> services,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection
    ) {
        List<DockingSpots> dockingSpots = dockingSpotService.getDockingSpotsByPortId(
                portId, minPrice, maxPrice, available, services, startDate, endDate, sortBy, sortDirection
        );
        return ResponseEntity.ok(dockingSpots);
    }
    /**
     * Get docking spots by owner id.
     *
     * @param ownerId the id of the owner
     * @return list of DockingSpots entities owned by the owner
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<DockingSpots>> getDockingSpotsByOwnerId(@PathVariable Long ownerId) {
        List<DockingSpots> dockingSpots = dockingSpotService.getDockingSpotsByOwnerId(ownerId);
        return ResponseEntity.ok(dockingSpots);
    }
}

/**
 * Retrieve all docking spots.
 *
 * @return list of all DockingSpots entities
 */
