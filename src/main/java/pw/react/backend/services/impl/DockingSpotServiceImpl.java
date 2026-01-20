package pw.react.backend.services.impl;

import org.springframework.stereotype.Service;
import pw.react.backend.models.Booking;
import pw.react.backend.models.docks.DockingSpots;
import pw.react.backend.repositories.DockingSpotsRepository;
import pw.react.backend.services.DockingSpotService;
import pw.react.backend.repositories.BookingRepository;
import pw.react.backend.web.DockingSpotDto;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DockingSpotServiceImpl implements DockingSpotService {

    private final DockingSpotsRepository dockingSpotsRepository;
    private final BookingRepository bookingRepository;

    public DockingSpotServiceImpl(DockingSpotsRepository dockingSpotsRepository, BookingRepository bookingRepository) {
        this.dockingSpotsRepository = dockingSpotsRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public DockingSpots createDockingSpot(DockingSpotDto dto) {
        DockingSpots dockingSpot = new DockingSpots();
        dockingSpot.setName(dto.getName());
        dockingSpot.setLocation(dto.getLocation());
        dockingSpot.setDescription(dto.getDescription());
        dockingSpot.setServices(dto.getServices());
        dockingSpot.setServicesPricing(dto.getServicesPricing());
        dockingSpot.setPricePerNight(dto.getPricePerNight());
        dockingSpot.setPricePerPerson(dto.getPricePerPerson());

        // Instead of setting full objects, simply assign the IDs.
        dockingSpot.setOwnerId(dto.getOwnerId());
        dockingSpot.setPortId(dto.getPortId());

        return dockingSpotsRepository.save(dockingSpot);
    }

    @Override
    public DockingSpots updateDockingSpot(Long id, DockingSpotDto dto) {
        DockingSpots dockingSpot = dockingSpotsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Docking spot not found with id: " + id));

        dockingSpot.setName(dto.getName());
        dockingSpot.setLocation(dto.getLocation());
        dockingSpot.setDescription(dto.getDescription());
        dockingSpot.setServices(dto.getServices());
        dockingSpot.setServicesPricing(dto.getServicesPricing());
        dockingSpot.setPricePerNight(dto.getPricePerNight());
        dockingSpot.setPricePerPerson(dto.getPricePerPerson());

        // Update the ID fields if provided.
        if (dto.getOwnerId() != null) {
            dockingSpot.setOwnerId(dto.getOwnerId());
        }
        if (dto.getPortId() != null) {
            dockingSpot.setPortId(dto.getPortId());
        }

        return dockingSpotsRepository.save(dockingSpot);
    }

    @Override
    public DockingSpots getDockingSpotById(Long id) {
        return dockingSpotsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Docking spot not found with id: " + id));
    }

    @Override
    public List<DockingSpots> getAllDockingSpots() {
        return dockingSpotsRepository.findAll();
    }

    @Override
    public void deleteDockingSpot(Long id) {
        if (!dockingSpotsRepository.existsById(id)) {
            throw new RuntimeException("Docking spot not found with id: " + id);
        }
        dockingSpotsRepository.deleteById(id);
    }

   @Override
    public List<DockingSpots> getDockingSpotsByPortId(
        Long portId,
        Double minPrice,
        Double maxPrice,
        Boolean available,
        List<String> services,
        LocalDate startDate,
        LocalDate endDate,
        String sortBy,
        String sortDirection
    ) {
        // Start with all docking spots for this port
        List<DockingSpots> spots = dockingSpotsRepository.findByPortId(portId);

        // Apply filters
        Stream<DockingSpots> filteredSpots = spots.stream();

        // Filter by price range
        if (minPrice != null) {
            filteredSpots = filteredSpots.filter(spot -> spot.getPricePerNight() >= minPrice);
        }

        if (maxPrice != null) {
            filteredSpots = filteredSpots.filter(spot -> spot.getPricePerNight() <= maxPrice);
        }

        // Filter by availability using date interval
        if (available != null && startDate != null && endDate != null) {
            if (available) {
                filteredSpots = filteredSpots.filter(spot -> !hasBookingsInDateRange(spot, startDate, endDate));
            } else {
                filteredSpots = filteredSpots.filter(spot -> hasBookingsInDateRange(spot, startDate, endDate));
            }
        }

        // Filter by services
        if (services != null && !services.isEmpty()) {
            filteredSpots = filteredSpots.filter(spot ->
                spot.getServices() != null &&
                services.stream().allMatch(service ->
                    spot.getServices().contains(service)
                )
            );
        }

        // Apply sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            Comparator<DockingSpots> comparator = switch (sortBy.toLowerCase()) {
                case "price" -> Comparator.comparing(DockingSpots::getPricePerNight);
                default -> null;
            };

            if (comparator != null) {
                if ("desc".equalsIgnoreCase(sortDirection)) {
                    comparator = comparator.reversed();
                }
                filteredSpots = filteredSpots.sorted(comparator);
            }
        }

        return filteredSpots.collect(Collectors.toList());
    }

    @Override
    public List<DockingSpots> getDockingSpotsByOwnerId(Long ownerId) {
        return dockingSpotsRepository.findByOwnerId(ownerId);
    }

    private boolean hasBookingsInDateRange(DockingSpots spot, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return false; // Can't check availability without date range
        }

        // You'll need to add this repository method
        List<Booking> bookings = bookingRepository.findOverlappingBookings(
                spot.getId(), startDate, endDate);
        return !bookings.isEmpty();
    }

}
