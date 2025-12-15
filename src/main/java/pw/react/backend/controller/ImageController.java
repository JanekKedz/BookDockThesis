package pw.react.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.models.Images;
import pw.react.backend.services.ImageService;

import java.util.List;

@RestController
@RequestMapping("/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @PostMapping
    public ResponseEntity<Images> createImage(@RequestBody String base64Image) {
        Images createdImage = imageService.createImage(base64Image);
        return ResponseEntity.status(201).body(createdImage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Images> getImageById(@PathVariable Long id) {
        Images image = imageService.getImageById(id);
        return ResponseEntity.ok(image);
    }

    @GetMapping
    public ResponseEntity<List<Images>> getAllImages() {
        List<Images> images = imageService.getAllImages();
        return ResponseEntity.ok(images);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Images> updateImage(@PathVariable Long id, @RequestBody String base64Image) {
        Images updatedImage = imageService.updateImage(id, base64Image);
        return ResponseEntity.ok(updatedImage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}