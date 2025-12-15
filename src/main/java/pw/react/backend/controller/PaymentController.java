package pw.react.backend.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.models.Booking;
import pw.react.backend.repositories.BookingRepository;
import pw.react.backend.services.StripeService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody PaymentRequest request) throws StripeException {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + request.getBookingId()));

        long amountCents = (long)(booking.getTotalPrice()) * 100; // Convert to cents
        String currency = "pln";

        Map<String, String> metadata = new HashMap<>();
        metadata.put("bookingId", booking.getId().toString());

        PaymentIntent intent = stripeService.createPaymentIntent(amountCents, currency, metadata);

        Map<String, String> responseData = new HashMap<>();
        responseData.put("clientSecret", intent.getClientSecret());
        responseData.put("paymentIntentId", intent.getId());
        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeEvent(
            @RequestHeader("Stripe-Signature") String sigHeader,
            @RequestBody String payload) {
        Event event;
        try {
            event = stripeService.constructEvent(payload, sigHeader);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);
            if (intent != null) {
                String bookingIdStr = intent.getMetadata().get("bookingId");
                if (bookingIdStr != null) {
                    Long bookingId = Long.valueOf(bookingIdStr);
                    bookingRepository.findById(bookingId).ifPresent(booking -> {
                        booking.setPaymentStatus("PAID");
                        bookingRepository.save(booking);
                    });
                }
            }
        }

        return ResponseEntity.ok("Received");
    }


    public static class PaymentRequest {
        private Long bookingId;
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    }
}
