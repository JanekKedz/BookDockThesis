package pw.react.backend.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pw.react.backend.web.GuideDto;
import pw.react.backend.models.Guide;
import pw.react.backend.repositories.GuideRepository;
import pw.react.backend.services.GuideService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import pw.react.backend.models.GuideCategory;
import pw.react.backend.models.GuideStatus;

@Service
public class GuideServiceImpl implements GuideService {

    @Autowired
    private GuideRepository guideRepository;

    private GuideDto toDto(Guide g) {
        return new GuideDto(
                g.getId(),
                g.getTitle(),
                g.getContent(),
                g.getAuthorId(),
                g.getPublicationDate(),
                g.getImageIds(),
                g.getLinks(),
                g.getGuideStatus(),
                g.getGuideCategory()
                //g.getAuthorId()
        );
    }

    private Guide toEntity(GuideDto dto) {
        Guide g = new Guide();
        g.setTitle(dto.getTitle());
        g.setContent(dto.getContent());
        g.setAuthorId(dto.getAuthorId());
        g.setPublicationDate(dto.getPublicationDate() != null
                ? dto.getPublicationDate()
                : LocalDateTime.now());
        g.setImageIds(dto.getImages());
        g.setLinks(dto.getLinks());
        g.setGuideStatus(dto.getGuideStatus());
        g.setGuideCategory(dto.getGuideCategory());
        //g.setApproved(dto.isApproved());
        return g;
    }

    @Override
    public GuideDto createGuide(GuideDto dto) {
        Guide saved = guideRepository.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public List<GuideDto> getAllGuides() {
        return guideRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuideDto> getApprovedGuides() {
        return guideRepository.findByGuideStatus(GuideStatus.PUBLISHED).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuideDto> getGuidesByAuthor(Long authorId) {
        return guideRepository.findByAuthorId(authorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GuideDto getGuideById(Long id) {
        return guideRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
    }

    @Override
    public GuideDto updateGuide(Long id, GuideDto dto) {
        Guide existing = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());
        existing.setImageIds(dto.getImages());
        existing.setLinks(dto.getLinks());
        existing.setGuideStatus(dto.getGuideStatus());
        existing.setGuideCategory(dto.getGuideCategory());
        //existing.setApproved(dto.isApproved());
        Guide updated = guideRepository.save(existing);
        return toDto(updated);
    }

    @Override
    public void deleteGuide(Long id) {
        guideRepository.deleteById(id);
    }

    @Override
    public GuideDto approveGuide(Long id) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        guide.setGuideStatus(GuideStatus.PUBLISHED);
        Guide updated = guideRepository.save(guide);
        return toDto(updated);
    }
}
