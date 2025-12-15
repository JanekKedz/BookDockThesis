package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pw.react.backend.models.Booking;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findBySailorId(Long sailorId);
    List<Booking> findByDockId(Long dockId);
    @Query("""
      SELECT b
        FROM Booking b
       WHERE b.dockId = :dockId
         AND (:startDate <= b.endDate AND :endDate >= b.startDate)
    """)
    List<Booking> findOverlappingBookings(
            @Param("dockId") Long dockId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );
}
