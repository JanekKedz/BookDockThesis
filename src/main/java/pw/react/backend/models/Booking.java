package pw.react.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "bookings")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sailor_id", nullable = false)
    private Long sailorId;

    @Column(name = "dock_id", nullable = false)
    private Long dockId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private int people;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;   // e.g. "online", "in-person"

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;   // e.g. "Paid", "Unpaid"

    @Column(name = "total_price", nullable = false)
    private double totalPrice;        // Total price for the booking in cents


}
