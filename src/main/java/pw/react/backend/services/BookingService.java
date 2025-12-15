package pw.react.backend.services;

import pw.react.backend.web.BookingDto;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingDto createBooking(BookingDto bookingDto);
    void cancelBooking(Long id);
    List<BookingDto> getAllBookings();
    List<BookingDto> getBookingsBySailor(Long sailorId);
    List<BookingDto> getBookingsByDock(Long dockId);
    BookingDto getBookingById(Long id);
    BookingDto updateBooking(Long id, BookingDto bookingDto);
    void deleteBooking(Long id);
}
