package pw.react.backend.services;

import pw.react.backend.web.ReviewDto;

import java.util.List;

public interface ReviewService {
    ReviewDto createReview(ReviewDto reviewDto);
    List<ReviewDto> getReviewsByPort(Long portId);
    ReviewDto getReviewById(Long id);
    ReviewDto updateReview(Long id, ReviewDto reviewDto);
    void deleteReview(Long id);
}
