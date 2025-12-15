package pw.react.backend.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pw.react.backend.web.ReviewDto;
import pw.react.backend.models.Review;
import pw.react.backend.repositories.ReviewRepository;
import pw.react.backend.services.ReviewService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    private ReviewDto toDto(Review r) {
        return new ReviewDto(
                r.getId(),
                r.getPortId(),
                r.getSailorId(),
                r.getRating(),
                r.getContent(),
                r.getDateOfReview()
        );
    }

    private Review toEntity(ReviewDto dto) {
        Review r = new Review();
        r.setPortId(dto.getPortId());
        r.setSailorId(dto.getSailorId());
        r.setRating(dto.getRating());
        r.setContent(dto.getContent());
        r.setDateOfReview(dto.getDateOfReview() != null
                ? dto.getDateOfReview()
                : LocalDate.now());
        return r;
    }

    @Override
    public ReviewDto createReview(ReviewDto dto) {
        Review saved = reviewRepository.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public List<ReviewDto> getReviewsByPort(Long portId) {
        return reviewRepository.findByPortId(portId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewDto getReviewById(Long id) {
        return reviewRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @Override
    public ReviewDto updateReview(Long id, ReviewDto dto) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        existing.setRating(dto.getRating());
        existing.setContent(dto.getContent());
        // optionally update date or other fields
        Review updated = reviewRepository.save(existing);
        return toDto(updated);
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}
