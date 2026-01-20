package pw.react.backend.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.models.Booking;
import pw.react.backend.models.docks.DockingSpots;
import pw.react.backend.web.BookingDto;
import pw.react.backend.services.BookingService;
import pw.react.backend.repositories.BookingRepository;
import pw.react.backend.repositories.DockingSpotsRepository;
import pw.react.backend.services.StripeService;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DockingSpotsRepository dockingSpotsRepository;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(@RequestBody BookingDto dto) {
        // Calculate days between start and end dates
        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days < 1) days = 1; // Minimum 1 day

        // Get price info from docking spot
        DockingSpots dockingSpot = dockingSpotsRepository.findById(dto.getDockId())
            .orElseThrow(() -> new RuntimeException("Docking spot not found"));

        // Calculate total price MODIFIED
        float pricePerNight = dockingSpot.getPricePerNight();
        float pricePerPerson = dockingSpot.getPricePerPerson();
        float priceServices = dockingSpot.getServicesPricing();
        int people = dto.getPeople();
        double totalPrice = (days * pricePerNight) + (days * people * pricePerPerson) + (days * priceServices);

        // Set the calculated price in DTO
        dto.setTotalPrice(totalPrice);

        // Create booking with calculated price
        BookingDto created = bookingService.createBooking(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public List<BookingDto> listAll() {
        return bookingService.getAllBookings();
    }

    @PostMapping("/create-and-pay")
    public ResponseEntity<Map<String,Object>> createBookingAndPayment(@RequestBody BookingDto dto) throws StripeException {
        // Calculate days between start and end dates
        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days < 1) days = 1; // Minimum 1 day

        // Get price info from docking spot
        DockingSpots dockingSpot = dockingSpotsRepository.findById(dto.getDockId())
                .orElseThrow(() -> new RuntimeException("Docking spot not found"));

        // Calculate total price MODIFIED
        float pricePerNight = dockingSpot.getPricePerNight();
        float pricePerPerson = dockingSpot.getPricePerPerson();
        float priceServices = dockingSpot.getServicesPricing();
        int people = dto.getPeople();
            double totalPrice = (days * pricePerNight) + (days * people * pricePerPerson) + (days * priceServices);

        // Set the calculated price in DTO
        dto.setTotalPrice(totalPrice);

        // 1. Save booking with paid=false
        BookingDto savedDto = bookingService.createBooking(dto);
        Long newBookingId = savedDto.getId();

        // 2. Calculate amount  for this booking
        Booking bookingEntity = bookingRepository.findById(newBookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found after save: " + newBookingId));

        // Make sure we have a minimum amount for Stripe
        long amountCents = Math.max((long) (bookingEntity.getTotalPrice() * 100), 50);
        String currency = "pln";

        // 3. Create a PaymentIntent with bookingId in metadata
        Map<String,String> metadata = new HashMap<>();
        metadata.put("bookingId", newBookingId.toString());

        PaymentIntent intent = stripeService.createPaymentIntent(amountCents, currency, metadata);

        // 4. Build response: include booking info + clientSecret
        Map<String,Object> responseBody = new HashMap<>();
        responseBody.put("booking", savedDto);
        responseBody.put("clientSecret", intent.getClientSecret());
        responseBody.put("paymentIntentId", intent.getId());

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/{bookingId}/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> payload) throws StripeException {

        String paymentIntentId = payload.get("paymentIntentId");

        // Verify payment status with Stripe
        PaymentIntent intent = stripeService.retrievePaymentIntent(paymentIntentId);

        if ("succeeded".equals(intent.getStatus())) {
            // Update booking to paid
            BookingDto booking = bookingService.getBookingById(bookingId);
            booking.setPaymentStatus("PAID");
            bookingService.updateBooking(bookingId, booking);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment confirmed");
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment not completed");
            response.put("paymentStatus", intent.getStatus());
            return ResponseEntity.badRequest().body(response);
        }
    }




    @GetMapping("/{bookingId}")
    public BookingDto getOne(@PathVariable Long bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @GetMapping("/sailor/{sailorId}")
    public List<BookingDto> listBySailor(@PathVariable Long sailorId) {
        return bookingService.getBookingsBySailor(sailorId);
    }

    @GetMapping("/dock/{dockId}")
    public List<BookingDto> listByDock(@PathVariable Long dockId) {
        return bookingService.getBookingsByDock(dockId);
    }

    @PutMapping("/{bookingId}")
    public BookingDto updateBooking(
            @PathVariable Long bookingId,
            @RequestBody BookingDto dto) {
        return bookingService.updateBooking(bookingId, dto);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok().build();
    }
}
