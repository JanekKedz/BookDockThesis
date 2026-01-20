package pw.react.backend.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDto {
    private Long id;
    private Long sailorId;
    private Long dockId;
    private LocalDate startDate;
    private LocalDate endDate;
    private int people;
    private String paymentMethod;
    private String paymentStatus;
    private double totalPrice;


}
