package pw.react.backend.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private Long portId;
    private Long sailorId;
    private int rating;
    private String content;
    private LocalDate dateOfReview;
}
