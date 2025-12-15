package pw.react.backend.services;

import pw.react.backend.models.docks.DockingSpots;
import pw.react.backend.web.DockingSpotDto;

import java.time.LocalDate;
import java.util.List;

public interface DockingSpotService {

    /**
     * Creates a new docking spot based on the given DTO.
     *
     * @param dockingSpotDto the DTO containing docking spot data
     * @return the created DockingSpots entity
     */
    DockingSpots createDockingSpot(DockingSpotDto dockingSpotDto);

    /**
     * Updates an existing docking spot.
     *
     * @param id             the id of the docking spot to update
     * @param dockingSpotDto the DTO containing updated data
     * @return the updated DockingSpots entity
     */
    DockingSpots updateDockingSpot(Long id, DockingSpotDto dockingSpotDto);

    /**
     * Retrieves a docking spot by its id.
     *
     * @param id the id of the docking spot
     * @return the found DockingSpots entity
     */
    DockingSpots getDockingSpotById(Long id);

    /**
     * Retrieves all docking spots.
     *
     * @return list of DockingSpots entities
     */
    List<DockingSpots> getAllDockingSpots();

    /**
     * Deletes a docking spot by its id.
     *
     * @param id the id of the docking spot to delete
     */
    void deleteDockingSpot(Long id);

    /**
     * Retrieves docking spots associated with a specific port with optional filtering.
     *
     * @param portId the id of the port
     * @param minPrice minimum price filter (optional)
     * @param maxPrice maximum price filter (optional)
     * @param available availability status filter (optional)
     * @param sortBy field to sort results by (optional)
     * @param sortDirection direction of sorting (asc/desc)
     * @return filtered list of DockingSpots entities
     */
    List<DockingSpots> getDockingSpotsByPortId(
            Long portId,
            Double minPrice,
            Double maxPrice,
            Boolean available,
            List<String> services,
            LocalDate startDate,
            LocalDate endDate,
            String sortBy,
            String sortDirection
    );

    /**
     * Retrieves all docking spots owned by a specific owner.
     *
     * @param ownerId the id of the owner
     * @return list of DockingSpots entities owned by the given owner
     */
    List<DockingSpots> getDockingSpotsByOwnerId(Long ownerId);
}
