package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pw.react.backend.models.Images;

@Repository
public interface ImageRepository extends JpaRepository<Images, Long> {
}