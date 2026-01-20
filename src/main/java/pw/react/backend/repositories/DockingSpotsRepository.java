package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.models.docks.DockingSpots;

import java.util.List;

public interface DockingSpotsRepository extends JpaRepository<DockingSpots, Long> {
    List<DockingSpots> findByPortId(Long portId);
    List<DockingSpots> findByOwnerId(Long ownerId);
}
