package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pw.react.backend.models.Guide;
import pw.react.backend.models.GuideStatus;

import java.util.List;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {
    List<Guide> findByAuthorId(Long authorId);
    List<Guide> findByGuideStatus(GuideStatus guideStatus);
}
