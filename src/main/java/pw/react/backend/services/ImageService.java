package pw.react.backend.services;

import org.springframework.stereotype.Service;
import pw.react.backend.models.Images;
import pw.react.backend.repositories.ImageRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    public Images createImage(String base64Image) {
        Images image = new Images(base64Image);
        return imageRepository.save(image);
    }

    public Images getImageById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Image with id " + id + " not found."));
    }

    public List<Images> getAllImages() {
        return imageRepository.findAll();
    }

    public Images updateImage(Long id, String base64Image) {
        Optional<Images> existingImage = imageRepository.findById(id);
        if (existingImage.isPresent()) {
            Images image = existingImage.get();
            image.setBase64Image(base64Image);
            return imageRepository.save(image);
        } else {
            throw new IllegalArgumentException("Image with id " + id + " not found.");
        }
    }

    public void deleteImage(Long id) {
        if (imageRepository.existsById(id)) {
            imageRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Image with id " + id + " not found.");
        }
    }
}