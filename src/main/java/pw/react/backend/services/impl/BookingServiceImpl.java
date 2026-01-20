package pw.react.backend.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.web.BookingDto;
import pw.react.backend.models.Booking;
import pw.react.backend.repositories.BookingRepository;
import pw.react.backend.services.BookingService;
import pw.react.backend.models.docks.DockingSpots;

import pw.react.backend.repositories.DockingSpotsRepository;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DockingSpotsRepository dockingSpotsRepository;


    private BookingDto toDto(Booking b) {
        return new BookingDto(
                b.getId(),
                b.getSailorId(),
                b.getDockId(),
                b.getStartDate(),
                b.getEndDate(),
                b.getPeople(),
                b.getPaymentMethod(),
                b.getPaymentStatus(),
                b.getTotalPrice()
        );
    }

    private Booking toEntity(BookingDto dto) {
        Booking b = new Booking();
        b.setSailorId(dto.getSailorId());
        b.setDockId(dto.getDockId());
        b.setStartDate(dto.getStartDate());
        b.setEndDate(dto.getEndDate());
        b.setPeople(dto.getPeople());
        b.setPaymentMethod(dto.getPaymentMethod());
        b.setPaymentStatus(dto.getPaymentStatus());
        b.setTotalPrice(dto.getTotalPrice());
        return b;
    }

    @Override
    @Transactional
    public void cancelBooking(Long id) {
        // 1. Look up the booking
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));

        // 2. Delete it outright
        bookingRepository.delete(existing);

    }

    @Override
    @Transactional
    public BookingDto createBooking(BookingDto dto) {
        // 1. Ensure the dock exists
        Optional<DockingSpots> maybeSpot = dockingSpotsRepository.findById(dto.getDockId());
        if (maybeSpot.isEmpty()) {
            throw new IllegalArgumentException("Docking spot not found: " + dto.getDockId());
        }

        // 2. Check for overlapping bookings on that dock
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                dto.getDockId(),
                dto.getStartDate(),
                dto.getEndDate()
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Docking spot "
                    + dto.getDockId()
                    + " is already booked during "
                    + dto.getStartDate()
                    + " – "
                    + dto.getEndDate());
        }

        // 3. No conflict → save the new booking
        Booking bookingEntity = toEntity(dto);
        Booking savedBooking = bookingRepository.save(bookingEntity);

        // 4. Return the saved booking as a DTO
        return toDto(savedBooking);
    }



    @Override
    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getBookingsBySailor(Long sailorId) {
        return bookingRepository.findBySailorId(sailorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getBookingsByDock(Long dockId) {
        return bookingRepository.findByDockId(dockId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDto getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public BookingDto updateBooking(Long id, BookingDto dto) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setPeople(dto.getPeople());
        existing.setPaymentMethod(dto.getPaymentMethod());
        existing.setPaymentStatus(dto.getPaymentStatus());
        Booking updated = bookingRepository.save(existing);
        return toDto(updated);
    }

    @Override
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}
