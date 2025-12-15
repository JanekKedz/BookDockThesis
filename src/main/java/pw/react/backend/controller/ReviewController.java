package pw.react.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.web.ReviewDto;
import pw.react.backend.services.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/docks/{dockId}/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @PathVariable("dockId") Long dockId,
            @RequestBody ReviewDto dto) {
        dto.setPortId(dockId);
        ReviewDto created = reviewService.createReview(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public List<ReviewDto> listReviews(@PathVariable("dockId") Long dockId) {
        return reviewService.getReviewsByPort(dockId);
    }

    @GetMapping("/{reviewId}")
    public ReviewDto getReview(
            @PathVariable("dockId") Long dockId,
            @PathVariable("reviewId") Long reviewId) {
        // Could verify dto.getPortId() == dockId if desired
        return reviewService.getReviewById(reviewId);
    }

    @PutMapping("/{reviewId}")
    public ReviewDto updateReview(
            @PathVariable("dockId") Long dockId,
            @PathVariable("reviewId") Long reviewId,
            @RequestBody ReviewDto dto) {
        dto.setPortId(dockId);
        return reviewService.updateReview(reviewId, dto);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable("dockId") Long dockId,
            @PathVariable("reviewId") Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
