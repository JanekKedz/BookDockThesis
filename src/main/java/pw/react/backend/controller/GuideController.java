package pw.react.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.web.GuideDto;
import pw.react.backend.services.GuideService;

import java.util.List;

@RestController
@RequestMapping("/guides")
public class GuideController {

    @Autowired
    private GuideService guideService;

    @PostMapping
    public ResponseEntity<GuideDto> createGuide(@RequestBody GuideDto dto) {
        GuideDto created = guideService.createGuide(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public List<GuideDto> listAll() {
        return guideService.getAllGuides();
    }

    @GetMapping("/approved")
    public List<GuideDto> listApproved() {
        return guideService.getApprovedGuides();
    }

    @PutMapping("/approve/{guideId}")
    public ResponseEntity<GuideDto> approveGuide(@PathVariable Long guideId) {
        GuideDto approved = guideService.approveGuide(guideId);
        return ResponseEntity.ok(approved);
    }

    @GetMapping("/author/{authorId}")
    public List<GuideDto> listByAuthor(@PathVariable Long authorId) {
        return guideService.getGuidesByAuthor(authorId);
    }

    @GetMapping("/{guideId}")
    public GuideDto getOne(@PathVariable Long guideId) {
        return guideService.getGuideById(guideId);
    }

    @PutMapping("/{guideId}")
    public GuideDto updateGuide(
            @PathVariable Long guideId,
            @RequestBody GuideDto dto) {
        return guideService.updateGuide(guideId, dto);
    }

    @DeleteMapping("/{guideId}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long guideId) {
        guideService.deleteGuide(guideId);
        return ResponseEntity.ok().build();
    }
}
