package pw.react.backend.services;

import pw.react.backend.web.GuideDto;

import java.util.List;

public interface GuideService {
    GuideDto createGuide(GuideDto guideDto);
    List<GuideDto> getAllGuides();
    List<GuideDto> getApprovedGuides();
    List<GuideDto> getGuidesByAuthor(Long authorId);
    GuideDto getGuideById(Long id);
    GuideDto updateGuide(Long id, GuideDto guideDto);
    void deleteGuide(Long id);
    GuideDto approveGuide(Long id);
}
