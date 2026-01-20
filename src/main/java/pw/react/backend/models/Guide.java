package pw.react.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pw.react.backend.models.user.Role;
import java.util.ArrayList;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "guides")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Guide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content; //description

    @Column(name = "author_id", nullable = false)
    private Long authorId; //createdBy

    @Column(name = "publication_date", nullable = false)
    private LocalDateTime publicationDate;

    @ElementCollection
    @CollectionTable(name = "guide_image_ids", joinColumns = @JoinColumn(name = "guide_id"))
    @Column(name = "image_id")
    private List<String> imageIds = new ArrayList<String>();

    @ElementCollection
    @CollectionTable(name = "guide_links", joinColumns = @JoinColumn(name = "guide_id"))
    @Column(name = "link_url")
    private List<String> links;

    @Column(nullable = false)
    GuideCategory guideCategory = GuideCategory.GUIDE;

    @Column(nullable = false)
    GuideStatus guideStatus = GuideStatus.DRAFT;
}


