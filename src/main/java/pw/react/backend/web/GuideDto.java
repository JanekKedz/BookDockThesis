package pw.react.backend.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pw.react.backend.models.GuideCategory;
import pw.react.backend.models.GuideStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GuideDto {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private LocalDateTime publicationDate;
    private List<String> images;
    private List<String> links;
    private GuideStatus guideStatus;
    private GuideCategory guideCategory;
    // private boolean isApproved;
}
