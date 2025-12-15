package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.models.docks.Port;

import java.util.List;

public interface PortRepository extends JpaRepository<Port, Long> {
    public List<Port> findByOwnerId(Long ownerId);
}
